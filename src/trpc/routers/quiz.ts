// src/server/routers/quiz.ts
import { z } from "zod";
import { db } from "@/db";
import {
  aptitudeQuizzes,
  quizQuestions,
  quizSubmissions,
  quizAnswers,
} from "@/db/quiz";
import { createTRPCRouter, baseProcedure } from "../init";
import { eq, and, inArray, asc, desc } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { mockQuizzes } from "@/db/mock";

// ---------- Input Schemas ----------
const getActiveQuizInput = z.object({
  forLevel: z.enum(["CLASS_10", "CLASS_12", "ANY"]).optional().default("ANY"),
});

const submitQuizInput = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().min(0).max(3),
    })
  ),
});

const getSubmissionDetailInput = z.object({
  submissionId: z.string(),
});

// ---------- Helpers ----------
type AnswerDTO = { questionId: string; selectedOptionIndex: number };
type QuestionRow = {
  id: string;
  topicTag: string | null;
  // weight etc. may exist, but we only need topicTag here
};

function calculateRIASECTraits(
  answers: AnswerDTO[],
  questions: QuestionRow[]
) {
  const traits: Record<string, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  answers.forEach((answer) => {
    const q = questions.find((qq) => qq.id === answer.questionId);
    if (!q || !q.topicTag) return;
    if (!["R", "I", "A", "S", "E", "C"].includes(q.topicTag)) return;

    // 0–3 scale → directly add; you can scale/weight later if needed
    traits[q.topicTag] += answer.selectedOptionIndex;
  });

  return traits;
}

function suggestStreams(traits: Record<string, number>) {
  const sorted = Object.entries(traits).sort(([, a], [, b]) => b - a);
  const [top] = sorted;

  const suggestions: string[] = [];
  const total = Object.values(traits).reduce((s, x) => s + x, 0);

  if (top) {
    const [t] = top;
    if (t === "I" || t === "R") suggestions.push("SCIENCE");
    if (t === "C" || t === "E") suggestions.push("COMMERCE");
    if (t === "A" || t === "S") suggestions.push("ARTS");
  }
  if (total < 20) suggestions.push("VOCATIONAL");

  const weakTopics = sorted
    .slice(-2)
    .map(([k]) => k)
    .filter(Boolean);

  return { suggestions, weakTopics };
}

// ===================================================================

export const quizRouter = createTRPCRouter({
  // ---------- Get active quiz with questions ----------
  getActiveQuiz: baseProcedure
    .input(getActiveQuizInput)
    .query(async ({ input }) => {
      try {
        // 🔑 Allow fallback to "ANY" so UI never gets null if a level-specific quiz isn't present
        const rows = await db
          .select()
          .from(aptitudeQuizzes)
          .where(
            and(
              eq(aptitudeQuizzes.isActive, true),
              inArray(aptitudeQuizzes.forLevel, [input.forLevel, "ANY"] as const)
            )
          )
          .orderBy(desc(aptitudeQuizzes.createdAt)) // newest active wins
          .limit(1);

        if (rows.length === 0) {
          return null;
        }

        const quiz = rows[0];

        const questions = await db
          .select({
            id: quizQuestions.id,
            orderIndex: quizQuestions.orderIndex,
            text: quizQuestions.text,
            options: quizQuestions.options,
            topicTag: quizQuestions.topicTag,
            weight: quizQuestions.weight,
            correctOptionIndex: quizQuestions.correctOptionIndex,
          })
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz.id))
          .orderBy(asc(quizQuestions.orderIndex));

        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          forLevel: quiz.forLevel,
          questions,
        };
      } catch (error) {
        console.error("Database error in getActiveQuiz:", error);
        console.log("🔄 Falling back to mock data for development");

        if (input.forLevel === "CLASS_10") return mockQuizzes.CLASS_10;
        if (input.forLevel === "CLASS_12") return mockQuizzes.CLASS_12;
        return mockQuizzes.CLASS_10;
      }
    }),

  // ---------- Submit quiz answers ----------
  submitQuiz: baseProcedure
    .input(submitQuizInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const studentId = ctx.userId || "user_123"; // temporary fallback

        // Rate limit: 3 submissions / 15 min
        const rl = checkRateLimit(
          `quiz_submit_${studentId}`,
          3,
          15 * 60 * 1000
        );
        if (!rl.allowed) {
          throw new Error(
            `Rate limit exceeded. Please wait ${Math.ceil(
              (rl.resetTime - Date.now()) / 60000
            )} minutes before submitting again.`
          );
        }

        // Validate quiz
        const quiz = await db
          .select()
          .from(aptitudeQuizzes)
          .where(eq(aptitudeQuizzes.id, input.quizId))
          .limit(1);

        if (quiz.length === 0) throw new Error("Quiz not found");

        const questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, input.quizId));

        // Create submission
        const [submission] = await db
          .insert(quizSubmissions)
          .values({
            quizId: input.quizId,
            studentId,
          })
          .returning();

        // Score objective & accumulate answers
        let objectiveScore = 0;
        let totalObjective = 0;
        const answersToInsert: {
          submissionId: string;
          questionId: string;
          selectedOptionIndex: number;
          isCorrect: boolean | null;
        }[] = [];

        for (const ans of input.answers) {
          const q = questions.find((qq) => qq.id === ans.questionId);
          if (!q) continue;

          let isCorrect: boolean | null = null;
          if (q.correctOptionIndex !== null && q.correctOptionIndex !== undefined) {
            isCorrect = ans.selectedOptionIndex === q.correctOptionIndex;
            if (isCorrect) objectiveScore += q.weight ?? 1;
            totalObjective++;
          }

          answersToInsert.push({
            submissionId: submission.id,
            questionId: ans.questionId,
            selectedOptionIndex: ans.selectedOptionIndex,
            isCorrect,
          });
        }

        if (answersToInsert.length) {
          await db.insert(quizAnswers).values(answersToInsert);
        }

        // RIASEC traits & streams
        const traits = calculateRIASECTraits(
          input.answers,
          questions.map((q) => ({ id: q.id, topicTag: q.topicTag }))
        );
        const { suggestions, weakTopics } = suggestStreams(traits);

        const finalScore = totalObjective > 0 ? objectiveScore : null;

        await db
          .update(quizSubmissions)
          .set({
            score: finalScore,
            rawTraits: traits,
          })
          .where(eq(quizSubmissions.id, submission.id));

        return {
          submissionId: submission.id,
          score: finalScore,
          traits,
          suggestedStreams: suggestions,
          weakTopics,
        };
      } catch (error) {
        console.error("Database error in submitQuiz:", error);
        console.log("🔄 Falling back to mock submission for development");

        const mockQuiz = input.quizId.includes("class-10")
          ? mockQuizzes.CLASS_10
          : mockQuizzes.CLASS_12;

        const mockTraits = calculateRIASECTraits(
          input.answers,
          mockQuiz.questions as any
        );
        const { suggestions, weakTopics } = suggestStreams(mockTraits);

        return {
          submissionId: `mock-submission-${Date.now()}`,
          score: null,
          traits: mockTraits,
          suggestedStreams: suggestions,
          weakTopics,
        };
      }
    }),

  // ---------- Get my submissions ----------
  getMySubmissions: baseProcedure.query(async ({ ctx }) => {
    try {
      const studentId = ctx.userId || "user_123";

      const submissions = await db
        .select({
          id: quizSubmissions.id,
          quizId: quizSubmissions.quizId,
          createdAt: quizSubmissions.createdAt,
          score: quizSubmissions.score,
        })
        .from(quizSubmissions)
        .where(eq(quizSubmissions.studentId, studentId))
        .orderBy(desc(quizSubmissions.createdAt));

      return submissions;
    } catch (error) {
      console.error("Database error in getMySubmissions:", error);
      console.log("🔄 Falling back to mock submissions for development");

      return [
        {
          id: "mock-submission-1",
          quizId: "mock-quiz-1",
          createdAt: new Date(),
          score: null,
        },
      ];
    }
  }),

  // ---------- Get detailed submission ----------
  getSubmissionDetail: baseProcedure
    .input(getSubmissionDetailInput)
    .query(async ({ input, ctx }) => {
      try {
        const studentId = ctx.userId || "user_123";

        const submission = await db
          .select()
          .from(quizSubmissions)
          .where(
            and(
              eq(quizSubmissions.id, input.submissionId),
              eq(quizSubmissions.studentId, studentId)
            )
          )
          .limit(1);

        if (submission.length === 0) {
          throw new Error("Submission not found");
        }

        const answers = await db
          .select({
            id: quizAnswers.id,
            questionId: quizAnswers.questionId,
            selectedOptionIndex: quizAnswers.selectedOptionIndex,
            isCorrect: quizAnswers.isCorrect,
          })
          .from(quizAnswers)
          .where(eq(quizAnswers.submissionId, input.submissionId));

        return {
          ...submission[0],
          answers,
        };
      } catch (error) {
        console.error("Database error in getSubmissionDetail:", error);
        console.log("🔄 Falling back to mock submission detail for development");

        const mockQuiz = input.submissionId.includes("class-10")
          ? mockQuizzes.CLASS_10
          : mockQuizzes.CLASS_12;

        const mockAnswers = (mockQuiz.questions as any[]).map((q, i) => ({
          id: `mock-answer-${i}`,
          questionId: q.id,
          selectedOptionIndex: 0,
          isCorrect: null,
        }));

        return {
          id: input.submissionId,
          quizId: "mock-quiz-1",
          studentId: "user_123",
          createdAt: new Date(),
          score: null,
          rawTraits: { R: 2, I: 1, A: 3, S: 2, E: 1, C: 2 },
          answers: mockAnswers,
        };
      }
    }),
});

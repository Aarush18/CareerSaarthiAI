import { z } from "zod";
import { db } from "@/db";
import { 
  aptitudeQuizzes, 
  quizQuestions, 
  quizSubmissions, 
  quizAnswers 
} from "@/db/quiz";
import { createTRPCRouter, baseProcedure } from "../init";
import { eq, and, desc } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { mockQuizzes } from "@/db/mock";

// Input validation schemas
const getActiveQuizInput = z.object({
  forLevel: z.enum(['CLASS_10', 'CLASS_12', 'ANY']).optional().default('ANY'),
});

const submitQuizInput = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionIndex: z.number().min(0).max(3),
  })),
});

const getSubmissionDetailInput = z.object({
  submissionId: z.string(),
});

// Helper function to calculate RIASEC traits
function calculateRIASECTraits(answers: Array<{ questionId: string; selectedOptionIndex: number }>, questions: any[]) {
  const traits: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && ['R', 'I', 'A', 'S', 'E', 'C'].includes(question.topicTag)) {
      const weight = answer.selectedOptionIndex; // 0-3 scale
      traits[question.topicTag] += weight;
    }
  });
  
  return traits;
}

// Helper function to suggest streams based on traits
function suggestStreams(traits: Record<string, number>) {
  const sortedTraits = Object.entries(traits)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);
  
  const [topTrait, secondTrait] = sortedTraits;
  const suggestions: string[] = [];
  const weakTopics: string[] = [];
  
  // Map RIASEC combinations to stream suggestions
  if (topTrait[0] === 'I' || topTrait[0] === 'R') {
    suggestions.push('SCIENCE');
  }
  if (topTrait[0] === 'C' || topTrait[0] === 'E') {
    suggestions.push('COMMERCE');
  }
  if (topTrait[0] === 'A' || topTrait[0] === 'S') {
    suggestions.push('ARTS');
  }
  
  // If low scores across all traits, suggest vocational
  const totalScore = Object.values(traits).reduce((sum, score) => sum + score, 0);
  if (totalScore < 20) {
    suggestions.push('VOCATIONAL');
  }
  
  // Identify weak topics (lowest scoring traits)
  const weakTraits = Object.entries(traits)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 2)
    .map(([trait]) => trait);
  
  weakTopics.push(...weakTraits);
  
  return { suggestions, weakTopics };
}

export const quizRouter = createTRPCRouter({
  // Get active quiz with questions
  getActiveQuiz: baseProcedure
    .input(getActiveQuizInput)
    .query(async ({ input }) => {
      try {
        const quiz = await db
          .select()
          .from(aptitudeQuizzes)
          .where(
            and(
              eq(aptitudeQuizzes.isActive, true),
              eq(aptitudeQuizzes.forLevel, input.forLevel)
            )
          )
          .limit(1);

        if (quiz.length === 0) {
          return null;
        }

        const questions = await db
          .select({
            id: quizQuestions.id,
            orderIndex: quizQuestions.orderIndex,
            text: quizQuestions.text,
            options: quizQuestions.options,
            topicTag: quizQuestions.topicTag,
            weight: quizQuestions.weight,
          })
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz[0].id))
          .orderBy(quizQuestions.orderIndex);

        return {
          id: quiz[0].id,
          title: quiz[0].title,
          description: quiz[0].description,
          forLevel: quiz[0].forLevel,
          questions,
        };
      } catch (error) {
        console.error('Database error in getActiveQuiz:', error);
        console.log('🔄 Falling back to mock data for development');
        
        // Return mock data for development when database is not available
        if (input.forLevel === 'CLASS_10') {
          return mockQuizzes.CLASS_10;
        }
        if (input.forLevel === 'CLASS_12') {
          return mockQuizzes.CLASS_12;
        }
        // Fallback to CLASS_10 for ANY level
        return mockQuizzes.CLASS_10;
        
        throw new Error('Database connection failed. Please check your DATABASE_URL environment variable.');
      }
    }),

  // Submit quiz answers
  submitQuiz: baseProcedure
    .input(submitQuizInput)
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Replace with proper auth context when available
        const studentId = ctx.userId || 'user_123'; // Temporary fallback
        
        // Rate limiting: max 3 submissions per 15 minutes per user
        const rateLimit = checkRateLimit(`quiz_submit_${studentId}`, 3, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
          throw new Error(`Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 60000)} minutes before submitting again.`);
        }
      
      // Get quiz and questions for validation
      const quiz = await db
        .select()
        .from(aptitudeQuizzes)
        .where(eq(aptitudeQuizzes.id, input.quizId))
        .limit(1);

      if (quiz.length === 0) {
        throw new Error('Quiz not found');
      }

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

      // Process answers and calculate scores
      let objectiveScore = 0;
      let totalObjectiveQuestions = 0;
      const answersToInsert = [];

      for (const answer of input.answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        let isCorrect = null;
        if (question.correctOptionIndex !== null) {
          isCorrect = answer.selectedOptionIndex === question.correctOptionIndex;
          if (isCorrect) {
            objectiveScore += question.weight;
          }
          totalObjectiveQuestions++;
        }

        answersToInsert.push({
          submissionId: submission.id,
          questionId: answer.questionId,
          selectedOptionIndex: answer.selectedOptionIndex,
          isCorrect,
        });
      }

      // Insert all answers
      await db.insert(quizAnswers).values(answersToInsert);

      // Calculate RIASEC traits
      const traits = calculateRIASECTraits(input.answers, questions);
      
      // Get stream suggestions
      const { suggestions, weakTopics } = suggestStreams(traits);

      // Update submission with scores and traits
      const finalScore = totalObjectiveQuestions > 0 ? objectiveScore : null;
      
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
        console.error('Database error in submitQuiz:', error);
        console.log('🔄 Falling back to mock submission for development');
        
        // Return mock submission data for development when database is not available
        // Determine which mock quiz to use based on the quiz ID
        const mockQuiz = input.quizId.includes('class-10') ? mockQuizzes.CLASS_10 : mockQuizzes.CLASS_12;
        const mockTraits = calculateRIASECTraits(input.answers, mockQuiz.questions);
        const { suggestions, weakTopics } = suggestStreams(mockTraits);
        
        return {
          submissionId: `mock-submission-${Date.now()}`,
          score: null, // No objective questions in mock data
          traits: mockTraits,
          suggestedStreams: suggestions,
          weakTopics,
        };
      }
    }),

  // Get user's quiz submissions
  getMySubmissions: baseProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Replace with proper auth context when available
        const studentId = ctx.userId || 'user_123'; // Temporary fallback
        
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
        console.error('Database error in getMySubmissions:', error);
        console.log('🔄 Falling back to mock submissions for development');
        
        // Return mock submissions for development
        return [
          {
            id: 'mock-submission-1',
            quizId: 'mock-quiz-1',
            createdAt: new Date(),
            score: null,
          }
        ];
      }
    }),

  // Get detailed submission with answers
  getSubmissionDetail: baseProcedure
    .input(getSubmissionDetailInput)
    .query(async ({ input, ctx }) => {
      try {
        // TODO: Replace with proper auth context when available
        const studentId = ctx.userId || 'user_123'; // Temporary fallback
        
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
          throw new Error('Submission not found');
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
        console.error('Database error in getSubmissionDetail:', error);
        console.log('🔄 Falling back to mock submission detail for development');
        
        // Return mock submission detail for development
        // Determine which mock quiz to use based on the submission ID
        const mockQuiz = input.submissionId.includes('class-10') ? mockQuizzes.CLASS_10 : mockQuizzes.CLASS_12;
        const mockAnswers = mockQuiz.questions.map((q, index) => ({
          id: `mock-answer-${index}`,
          questionId: q.id,
          selectedOptionIndex: 0, // Default to first option
          isCorrect: null,
        }));
        
        return {
          id: input.submissionId,
          quizId: 'mock-quiz-1',
          studentId: 'user_123',
          createdAt: new Date(),
          score: null,
          rawTraits: { R: 2, I: 1, A: 3, S: 2, E: 1, C: 2 },
          answers: mockAnswers,
        };
      }
    }),
});

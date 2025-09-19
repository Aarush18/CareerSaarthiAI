import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { quizSubmissions } from "./schema.submission";
import { quizQuestions } from "./schema.question";

export const quizAnswers = pgTable("quiz_answers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  submissionId: text("submission_id")
    .notNull()
    .references(() => quizSubmissions.id, { onDelete: "restrict" }),
  questionId: text("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "restrict" }),
  selectedOptionIndex: integer("selected_option_index").notNull(),
  isCorrect: boolean("is_correct"), // null for psychometric questions
});

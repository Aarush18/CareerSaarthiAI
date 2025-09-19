import { pgTable, text, timestamp, integer, jsonb, varchar, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { aptitudeQuizzes } from "./schema.quiz";

export const questionTopicEnum = pgEnum('question_topic', [
  'numerical', 'verbal', 'logical', 'spatial', // Aptitude topics
  'R', 'I', 'A', 'S', 'E', 'C' // RIASEC interest types
]);

export const quizQuestions = pgTable("quiz_questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  quizId: text("quiz_id")
    .notNull()
    .references(() => aptitudeQuizzes.id, { onDelete: "restrict" }),
  orderIndex: integer("order_index").notNull(),
  text: text("text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(), // Array of 4 options
  correctOptionIndex: integer("correct_option_index"), // null for psychometric questions
  topicTag: varchar("topic_tag", { length: 64 }).notNull(),
  weight: integer("weight").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

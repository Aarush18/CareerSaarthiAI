import { pgTable, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { aptitudeQuizzes } from "./schema.quiz";
import { user } from "../schema";

export const quizSubmissions = pgTable("quiz_submissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  quizId: text("quiz_id")
    .notNull()
    .references(() => aptitudeQuizzes.id, { onDelete: "restrict" }),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  score: integer("score"), // null if no objective questions
  rawTraits: jsonb("raw_traits").$type<Record<string, number>>(), // RIASEC counters: { R: 5, I: 2, ... }
}, (table) => ({
  studentIdIdx: index("quiz_submissions_student_id_idx").on(table.studentId),
  quizIdIdx: index("quiz_submissions_quiz_id_idx").on(table.quizId),
}));

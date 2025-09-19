import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const aptitudeQuizLevelEnum = pgEnum('aptitude_quiz_level', ['CLASS_10', 'CLASS_12', 'ANY']);

export const aptitudeQuizzes = pgTable("aptitude_quizzes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  forLevel: aptitudeQuizLevelEnum("for_level").notNull().default('ANY'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

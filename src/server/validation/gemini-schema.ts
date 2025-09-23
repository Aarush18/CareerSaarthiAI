import { z } from "zod";

export const EarningsSchema = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});

export const DemandSchema = z.object({
  level: z.enum(["High", "Medium", "Low"]),
  justification: z.string().min(1),
});

export const ProfessionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  whyRecommended: z.string().min(1),
  stepsToEnter: z.array(z.string().min(1)).min(3).max(6),
  skills: z.array(z.string().min(1)).min(1),
  approxEarningsINRPerYear: EarningsSchema,
  demandIndia: DemandSchema,
});

export const SubFieldSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  professions: z.array(ProfessionSchema).min(1),
});

export const GeminiOutputSchema = z.object({
  careerPathTitle: z.string().min(1),
  summary: z.string().min(1),
  topCodes: z.array(z.enum(["R", "I", "A", "S", "E", "C"])).min(2).max(3),
  subFields: z.array(SubFieldSchema).min(1),
  nextSteps: z.string().min(1),
});

export type GeminiOutput = z.infer<typeof GeminiOutputSchema>;



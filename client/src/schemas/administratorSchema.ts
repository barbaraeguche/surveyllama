import type {
  BaseQuestion,
  CheckboxQuestion,
  MultipleChoiceQuestion,
  RatingScaleQuestion,
  ShortAnswerQuestion,
  Survey
} from "@/lib/definitions";
import { SURVEY_QUESTION_TYPES } from "@/utils/constants";
import { z, ZodType } from "zod";

export const createSurveySchema = z.object({
  title: z.string().min(2, "The title is required"),
  description: z.string().min(2, "The description is required"),
  expiryDate: z.string()
    .refine((val) => {
      return new Date(val).getTime() > Date.now();
    }, "The expiry date must be in the future"),
}) satisfies ZodType<Partial<Survey>>;


const baseQuestionSchema = z.object({
  type: z.enum(SURVEY_QUESTION_TYPES),
  text: z.string().min(2, "The question is required"),
  required: z.boolean().default(false),
}) satisfies ZodType<Partial<BaseQuestion>>;

const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z.array(z.string()).min(2, "Should have at least two choice"),
}) satisfies ZodType<Partial<MultipleChoiceQuestion>>;
const shortAnswerQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("short_answer"),
  maxLength: z.number().optional(),
}) satisfies ZodType<Partial<ShortAnswerQuestion>>;
const checkboxQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("checkbox"),
  options: z.array(z.string()).min(2, "Should have at least two choice"),
}) satisfies ZodType<Partial<CheckboxQuestion>>;
const ratingScaleQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("rating_scale"),
  minValue: z.number(),
  maxValue: z.number(),
}) satisfies ZodType<Partial<RatingScaleQuestion>>;

export const addQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  shortAnswerQuestionSchema,
  checkboxQuestionSchema,
  ratingScaleQuestionSchema,
]);

// schema types
export type CreateSurveySchemaType = z.infer<typeof createSurveySchema>;
export type AddQuestionSchemaType = z.infer<typeof addQuestionSchema>;
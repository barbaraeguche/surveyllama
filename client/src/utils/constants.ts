export const QuestionTypeConst = {
  MultipleChoice: "multiple_choice",
  ShortAnswer: "short_answer",
  Checkbox: "checkbox",
  RatingScale: "rating_scale",
} as const;

// derive union type from the values
export type QuestionType = typeof QuestionTypeConst[keyof typeof QuestionTypeConst];
// derive an array from the values
export const SURVEY_QUESTION_TYPES = Object.values(QuestionTypeConst);
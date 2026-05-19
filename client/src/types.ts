export type QuestionType = "multiple_choice" | "short_answer" | "checkbox" | "rating";
export type QuestionDisplayOrder = "sequential" | "random";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  admin_id?: string;
  // whether the current viewer can preview this survey without an invite token
  viewer_can_preview?: boolean;
  title: string;
  description: string;
  expiry_date: string;
  is_published: boolean;
  created_at: string;
  questions?: Question[];
  settings?: SurveySettings;
}

// configurable behavior for a survey
export interface SurveySettings {
  is_anonymous: boolean;
  display_order: QuestionDisplayOrder;
  thank_you_message: string;
}

// payload used to create or update a survey
export interface SurveyUpsertPayload {
  title: string;
  description: string;
  expiry_date: string;
  questions: Question[];
  settings: SurveySettings;
}

// a single response count entry for analytics trend charts
export interface AnalyticsTrend {
  date: string;
  count: number;
}

// date range presets supported by the analytics page
export type AnalyticsDateRange = "7d" | "30d" | "all" | "custom";

export type AnalyticsAnswer = string | number | string[];
export interface AnalyticsQuestion extends Question {
  data: AnalyticsAnswer[];
}

export interface SurveyAnalytics {
  survey: Survey;
  questions: AnalyticsQuestion[];
  totalResponses: number;
  trends: AnalyticsTrend[];
}
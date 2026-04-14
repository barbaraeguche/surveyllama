/**
 * supported question types in a survey.
 */
export type QuestionType = 'multiple_choice' | 'short_answer' | 'checkbox' | 'rating';

/** supported display orders for survey questions. */
export type QuestionDisplayOrder = 'sequential' | 'random';

/**
 * represents a single question in a survey.
 */
export interface Question {
  /** unique identifier for the question. */
  id: string;
  /** the type of question (e.g., multiple choice, short answer). */
  type: QuestionType;
  /** the question text displayed to the user. */
  text: string;
  /** list of options for multiple choice or checkbox questions. */
  options: string[];
  /** whether the question is mandatory. */
  required: boolean;
}

/**
 * represents a survey created by an admin.
 */
export interface Survey {
  /** unique identifier for the survey. */
  id: string;
  /** the title of the survey. */
  title: string;
  /** a brief description of the survey's purpose. */
  description: string;
  /** the date when the survey expires. */
  expiry_date: string;
  /** whether the survey is currently published and accepting responses. */
  is_published: boolean;
  /** the timestamp when the survey was created. */
  created_at: string;
  /** optional list of questions associated with the survey. */
  questions?: Question[];
  /** optional settings for the survey's behavior. */
  settings?: SurveySettings;
}

/** configurable behavior for a survey. */
export interface SurveySettings {
  /** whether responses are anonymous. */
  is_anonymous: boolean;
  /** the order in which questions are displayed. */
  display_order: QuestionDisplayOrder;
  /** the message shown after a user submits their response. */
  thank_you_message: string;
}

/** payload used to create or update a survey. */
export interface SurveyUpsertPayload {
  /** the title of the survey. */
  title: string;
  /** optional description shown to participants. */
  description: string;
  /** optional survey expiration date. */
  expiry_date: string;
  /** questions included in the survey. */
  questions: Question[];
  /** settings that control survey behavior. */
  settings: SurveySettings;
}

/** a single response count entry for analytics trend charts. */
export interface AnalyticsTrend {
  /** ISO date string representing the day of submitted responses. */
  date: string;
  /** number of responses submitted on that day. */
  count: number;
}

/** raw answer value returned in analytics payloads. */
export type AnalyticsAnswer = string | number | string[];

/** question analytics payload returned by the API. */
export interface AnalyticsQuestion extends Question {
  /** aggregated answers associated with the question. */
  data: AnalyticsAnswer[];
}

/** date range presets supported by the analytics page. */
export type AnalyticsDateRange = '7d' | '30d' | 'all' | 'custom';

/** analytics payload returned for a survey. */
export interface SurveyAnalytics {
  /** survey metadata shown in the analytics header. */
  survey: Survey;
  /** aggregated analytics for each survey question. */
  questions: AnalyticsQuestion[];
  /** raw response count used for summary metrics. */
  totalResponses: number;
  /** response activity grouped by day. */
  trends: AnalyticsTrend[];
}

/**
 * represents a user in the system.
 */
export interface User {
  /** unique identifier for the user. */
  id: number;
  /** the user's username. */
  username: string;
}

/**
 * response returned from the authentication API.
 */
export interface AuthResponse {
  /** the JWT token for authenticating subsequent requests. */
  token: string;
  /** the authenticated user's information. */
  user: User;
}

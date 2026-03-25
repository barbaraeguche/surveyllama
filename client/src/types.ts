/**
 * Supported question types in a survey.
 */
export type QuestionType = 'multiple_choice' | 'short_answer' | 'checkbox' | 'rating';

/**
 * Represents a single question in a survey.
 */
export interface Question {
  /** Unique identifier for the question. */
  id: string;
  /** The type of question (e.g., multiple choice, short answer). */
  type: QuestionType;
  /** The question text displayed to the user. */
  text: string;
  /** List of options for multiple choice or checkbox questions. */
  options: string[];
  /** Whether the question is mandatory. */
  required: boolean;
}

/**
 * Represents a survey created by an admin.
 */
export interface Survey {
  /** Unique identifier for the survey. */
  id: string;
  /** The title of the survey. */
  title: string;
  /** A brief description of the survey's purpose. */
  description: string;
  /** The date when the survey expires. */
  expiry_date: string;
  /** Whether the survey is currently published and accepting responses. */
  is_published: boolean;
  /** The timestamp when the survey was created. */
  created_at: string;
  /** Optional list of questions associated with the survey. */
  questions?: Question[];
  /** Optional settings for the survey's behavior. */
  settings?: {
    /** Whether responses are anonymous. */
    is_anonymous: boolean;
    /** The order in which questions are displayed. */
    display_order: 'sequential' | 'random';
    /** The message shown after a user submits their response. */
    thank_you_message: string;
  };
}

/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique identifier for the user. */
  id: number;
  /** The user's username. */
  username: string;
}

/**
 * Response returned from the authentication API.
 */
export interface AuthResponse {
  /** The JWT token for authenticating subsequent requests. */
  token: string;
  /** The authenticated user's information. */
  user: User;
}

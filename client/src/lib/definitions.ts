// user & authentication
import type { QuestionType } from "@/utils/constants";

export interface User {
  uid: string;
  email: string;
  role: "admin" | "participant";
}

// question type
interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
}

interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  maxLength?: number;
}

interface CheckboxQuestion extends BaseQuestion {
  type: "checkbox";
  options: string[];
}

interface RatingScaleQuestion extends BaseQuestion {
  type: "rating_scale";
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
}

type Question = MultipleChoiceQuestion | ShortAnswerQuestion | CheckboxQuestion | RatingScaleQuestion;

// survey
export interface Survey {
  id: string;
  title: string;
  description: string;
  createdBy: string;  // admin uid
  createdAt: string;
  expiryDate: string;
  status: "draft" | "published" | "closed";
  questions: Question[];
}

// participants & invitations
export interface Participant {
  email: string;
  invitedAt: string;
  uniqueToken: string;
  hasResponded: boolean;
}

export interface SurveyInvitation {
  surveyId: string;
  participants: Participant[];
}

// survey responses
interface BaseAnswer {
  questionId: string;
}

interface MultipleChoiceAnswer extends BaseAnswer {
  selectedOption: string;
}

interface ShortAnswerAnswer extends BaseAnswer {
  text: string;
}

interface CheckboxAnswer extends BaseAnswer {
  selectedOptions: string[];
}

interface RatingScaleAnswer extends BaseAnswer {
  rating: number;
}

type Answer = MultipleChoiceAnswer | ShortAnswerAnswer | CheckboxAnswer | RatingScaleAnswer;

export interface SurveyResponse {
  id: string;
  surveyId: string;
  participantEmail: string;
  submittedAt: string;
  answers: Answer[];
}

// analytics
interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  totalResponses: number;
  optionCounts?: Record<string, number>;  // for multiple choice & checkbox
  textResponses?: string[];  // for short answers
  // for rating scale
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  questionAnalytics: QuestionAnalytics[];
}

// api request/response
export interface CreateSurveyRequest
  extends Pick<Survey, "title" | "description" | "expiryDate"> {
    questions: Omit<Question, "id">[];
}

export type UpdateSurveyRequest = Partial<CreateSurveyRequest>;

export interface SendInvitationsRequest {
  surveyId: string;
  emails: string[];
}

export interface SubmitResponseRequest {
  token: string;
  answers: Omit<Answer, "id">[];
}
export type QuestionType = 'multiple_choice' | 'short_answer' | 'checkbox' | 'rating';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  expiry_date: string;
  is_published: boolean;
  created_at: string;
  questions?: Question[];
  settings?: {
    is_anonymous: boolean;
    display_order: 'sequential' | 'random';
    thank_you_message: string;
  };
}

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

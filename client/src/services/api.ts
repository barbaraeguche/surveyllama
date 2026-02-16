import type {
  CreateSurveyRequest,
  SendInvitationsRequest,
  SubmitResponseRequest,
  Survey,
  SurveyAnalytics,
  UpdateSurveyRequest
} from "@/lib/definitions";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json", }
});

// administrator endpoints
export const administratorApi = {
  getSurveys: () => api.get<Survey[]>("/surveys"),
  createSurvey: (data: CreateSurveyRequest) => api.post<Survey>("/surveys", data),
  updateSurvey: (id: string, data: UpdateSurveyRequest) => api.patch<Survey>(`/surveys/${id}`, data),
  publishSurvey: (id: string) => api.post<Survey>(`/surveys/${id}/publish`),
  sendInvitations: (id: string, data: SendInvitationsRequest) => api.post(`/surveys/${id}/invitations`, data),
  getAnalytics: (id: string) => api.get<SurveyAnalytics>(`/surveys/${id}/analytics`),
};

// participant endpoints
export const participantApi = {
  getSurvey: (id: string, token: string) => api.get<Survey>(`/surveys/${id}?token=${token}`),
  submitResponse: (id: string, data: SubmitResponseRequest) => api.post(`/surveys/${id}/responses`, data),
};
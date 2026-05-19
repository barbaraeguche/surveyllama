import { apiRequest } from "@/client/lib/api";
import { Survey, SurveyAnalytics, SurveyUpsertPayload } from "@/client/types";

type SurveyAnswerValue = string | number | boolean | string[] | null;

export const surveyService = {
  async getAll() {
    return apiRequest<Survey[]>("/api/surveys");
  },
  
  async getById(id: string) {
    return apiRequest<Survey>(`/api/surveys/${id}`);
  },
  
  async create(data: SurveyUpsertPayload) {
    return apiRequest<{ id: string }>("/api/surveys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  async publish(id: string) {
    return apiRequest(`/api/surveys/${id}/publish`, { method: "PATCH" });
  },
  
  async unpublish(id: string) {
    return apiRequest(`/api/surveys/${id}/unpublish`, { method: "PATCH" });
  },
  
  async update(id: string, data: SurveyUpsertPayload) {
    return apiRequest(`/api/surveys/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: string) {
    return apiRequest(`/api/surveys/${id}`, { method: "DELETE" });
  },
  
  async submitResponse(id: string, data: {
    email: string;
    answers: Record<string, SurveyAnswerValue>;
    token?: string | null
  }) {
    return apiRequest(`/api/surveys/${id}/responses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  async getAnalytics(id: string) {
    return apiRequest<SurveyAnalytics>(`/api/surveys/${id}/analytics`);
  }
};
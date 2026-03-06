import { apiRequest } from '../lib/api';
import { Survey, Question } from '../types';

export const surveyService = {
  async getAll() {
    return apiRequest<Survey[]>('/api/surveys');
  },

  async getById(id: string) {
    return apiRequest<Survey>(`/api/surveys/${id}`);
  },

  async create(surveyData: any) {
    return apiRequest<{ id: string }>('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  async publish(id: string) {
    return apiRequest(`/api/surveys/${id}/publish`, { method: 'PATCH' });
  },

  async delete(id: string) {
    return apiRequest(`/api/surveys/${id}`, { method: 'DELETE' });
  },

  async submitResponse(surveyId: string, responseData: { email: string; answers: Record<string, any> }) {
    return apiRequest(`/api/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  async getAnalytics(id: string) {
    return apiRequest<any>(`/api/surveys/${id}/analytics`);
  }
};

import { apiRequest } from '../lib/api';
import { Survey, Question } from '../types';

/**
 * Service for interacting with the survey API.
 */
export const surveyService = {
  /**
   * Fetches all surveys for the current user.
   */
  async getAll() {
    return apiRequest<Survey[]>('/api/surveys');
  },

  /**
   * Fetches a single survey by ID.
   * @param id - The survey ID.
   */
  async getById(id: string) {
    return apiRequest<Survey>(`/api/surveys/${id}`);
  },

  /**
   * Creates a new survey.
   * @param surveyData - The survey data.
   */
  async create(surveyData: any) {
    return apiRequest<{ id: string }>('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  /**
   * Publishes a survey.
   * @param id - The survey ID.
   */
  async publish(id: string) {
    return apiRequest(`/api/surveys/${id}/publish`, { method: 'PATCH' });
  },

  /**
   * Unpublishes a survey.
   * @param id - The survey ID.
   */
  async unpublish(id: string) {
    return apiRequest(`/api/surveys/${id}/unpublish`, { method: 'PATCH' });
  },

  /**
   * Updates an existing survey.
   * @param id - The survey ID.
   * @param surveyData - The updated survey data.
   */
  async update(id: string, surveyData: any) {
    return apiRequest(`/api/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    });
  },

  /**
   * Deletes a survey.
   * @param id - The survey ID.
   */
  async delete(id: string) {
    return apiRequest(`/api/surveys/${id}`, { method: 'DELETE' });
  },

  /**
   * Submits a response to a survey.
   * @param surveyId - The survey ID.
   * @param responseData - The response data.
   */
  async submitResponse(surveyId: string, responseData: { email: string; answers: Record<string, any>; token?: string | null }) {
    return apiRequest(`/api/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  /**
   * Fetches analytics for a survey.
   * @param id - The survey ID.
   */
  async getAnalytics(id: string) {
    return apiRequest<any>(`/api/surveys/${id}/analytics`);
  }
};

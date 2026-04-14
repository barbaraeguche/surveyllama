import { apiRequest } from '../lib/api';
import { Survey, SurveyAnalytics, SurveyUpsertPayload } from '../types';

type SurveyAnswerValue = string | number | boolean | string[] | null;

/**
 * service for interacting with the survey API.
 */
export const surveyService = {
  /**
   * fetches all surveys for the current user.
   */
  async getAll() {
    return apiRequest<Survey[]>('/api/surveys');
  },

  /**
   * fetches a single survey by ID.
   * @param id - the survey ID.
   */
  async getById(id: string) {
    return apiRequest<Survey>(`/api/surveys/${id}`);
  },

  /**
   * creates a new survey.
   * @param surveyData - the survey data.
   */
  async create(surveyData: SurveyUpsertPayload) {
    return apiRequest<{ id: string }>('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  /**
   * publishes a survey.
   * @param id - the survey ID.
   */
  async publish(id: string) {
    return apiRequest(`/api/surveys/${id}/publish`, { method: 'PATCH' });
  },

  /**
   * unpublishes a survey.
   * @param id - the survey ID.
   */
  async unpublish(id: string) {
    return apiRequest(`/api/surveys/${id}/unpublish`, { method: 'PATCH' });
  },

  /**
   * updates an existing survey.
   * @param id - the survey ID.
   * @param surveyData - the updated survey data.
   */
  async update(id: string, surveyData: SurveyUpsertPayload) {
    return apiRequest(`/api/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    });
  },

  /**
   * deletes a survey.
   * @param id - the survey ID.
   */
  async delete(id: string) {
    return apiRequest(`/api/surveys/${id}`, { method: 'DELETE' });
  },

  /**
   * submits a response to a survey.
   * @param surveyId - the survey ID.
   * @param responseData - the response data.
   */
  async submitResponse(surveyId: string, responseData: { email: string; answers: Record<string, SurveyAnswerValue>; token?: string | null }) {
    return apiRequest(`/api/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  /**
   * fetches analytics for a survey.
   * @param id - the survey ID.
   */
  async getAnalytics(id: string) {
    return apiRequest<SurveyAnalytics>(`/api/surveys/${id}/analytics`);
  }
};

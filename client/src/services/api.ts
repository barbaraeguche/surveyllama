import axios from "axios";

const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json", }
});

// participant endpoints
export const participantApi = {
  submitResult: () => api.post("/submit-result", null),
};

// administrator endpoints
export const administratorApi = {
  createSurvey: () => api.post("/create-survey", null),
  updateQuestions: () => api.patch("/update-questions", null),
  publishSurvey: () => api.post("/publish-survey", null),
  sendEmailNotifs: () => api.post("/send-email-notification", null),
  viewResults: () => api.get("/view-results"),
};
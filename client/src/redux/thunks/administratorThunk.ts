import type { CreateSurveyRequest, SendInvitationsRequest, UpdateSurveyRequest } from "../../lib/definitions";
import { administratorApi } from "../../services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSurveys = createAsyncThunk(
  "admin/fetchSurveys",
  async () => {
    const response = await administratorApi.getSurveys();
    return response.data;
});

export const createSurvey = createAsyncThunk(
  "admin/createSurvey",
  async (data: CreateSurveyRequest) => {
    const response = await administratorApi.createSurvey(data);
    return response.data;
  }
);

export const updateSurvey = createAsyncThunk(
  "admin/updateSurvey",
  async ({ id, data }: { id: string; data: UpdateSurveyRequest }) => {
    const response = await administratorApi.updateSurvey(id, data);
    return response.data;
  }
);

export const publishSurvey = createAsyncThunk(
  "admin/publishSurvey",
  async (id: string) => {
    const response = await administratorApi.publishSurvey(id);
    return response.data;
  }
);

export const sendInvitations = createAsyncThunk(
  "admin/sendInvitations",
  async ({ id, data }: { id: string; data: SendInvitationsRequest }) => {
    const response = await administratorApi.sendInvitations(id, data);
    return response.data;
  }
);

export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (id: string) => {
    const response = await administratorApi.getAnalytics(id);
    return response.data;
  }
);
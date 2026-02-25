import type { SubmitResponseRequest } from "../../lib/definitions";
import { participantApi } from "../../services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSurveyForParticipant = createAsyncThunk(
  "participant/fetchSurvey",
  async ({ id, token }: { id: string; token: string }) => {
    const response = await participantApi.getSurvey(id, token);
    return response.data;
  }
);

export const submitSurveyResponse = createAsyncThunk(
  "participant/submitResponse",
  async ({ id, data }: { id: string; data: SubmitResponseRequest }) => {
    const response = await participantApi.submitResponse(id, data);
    return response.data;
  }
);
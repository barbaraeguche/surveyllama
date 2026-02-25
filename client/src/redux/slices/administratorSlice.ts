import type { Survey, SurveyAnalytics } from "../../lib/definitions";
import type { ThunkError, ThunkStatus } from "../../lib/types";
import {
  createSurvey,
  fetchAnalytics,
  fetchSurveys,
  publishSurvey,
  updateSurvey
} from "../../redux/thunks/administratorThunk";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AdministratorState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  analytics: SurveyAnalytics | null;
  status: ThunkStatus;
  error: ThunkError;
}

const initialState: AdministratorState = {
  surveys: [],
  currentSurvey: null,
  analytics: null,
  status: "idle",
  error: null,
};

export const administratorSlice = createSlice({
  name: "administrator",
  initialState,
  reducers: {
    setCurrentSurvey: (state, action: PayloadAction<Survey | null>) => {
      state.currentSurvey = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurveys.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.surveys = action.payload;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to fetch surveys";
      })
      
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.surveys.push(action.payload);
      })
      
      .addCase(updateSurvey.fulfilled, (state, action) => {
        const index = state.surveys.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.surveys[index] = action.payload;
        }
        if (state.currentSurvey?.id === action.payload.id) {
          state.currentSurvey = action.payload;
        }
      })
      
      .addCase(publishSurvey.fulfilled, (state, action) => {
        const index = state.surveys.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.surveys[index] = action.payload;
        }
      })
      
      .addCase(fetchAnalytics.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to fetch analytics";
      });
  },
});

export const { setCurrentSurvey, clearError } = administratorSlice.actions;
export default administratorSlice.reducer;
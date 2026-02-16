import type { Survey } from "@/lib/definitions";
import type { ThunkError, ThunkStatus } from "@/lib/types";
import { fetchSurveyForParticipant, submitSurveyResponse } from "@/redux/thunks/participantThunk";
import { createSlice } from "@reduxjs/toolkit";

interface ParticipantState {
  survey: Survey | null;
  submitted: boolean;
  status: ThunkStatus;
  error: ThunkError;
}

const initialState: ParticipantState = {
  survey: null,
  submitted: false,
  status: "idle",
  error: null,
};

export const participantSlice = createSlice({
  name: "participant",
  initialState,
  reducers: {
    resetSubmission: (state) => {
      state.submitted = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurveyForParticipant.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchSurveyForParticipant.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.survey = action.payload;
      })
      .addCase(fetchSurveyForParticipant.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to load survey";
      })
      
      .addCase(submitSurveyResponse.pending, (state) => {
        state.status = "pending";
      })
      .addCase(submitSurveyResponse.fulfilled, (state) => {
        state.status = "fulfilled";
        state.submitted = true;
      })
      .addCase(submitSurveyResponse.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Failed to submit response";
      });
  },
});

export const { resetSubmission } = participantSlice.actions;
export default participantSlice.reducer;
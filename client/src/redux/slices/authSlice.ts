import type { User } from "@/lib/definitions";
import type { ThunkError, ThunkStatus } from "@/lib/types";
// import { login, logout } from "@/redux/thunks/authThunk";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  status: ThunkStatus;
  error: ThunkError;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(login.pending, (state) => {
  //       state.status = "pending";
  //       state.error = null;
  //     })
  //     .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
  //       state.status = "fulfilled";
  //       state.user = action.payload;
  //     })
  //     .addCase(login.rejected, (state, action) => {
  //       state.status = "rejected";
  //       state.error = action.error.message || "Login failed";
  //     })
  //
  //     .addCase(logout.fulfilled, (state) => {
  //       state.user = null;
  //     });
  // },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
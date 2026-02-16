import administratorSlice from "@/redux/slices/administratorSlice";
import authSlice from "@/redux/slices/authSlice";
import participantSlice from "@/redux/slices/participantSlice";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  authSlice,
  administratorSlice,
  participantSlice
});

export default rootReducer;
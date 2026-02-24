export type ThunkStatus = "idle" | "pending" | "fulfilled" | "rejected";
export type ThunkError = string | null;

export type InputConfig = {
  label?: string;
  placeholder?: string;
};
import { auth } from "@/firebase/config";
import type { User } from "@/lib/definitions";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    const user: User = {
      uid: userCredentials.user.uid,
      email: userCredentials.user.email!,
      role: "admin"
    };
    return user;
  }
);

export const logout = createAsyncThunk(
  "auth/logout", async () => await signOut(auth)
);
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/test/setup.ts"],
    include: ["client/src/**/*.{test,spec}.{ts,tsx}", "server/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: {
      "@/client": path.resolve(__dirname, "./client/src"),
    },
  },
});

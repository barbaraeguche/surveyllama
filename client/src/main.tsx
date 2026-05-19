import App from "@/client/app.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/client/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
);

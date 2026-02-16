import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
}));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("SurveyLlama Server!");
});

// route handlers

// 404 handler
app.use((_res: Request, res: Response, _next: NextFunction) => {
  res.status(400).json("Page doesn't exist on server");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
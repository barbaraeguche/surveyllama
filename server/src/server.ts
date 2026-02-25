import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("SurveyLlama Server!");
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' , data: ["SurveyLlama server is running"] });
});

// POST endpoint to add two numbers
app.get('/api/add', (req: Request, res: Response) => {
  try {
    const { a, b } = req.query; // or use default values: const { a = '0', b = '0' } = req.query;

    

    // Validate inputs
    if (a === undefined || b === undefined) {
      return res.status(400).json({ 
        error: 'Both numbers are required' 
      });
    }

    // Convert to numbers and validate
    const num1 = Number(a);
    const num2 = Number(b);

    if (isNaN(num1) || isNaN(num2)) {
      return res.status(400).json({ 
        error: 'Both inputs must be valid numbers' 
      });
    }

    // Calculate sum
    const sum = num1 + num2;

    // Return result
    res.json({ result: sum });

  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// route handlers 

// 404 handler
app.use((_res: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: "Page doesn't exist on server" });
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
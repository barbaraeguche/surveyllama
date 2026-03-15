import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cors from 'cors';
import surveyRoutes from './server/routes/surveyRoutes';

dotenv.config();

export const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// API Routes
console.log('Registering API routes...');
app.use('/api/surveys', surveyRoutes);
console.log('API routes registered');

async function startServer() {
  console.log('Starting server...');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware initialized');
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}

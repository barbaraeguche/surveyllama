import express from 'express';
import type { RequestHandler } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cors from 'cors';
import surveyRoutes from './server/routes/surveyRoutes';
import path from 'path';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Cast the router to RequestHandler to avoid overload ambiguity with mixed Express typings.
app.use('/api/surveys', surveyRoutes as unknown as RequestHandler);

async function startServer() {
  // Firebase App Hosting PORT is default to 8080, so add fallback to 3000 for local dev.
  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

  if (isNaN(port)) {
    console.error(`Invalid PORT value: ${process.env.PORT}`);
    process.exit(1);
  }

  console.log('Starting server...');
  // Use Vite middleware in development for hot module replacement and fast refresh
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware initialized');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}

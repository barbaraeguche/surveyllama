import express, { Router } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cors from 'cors';
import surveyRoutes from './server/routes/surveyRoutes';
import path from 'path';

dotenv.config();




async function startServer() {
  const app = express();
  const DEV_PORT = 3000;
  const PROD_PORT = 8080;
  const PORT = process.env.NODE_ENV !== 'production' ? DEV_PORT : PROD_PORT;

  app.use(cors());
  app.use(express.json());

  // API Routes
  // console.log('Registering API routes...');
  app.use('/api/surveys', surveyRoutes);
  // console.log('API routes registered');

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}

import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';

// Mock firebase-admin before importing app
vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn(),
    },
    firestore: Object.assign(vi.fn(() => ({
      collection: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            get: vi.fn(() => Promise.resolve({ docs: [] })),
          })),
        })),
        doc: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ exists: false })),
          set: vi.fn(() => Promise.resolve()),
          update: vi.fn(() => Promise.resolve()),
          delete: vi.fn(() => Promise.resolve()),
          collection: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              get: vi.fn(() => Promise.resolve({ docs: [] })),
            })),
            get: vi.fn(() => Promise.resolve({ size: 0, docs: [] })),
            doc: vi.fn(() => ({
              set: vi.fn(() => Promise.resolve()),
            })),
          })),
        })),
      })),
      batch: vi.fn(() => ({
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      })),
      FieldValue: {
        serverTimestamp: vi.fn(),
      },
    })), {
      FieldValue: {
        serverTimestamp: vi.fn(),
      }
    }),
    auth: vi.fn(() => ({
      verifyIdToken: vi.fn(),
    })),
  },
}));

// Mock vite since it might be imported in server.ts
vi.mock('vite', () => ({
  createServer: vi.fn(() => Promise.resolve({
    middlewares: (_req: Request, _res: Response, next: NextFunction) => next(),
  })),
}));

import { app } from '../../server';

describe('Backend API', () => {
  it('GET /api/health returns status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /api/surveys returns 401 without token', async () => {
    const response = await request(app).get('/api/surveys');
    expect(response.status).toBe(401);
  });
});

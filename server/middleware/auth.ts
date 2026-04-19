import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.ts';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: unknown;
  };
}

function getBearerToken(req: Request) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return token || null;
}

async function attachAuthenticatedUser(req: AuthRequest, token: string) {
  const decodedToken = await auth.verifyIdToken(token);
  const { uid, email, ...rest } = decodedToken;
  req.user = {
    uid,
    email,
    ...rest,
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    await attachAuthenticatedUser(req, token);
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthenticateToken = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = getBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    await attachAuthenticatedUser(req, token);
  } catch (error) {
    console.warn('Optional auth skipped due to invalid token:', error);
  }

  next();
};

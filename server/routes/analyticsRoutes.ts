import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:id/analytics', authenticateToken, getAnalytics);

export default router;

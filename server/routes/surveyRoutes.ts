import { Router } from 'express';
import { 
  getSurveys, 
  createSurvey, 
  getSurveyById, 
  publishSurvey, 
  deleteSurvey 
} from '../controllers/surveyController';
import { submitResponse } from '../controllers/responseController';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use((req, res, next) => {
  console.log(`Survey Route hit: ${req.method} ${req.url}`);
  next();
});

router.get('/', authenticateToken, getSurveys);
router.post('/', authenticateToken, createSurvey);

// Sub-routes (must be before /:id)
router.post('/:id/responses', submitResponse);
router.get('/:id/analytics', authenticateToken, getAnalytics);

router.get('/:id', getSurveyById);
router.patch('/:id/publish', authenticateToken, publishSurvey);
router.delete('/:id', authenticateToken, deleteSurvey);

export default router;

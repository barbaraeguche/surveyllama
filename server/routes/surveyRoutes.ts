import { Router } from 'express';
import { 
  getSurveys, 
  createSurvey, 
  getSurveyById, 
  publishSurvey, 
  unpublishSurvey,
  updateSurvey,
  deleteSurvey 
} from '../controllers/surveyController';
import { submitResponse } from '../controllers/responseController';
import { getAnalytics } from '../controllers/analyticsController';
import { sendInvitations } from '../controllers/inviteController';
import { authenticateToken } from '../middleware/auth';

/**
 * Survey routes for managing surveys, responses, analytics, and invitations.
 */
const router = Router();

/**
 * Logging middleware for survey routes.
 */
router.use((req, res, next) => {
  console.log(`Survey Route hit: ${req.method} ${req.url}`);
  next();
});

/**
 * @route GET /api/surveys
 * @desc Get all surveys for the current user.
 * @access Private
 */
router.get('/', authenticateToken, getSurveys);

/**
 * @route POST /api/surveys
 * @desc Create a new survey.
 * @access Private
 */
router.post('/', authenticateToken, createSurvey);

/**
 * @route POST /api/surveys/send-invites
 * @desc Send email invitations for a survey.
 * @access Private
 */
router.post('/send-invites', authenticateToken, sendInvitations);

/**
 * @route POST /api/surveys/:id/responses
 * @desc Submit a response to a survey.
 * @access Public
 */
router.post('/:id/responses', submitResponse);

/**
 * @route GET /api/surveys/:id/analytics
 * @desc Get analytics for a survey.
 * @access Private
 */
router.get('/:id/analytics', authenticateToken, getAnalytics);

/**
 * @route GET /api/surveys/:id
 * @desc Get a single survey by ID.
 * @access Public
 */
router.get('/:id', getSurveyById);

/**
 * @route PATCH /api/surveys/:id/publish
 * @desc Publish a survey.
 * @access Private
 */
router.patch('/:id/publish', authenticateToken, publishSurvey);

/**
 * @route PATCH /api/surveys/:id/unpublish
 * @desc Unpublish a survey.
 * @access Private
 */
router.patch('/:id/unpublish', authenticateToken, unpublishSurvey);

/**
 * @route PUT /api/surveys/:id
 * @desc Update an existing survey.
 * @access Private
 */
router.put('/:id', authenticateToken, updateSurvey);

/**
 * @route DELETE /api/surveys/:id
 * @desc Delete a survey.
 * @access Private
 */
router.delete('/:id', authenticateToken, deleteSurvey);

export default router;

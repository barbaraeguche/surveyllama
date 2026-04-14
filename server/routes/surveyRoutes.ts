import { Router } from 'express';
import { 
  getSurveys, 
  createSurvey, 
  getSurveyById, 
  publishSurvey, 
  unpublishSurvey,
  updateSurvey,
  deleteSurvey 
} from '../controllers/surveyController.ts';
import { submitResponse } from '../controllers/responseController.ts';
import { getAnalytics } from '../controllers/analyticsController.ts';
import { sendInvitations } from '../controllers/inviteController.ts';
import { authenticateToken } from '../middleware/auth.ts';

/**
 * survey routes for managing surveys, responses, analytics, and invitations.
 */
const router = Router();

/**
 * logging middleware for survey routes.
 */
router.use((req, res, next) => {
  console.log(`Survey Route hit: ${req.method} ${req.url}`);
  next();
});

/**
 * @route GET /api/surveys
 * @desc get all surveys for the current user.
 * @access private
 */
router.get('/', authenticateToken, getSurveys);

/**
 * @route POST /api/surveys
 * @desc create a new survey.
 * @access private
 */
router.post('/', authenticateToken, createSurvey);

/**
 * @route POST /api/surveys/send-invites
 * @desc send email invitations for a survey.
 * @access private
 */
router.post('/send-invites', authenticateToken, sendInvitations);

/**
 * @route POST /api/surveys/:id/responses
 * @desc submit a response to a survey.
 * @access public
 */
router.post('/:id/responses', submitResponse);

/**
 * @route GET /api/surveys/:id/analytics
 * @desc get analytics for a survey.
 * @access private
 */
router.get('/:id/analytics', authenticateToken, getAnalytics);

/**
 * @route GET /api/surveys/:id
 * @desc get a single survey by ID.
 * @access public
 */
router.get('/:id', getSurveyById);

/**
 * @route PATCH /api/surveys/:id/publish
 * @desc publish a survey.
 * @access private
 */
router.patch('/:id/publish', authenticateToken, publishSurvey);

/**
 * @route PATCH /api/surveys/:id/unpublish
 * @desc unpublish a survey.
 * @access private
 */
router.patch('/:id/unpublish', authenticateToken, unpublishSurvey);

/**
 * @route PUT /api/surveys/:id
 * @desc update an existing survey.
 * @access private
 */
router.put('/:id', authenticateToken, updateSurvey);

/**
 * @route DELETE /api/surveys/:id
 * @desc delete a survey.
 * @access private
 */
router.delete('/:id', authenticateToken, deleteSurvey);

export default router;

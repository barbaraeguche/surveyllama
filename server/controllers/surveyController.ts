import type { Response } from 'express';
import { db } from '../config/firebase.ts';
import admin from '../config/firebase.ts';
import type { AuthRequest } from '../middleware/auth.ts';

interface SurveyQuestionInput {
  id?: string;
  required?: boolean;
  options?: string[];
  [key: string]: unknown;
}

/**
 * Fetches all surveys created by the authenticated user.
 * @param req - AuthRequest containing user info.
 * @param res - Express Response object.
 */
export const getSurveys = async (req: AuthRequest, res: Response) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  try {
    const snapshot = await db.collection('surveys')
      .where('admin_id', '==', req.user.uid)
      .get();

    const surveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(surveys);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      error: 'Failed to fetch surveys',
      details,
    });
  }
};

/**
 * Creates a new survey with associated questions.
 * @param req - AuthRequest containing survey details in body.
 * @param res - Express Response object.
 */
export const createSurvey = async (req: AuthRequest, res: Response) => {

  const { title, description, expiry_date, questions, settings } = req.body;

  try {
    const surveyRef = db.collection('surveys').doc();
    const surveyId = surveyRef.id;
    const userID = Array.isArray(req.user?.uid) ? req.user.uid[0] : req.user?.uid;
    await surveyRef.set({
      title,
      description,
      expiry_date,
      admin_id: userID,
      is_published: false,
      settings: settings || {
        is_anonymous: false,
        display_order: 'sequential',
        thank_you_message: 'Thank you for participating in our survey!'
      },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const questionsBatch = db.batch();
    (questions as SurveyQuestionInput[]).forEach((q, index: number) => {
      // Use the provided question ID if it exists, otherwise generate a new one
      const qId = q.id || db.collection('surveys').doc(surveyId).collection('questions').doc().id;
      const qRef = db.collection('surveys').doc(surveyId).collection('questions').doc(qId);
      // Remove id from the data to avoid redundancy and potential overwrite issues
      const { id, ...qData } = q;
      questionsBatch.set(qRef, {
        ...qData,
        order_index: index,
        options: qData.options || [],
        required: !!q.required
      });
    });

    await questionsBatch.commit();
    res.json({ id: surveyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
};

/**
 * Fetches a single survey by ID, including its questions.
 * @param req - Express Request object with survey ID in params.
 * @param res - Express Response object.
 */
export const getSurveyById = async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists) return res.status(404).json({ error: 'Survey not found' });

    const questionsSnapshot = await db.collection('surveys').doc(surveyId).collection('questions').orderBy('order_index', 'asc').get();
    const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ id: surveyDoc.id, ...surveyDoc.data(), questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
};

/**
 * Publishes a survey, making it available for responses.
 * @param req - AuthRequest with survey ID in params.
 * @param res - Express Response object.
 */
export const publishSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const surveyRef = db.collection('surveys').doc(surveyId);
    const surveyDoc = await surveyRef.get();
    const userID = Array.isArray(req.user?.uid) ? req.user.uid[0] : req.user?.uid;

    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (surveyDoc.data()?.admin_id !== userID) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await surveyRef.update({ is_published: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish survey' });
  }
};

/**
 * Unpublishes a survey, preventing new responses.
 * Cannot unpublish if responses already exist.
 * @param req - AuthRequest with survey ID in params.
 * @param res - Express Response object.
 */
export const unpublishSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const surveyRef = db.collection('surveys').doc(surveyId);
    const surveyDoc = await surveyRef.get();
    const userID = Array.isArray(req.user?.uid) ? req.user.uid[0] : req.user?.uid;

    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (surveyDoc.data()?.admin_id !== userID) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check for responses
    const responsesSnapshot = await surveyRef.collection('responses').limit(1).get();
    if (!responsesSnapshot.empty) {
      return res.status(400).json({ error: 'Cannot unpublish a survey that already has responses.' });
    }

    await surveyRef.update({ is_published: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish survey' });
  }
};

/**
 * Updates an existing survey's metadata and questions.
 * Only allowed if the survey is not published.
 * @param req - AuthRequest with survey ID in params and update data in body.
 * @param res - Express Response object.
 */
export const updateSurvey = async (req: AuthRequest, res: Response) => {
  const { title, description, expiry_date, questions, settings } = req.body;
  const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const surveyRef = db.collection('surveys').doc(surveyId);
    const surveyDoc = await surveyRef.get();

    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const surveyData = surveyDoc.data();
    const userID = Array.isArray(req.user?.uid) ? req.user.uid[0] : req.user?.uid;
    if (surveyData?.admin_id !== userID) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (surveyData?.is_published) {
      return res.status(400).json({ error: 'Cannot edit a published survey. Please unpublish it first.' });
    }

    // Update survey metadata
    await surveyRef.update({
      title,
      description,
      expiry_date,
      settings: settings || surveyData?.settings,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update questions
    if (questions && Array.isArray(questions)) {
      const questionsSnapshot = await surveyRef.collection('questions').get();
      const batch = db.batch();

      // Delete existing questions
      questionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new questions
      (questions as SurveyQuestionInput[]).forEach((q, index: number) => {
        // Use the provided question ID if it exists, otherwise generate one
        const qId = q.id || surveyRef.collection('questions').doc().id;
        const qRef = surveyRef.collection('questions').doc(qId);

        // Remove id from the data to avoid redundancy and potential overwrites
        const { id: _, ...qData } = q;

        batch.set(qRef, {
          ...qData,
          order_index: index,
          options: q.options || [],
          required: !!q.required
        });
      });

      await batch.commit();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
};

/**
 * Deletes a survey and all its associated data.
 * @param req - AuthRequest with survey ID in params.
 * @param res - Express Response object.
 */
export const deleteSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await db.collection('surveys').doc(surveyId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
};

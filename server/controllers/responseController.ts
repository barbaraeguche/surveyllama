import { Request, Response } from 'express';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

/**
 * Submits a response to a published survey.
 * @param req - Express Request object with survey ID in params and response data in body.
 * @param res - Express Response object.
 */
export const submitResponse = async (req: Request, res: Response) => {
  const { email, answers } = req.body;
  const surveyId = req.params.id;

  if (!surveyId || !answers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const surveyRef = db.collection('surveys').doc(surveyId);
    const surveyDoc = await surveyRef.get();

    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (!surveyDoc.data()?.is_published) {
      return res.status(400).json({ error: 'Survey is not published' });
    }

    // Add response to subcollection
    await surveyRef.collection('responses').add({
      email: email || 'anonymous',
      answers,
      submitted_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

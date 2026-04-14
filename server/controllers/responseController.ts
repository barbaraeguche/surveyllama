import type { Request, Response } from 'express';
import { db } from '../config/firebase.ts';
import admin from '../config/firebase.ts';

/**
 * submits a response to a published survey.
 * @param req - express Request object with survey ID in params and response data in body.
 * @param res - express Response object.
 */
export const submitResponse = async (req: Request, res: Response) => {
  const { email, answers, token } = req.body;
  const surveyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!surveyId || !answers || !token) {
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

    const expiryDate = surveyDoc.data()?.expiry_date;
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Survey has expired' });
    }

    // validate token
    const invitationRef = surveyRef.collection('invitations').doc(token);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return res.status(403).json({ error: 'Invalid invitation link' });
    }

    if (invitationDoc.data()?.used) {
      return res.status(403).json({ error: 'This invitation link has already been used' });
    }

    // add response to subcollection
    await surveyRef.collection('responses').add({
      email: invitationDoc.data()?.email || email || 'anonymous',
      answers,
      submitted_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // mark token as used
    await invitationRef.update({ used: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

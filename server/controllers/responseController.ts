import { Request, Response } from 'express';
import { db } from '../config/firebase';
import admin from '../config/firebase';

export const submitResponse = async (req: Request, res: Response) => {
  const { email, answers } = req.body;
  const surveyId = req.params.id;

  try {
    const responseRef = db.collection('surveys').doc(surveyId).collection('responses').doc();
    await responseRef.set({
      participant_email: email,
      submitted_at: admin.firestore.FieldValue.serverTimestamp(),
      answers: answers
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

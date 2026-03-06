import { Response } from 'express';
import { db } from '../config/firebase';
import admin from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const getSurveys = async (req: AuthRequest, res: Response) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  try {
    console.log('Fetching surveys for user:', JSON.stringify(req.user, null, 2));
    const snapshot = await db.collection('surveys')
      .where('admin_id', '==', req.user.uid)
      .get();
    
    const surveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(surveys);
  } catch (error: any) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ 
      error: 'Failed to fetch surveys',
      details: error.message 
    });
  }
};

export const createSurvey = async (req: AuthRequest, res: Response) => {
  const { title, description, expiry_date, questions, settings } = req.body;
  
  try {
    const surveyRef = db.collection('surveys').doc();
    const surveyId = surveyRef.id;

    await surveyRef.set({
      title,
      description,
      expiry_date,
      admin_id: req.user.uid,
      is_published: false,
      settings: settings || {
        is_anonymous: false,
        display_order: 'sequential',
        thank_you_message: 'Thank you for participating in our survey!'
      },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const questionsBatch = db.batch();
    questions.forEach((q: any, index: number) => {
      const qRef = db.collection('surveys').doc(surveyId).collection('questions').doc();
      questionsBatch.set(qRef, {
        ...q,
        order_index: index,
        options: q.options || [],
        required: !!q.required
      });
    });

    await questionsBatch.commit();
    res.json({ id: surveyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
};

export const getSurveyById = async (req: AuthRequest, res: Response) => {
  try {
    const surveyDoc = await db.collection('surveys').doc(req.params.id).get();
    if (!surveyDoc.exists) return res.status(404).json({ error: 'Survey not found' });

    const questionsSnapshot = await db.collection('surveys').doc(req.params.id).collection('questions').orderBy('order_index', 'asc').get();
    const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ id: surveyDoc.id, ...surveyDoc.data(), questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
};

export const publishSurvey = async (req: AuthRequest, res: Response) => {
  try {
    await db.collection('surveys').doc(req.params.id).update({ is_published: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish survey' });
  }
};

export const deleteSurvey = async (req: AuthRequest, res: Response) => {
  try {
    await db.collection('surveys').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
};

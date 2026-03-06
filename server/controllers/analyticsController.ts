import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const surveyId = req.params.id;

  try {
    const responsesSnapshot = await db.collection('surveys').doc(surveyId).collection('responses').get();
    const questionsSnapshot = await db.collection('surveys').doc(surveyId).collection('questions').orderBy('order_index', 'asc').get();
    
    const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const responses = responsesSnapshot.docs.map(doc => doc.data());

    const analytics = questions.map((q: any) => {
      const answers = responses.map((r: any) => r.answers[q.id]).filter(a => a !== undefined);
      return {
        id: q.id,
        text: q.text,
        type: q.type,
        data: answers
      };
    });

    res.json({
      totalResponses: responsesSnapshot.size,
      questions: analytics
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

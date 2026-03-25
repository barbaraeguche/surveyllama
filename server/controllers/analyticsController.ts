import { Response } from 'express';
import { db } from '../config/firebase.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Fetches and processes analytics data for a survey.
 * Includes total responses, question-wise data, and response trends over time.
 * @param req - AuthRequest with survey ID in params.
 * @param res - Express Response object.
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const surveyId = req.params.id;

  try {
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (surveyDoc.data()?.admin_id !== req.user?.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const responsesSnapshot = await db.collection('surveys').doc(surveyId).collection('responses').get();
    const responses = responsesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const questionsSnapshot = await db.collection('surveys').doc(surveyId).collection('questions').orderBy('order_index', 'asc').get();
    const questions = questionsSnapshot.docs.map(doc => {
      const qData = doc.data();
      const qId = doc.id;
      
      // Process responses for this question
      const answers = responses.map((r: any) => r.answers[qId]).filter(a => a !== undefined);

      return { 
        id: qId, 
        ...qData,
        data: answers
      };
    });

    // Process trends (responses per day)
    const trendsMap: Record<string, number> = {};
    responses.forEach((r: any) => {
      const date = r.submitted_at?.toDate?.() || new Date(r.submitted_at?._seconds * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trendsMap[dateStr] = (trendsMap[dateStr] || 0) + 1;
    });

    const trends = Object.entries(trendsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      survey: { id: surveyDoc.id, ...surveyDoc.data() },
      questions,
      responses,
      trends,
      totalResponses: responses.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

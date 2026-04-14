import { randomUUID } from 'crypto';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';
import { db } from '../config/firebase.ts';
import admin from '../config/firebase.ts';
import { EmailService } from '../services/emailService.ts';
import { EmailTemplateService } from '../services/emailTemplateService.ts';

interface SurveyInviteData {
  admin_id: string;
  is_published: boolean;
  title: string;
  description?: string;
}

interface InviteAttachmentInput {
  filename: string;
  path: string;
}

/**
 * controller for sending survey invitations to a list of emails.
 * @param req - authRequest containing surveyId, emails, and optional attachments.
 * @param res - express Response object.
 */
export const sendInvitations = async (req: AuthRequest, res: Response) => {
  const { surveyId, emails, surveyUrl, attachments } = req.body;

  if (!surveyId || !emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: surveyId, emails' });
  }

  // fetch survey details
  let surveyData: SurveyInviteData | null = null;
  try {
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    surveyData = surveyDoc.data() as SurveyInviteData;

    // check ownership
    if (surveyData.admin_id !== req.user?.uid) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this survey' });
    }

    // check if survey is published
    if (!surveyData.is_published) {
      return res.status(400).json({
        error: 'Cannot send invitations for an unpublished survey. Please publish it first.'
      });
    }
  } catch (err) {
    console.error('Error fetching survey details:', err);
    return res.status(500).json({ error: 'Failed to fetch survey details' });
  }

  try {
    const results = await Promise.all(emails.map(async (email: string) => {
      const token = randomUUID();
      const tokenizedUrl = `${surveyUrl}?token=${token}`;
      const { html, text } = EmailTemplateService.getSurveyInvitationTemplate(surveyData.title, surveyData.description, tokenizedUrl);

      try {
        await EmailService.sendEmail({
          to: email,
          subject: `Invitation: ${surveyData.title}`,
          text,
          html,
          attachments: attachments && Array.isArray(attachments)
            ? (attachments as InviteAttachmentInput[]).map((att) => ({
              filename: att.filename,
              path: att.path,
            }))
            : []
        });

        // store token as doc ID for O(1) lookup on submission
        await db.collection('surveys').doc(surveyId).collection('invitations').doc(token).set({
          email,
          used: false,
          sent_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'sent',
          admin_id: req.user?.uid
        });

        return { email, status: 'sent' };
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);

        await db.collection('surveys').doc(surveyId).collection('invitations').doc(token).set({
          email,
          used: false,
          sent_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
          admin_id: req.user?.uid
        });

        return { email, status: 'failed' };
      }
    }));

    const failed = results.filter(r => r.status === 'failed');
    if (failed.length === emails.length) {
      return res.status(500).json({ error: 'Failed to send all invitations. Check SMTP configuration.' });
    }

    res.json({
      message: `Successfully sent ${emails.length - failed.length} invitations.`,
      results
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({ error: 'Internal server error while sending invitations.' });
  }
};

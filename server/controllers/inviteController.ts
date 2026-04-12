import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';
import { db } from '../config/firebase.ts';
import admin from '../config/firebase.ts';
import { EmailService } from '../services/emailService.ts';

/**
 * Controller for sending survey invitations to a list of emails.
 * @param req - AuthRequest containing surveyId, emails, surveyUrl, and optional attachments.
 * @param res - Express Response object.
 */
export const sendInvitations = async (req: AuthRequest, res: Response) => {
  const { surveyId, emails, surveyUrl, attachments } = req.body;

  if (!surveyId || !emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: surveyId, emails' });
  }

  // Fetch survey details
  let surveyData: any = null;
  try {
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    surveyData = surveyDoc.data();
    
    // Check ownership
    if (surveyData.admin_id !== req.user?.uid) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this survey' });
    }

    // Check if survey is published
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
      try {
        // TODO: Create email templates
        await EmailService.sendEmail({
          to: email,
          subject: `Invitation: ${surveyData.title}`,
          text: `Hello,\n\nYou have been invited to participate in the survey: "${surveyData.title}".\n\nDescription: ${surveyData.description || 'No description provided.'}\n\nPlease click the link below to start:\n\n${surveyUrl}\n\nThank you!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #4f46e5; margin-top: 0;">You're Invited!</h2>
              <p style="font-size: 16px; color: #374151;">Hello,</p>
              <p style="font-size: 16px; color: #374151;">You have been invited to participate in the survey: <strong>"${surveyData.title}"</strong> on <strong>SurveyLlama</strong>.</p>
              ${surveyData.description ? `<p style="font-size: 14px; color: #6b7280; font-style: italic;">"${surveyData.description}"</p>` : ''}
              <div style="margin: 30px 0;">
                <a href="${surveyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Survey</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #6b7280; font-size: 14px; word-break: break-all;">${surveyUrl}</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">This is an automated message from SurveyLlama.</p>
            </div>
          `,
          attachments: attachments && Array.isArray(attachments) ? attachments.map((att: any) => ({
            filename: att.filename,
            path: att.path
          })) : []
        });

        // Log invitation to Firestore
        await db.collection('surveys').doc(surveyId).collection('invitations').add({
          email,
          sent_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'sent',
          admin_id: req.user?.uid
        });

        return { email, status: 'sent' };
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
        
        // Log failed invitation
        await db.collection('surveys').doc(surveyId).collection('invitations').add({
          email,
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

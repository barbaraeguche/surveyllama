import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

/**
 * configuration for the SMTP transporter.
 */
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  service?: string;
  requireTLS?: boolean;
}

/**
 * service for sending emails using Nodemailer.
 */
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * initializes the SMTP transporter based on environment variables.
   * falls back to Ethereal (test) account if credentials are missing.
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    let smtpConfig: SMTPConfig = {
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    // specific settings for Gmail
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      smtpConfig.service = 'gmail';
      smtpConfig.requireTLS = true;
    }

    // fallback to Ethereal if no credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing. Using Ethereal test account.');
      const testAccount = await nodemailer.createTestAccount();
      smtpConfig = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
    }

    this.transporter = nodemailer.createTransport(smtpConfig);
    return this.transporter;
  }

  /**
   * sends an email.
   * @param to - recipient email address.
   * @param subject - email subject.
   * @param text - plain text content.
   * @param html - html content.
   * @param attachments - optional attachments.
   */
  static async sendEmail({
    to,
    subject,
    text,
    html,
    attachments = [],
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: Mail.Attachment[];
  }) {
    const transporter = await this.getTransporter();
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@surveyllama.com';

    return transporter.sendMail({
      from: `"SurveyLlama" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
  }
}

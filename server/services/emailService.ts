import nodemailer from 'nodemailer';

/**
 * Configuration for the SMTP transporter.
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
 * Service for sending emails using Nodemailer.
 */
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initializes the SMTP transporter based on environment variables.
   * Falls back to Ethereal (test) account if credentials are missing.
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

    // Specific settings for Gmail
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      smtpConfig.service = 'gmail';
      smtpConfig.requireTLS = true;
    }

    // Fallback to Ethereal if no credentials
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
   * Sends an email.
   * @param to - Recipient email address.
   * @param subject - Email subject.
   * @param text - Plain text content.
   * @param html - HTML content.
   * @param attachments - Optional attachments.
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
    attachments?: any[];
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

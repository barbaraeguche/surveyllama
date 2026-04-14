/**
 * service for generating email templates.
 */
export class EmailTemplateService {
  /**
   * generates the html and text content for a survey invitation.
   * @param title - survey title.
   * @param description - survey description.
   * @param surveyUrl - link to the survey.
   * @returns object containing html and text versions of the email.
   */
  static getSurveyInvitationTemplate(title: string, description: string | undefined, surveyUrl: string) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Survey Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
          }
          .header {
            background-color: #4f46e5;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px;
          }
          .content h2 {
            margin-top: 0;
            color: #111827;
            font-size: 20px;
            font-weight: 700;
          }
          .description {
            color: #4b5563;
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            font-style: italic;
            margin: 24px 0;
            border-left: 4px solid #4f46e5;
          }
          .cta {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            background-color: #4f46e5;
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            display: inline-block;
            transition: background-color 0.2s;
          }
          .footer {
            padding: 24px 40px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .link-fallback {
            margin-top: 24px;
            font-size: 12px;
            color: #9ca3af;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SurveyLlama</h1>
          </div>
          <div class="content">
            <h2>You're Invited!</h2>
            <p>Hello,</p>
            <p>You have been invited to participate in a new survey: <strong>"${title}"</strong>.</p>
            
            ${description ? `<div class="description">"${description}"</div>` : ''}
            
            <p>Your feedback is valuable to us. Please click the button below to get started:</p>
            
            <div class="cta">
              <a href="${surveyUrl}" class="button">Start Survey</a>
            </div>
            
            <div class="link-fallback">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${surveyUrl}" style="color: #4f46e5;">${surveyUrl}</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from SurveyLlama.<br>
            &copy; 2026 SurveyLlama. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello,

You have been invited to participate in the survey: "${title}".

${description ? `Description: ${description}\n` : ''}
Please click the link below to start:

${surveyUrl}

Thank you!
    `.trim();

    return { html, text };
  }
}

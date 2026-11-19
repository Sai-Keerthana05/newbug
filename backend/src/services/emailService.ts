import nodemailer from 'nodemailer';

interface SendReportParams {
  toEmail: string;
  originalCode: string;
  correctedCode: string;
  language: string;
  errorSummary: string;
  rootCause: string;
  explanation: string;
  videoUrl?: string;
}

export const sendReportEmail = async (params: SendReportParams): Promise<boolean> => {
  const {
    toEmail,
    originalCode,
    correctedCode,
    language,
    errorSummary,
    rootCause,
    explanation,
    videoUrl
  } = params;

  // Read config
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '2525', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@bugreplier.com';

  console.log(`Attempting to send analysis email to: ${toEmail}`);

  let transporter;

  if (user && pass) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
  } else {
    // Development/Fallback: Log report details and return true
    console.log('--- DEV EMAIL SIMULATION ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Bug Replier Code Analysis Report (${language})`);
    console.log(`Summary: ${errorSummary}`);
    console.log('----------------------------');
    // We can also create a nodemailer test account on the fly if wanted, but standard console log fallback is very reliable.
    return true;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bug Replier Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #fff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .section-title { font-size: 16px; font-weight: 600; color: #4b5563; margin-top: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
          .text-block { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 12px 15px; margin: 10px 0; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.6; }
          .root-cause { border-left-color: #f59e0b; }
          .code-block { background: #1e1e2e; color: #cdd6f4; font-family: 'Courier New', Courier, monospace; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; margin: 10px 0; line-height: 1.5; white-space: pre-wrap; }
          .btn-container { text-align: center; margin-top: 35px; }
          .btn { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bug Replier Report</h1>
            <p>AI-Powered Code Analysis & Correction (${language})</p>
          </div>
          <div class="content">
            <div class="section-title">Error Summary</div>
            <div class="text-block">${errorSummary}</div>

            <div class="section-title">Root Cause</div>
            <div class="text-block root-cause">${rootCause}</div>

            <div class="section-title">Corrected Code</div>
            <div class="code-block">${escapeHtml(correctedCode)}</div>

            <div class="section-title">Detailed Explanation</div>
            <div class="text-block" style="white-space: pre-wrap;">${explanation}</div>

            ${
              videoUrl
                ? `
              <div class="section-title">Video Explanation</div>
              <p>Your Prime video explanation is ready to view.</p>
              <div class="btn-container">
                <a href="${videoUrl}" target="_blank" class="btn">Watch Video Explanation</a>
              </div>
            `
                : ''
            }
          </div>
          <div class="footer">
            <p>Sent via Bug Replier. Empowering developers with AI.</p>
            <p>&copy; 2026 Bug Replier. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Bug Replier Support" <${fromEmail}>`,
      to: toEmail,
      subject: `Bug Replier: Code Analysis Report (${language})`,
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error('Nodemailer SMTP sending error:', error);
    throw error;
  }
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

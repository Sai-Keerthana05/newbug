import nodemailer from 'nodemailer';

export interface SendReportParams {
  toEmail: string;
  originalCode: string;
  correctedCode: string;
  language: string;
  bugTitle?: string;
  errorType?: string;
  errorSummary: string;
  rootCause: string;
  explanation: string;
  changesMade?: string[];
  verificationStatus?: string;
  preventionTips?: string[];
  videoUrl?: string;
}

export const sendReportEmail = async (params: SendReportParams): Promise<boolean> => {
  const {
    toEmail,
    originalCode,
    correctedCode,
    language,
    bugTitle,
    errorType,
    errorSummary,
    rootCause,
    explanation,
    changesMade,
    verificationStatus,
    preventionTips,
    videoUrl
  } = params;

  // Read config
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@bugreplier.com';

  console.log(`Sending Bug Replier analysis report to: ${toEmail}`);

  let transporter;

  if (user && pass && user !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Development fallback simulation
    console.log('--- DEV EMAIL REPORT GENERATED ---');
    console.log(`Recipient: ${toEmail}`);
    console.log(`Bug Title: ${bugTitle || 'Code Bug Analysis'}`);
    console.log(`Language: ${language}`);
    console.log(`Status: ${verificationStatus || 'Verified'}`);
    console.log('-----------------------------------');
    return true;
  }

  const titleText = bugTitle || `${language.toUpperCase()} Bug Resolution Report`;
  const changesHtml = changesMade && changesMade.length > 0
    ? changesMade.map(c => `<li style="margin-bottom: 6px;">${escapeHtml(c)}</li>`).join('')
    : '<li>Code logic and syntax corrected for stability.</li>';

  const tipsHtml = preventionTips && preventionTips.length > 0
    ? preventionTips.map(t => `<li style="margin-bottom: 6px;">${escapeHtml(t)}</li>`).join('')
    : '<li>Run automated tests and syntax linters before committing.</li>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(titleText)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F2; color: #292929; margin: 0; padding: 24px; }
          .container { max-width: 680px; background: #FFFFFF; margin: 0 auto; border-radius: 16px; border: 1px solid #E5E0D8; box-shadow: 0 10px 25px rgba(0,0,0,0.04); overflow: hidden; }
          .header { background: #242424; color: #FFFFFF; padding: 32px 28px; text-align: left; border-bottom: 3px solid #F28C45; }
          .header-badge { display: inline-block; background: #F28C45; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #F5F5F5; line-height: 1.3; }
          .header p { margin: 6px 0 0 0; color: #A5A5A5; font-size: 13px; }
          .content { padding: 28px; }
          .section-title { font-size: 13px; font-weight: 700; color: #77736F; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 24px; margin-bottom: 8px; }
          .text-block { background: #F9F8F6; border-left: 4px solid #F28C45; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #292929; }
          .text-block.cause { border-left-color: #D96D35; }
          .code-block { background: #1E1E1E; color: #E0E0E0; font-family: 'Consolas', 'Courier New', monospace; padding: 16px; border-radius: 10px; overflow-x: auto; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin-top: 8px; border: 1px solid #333333; }
          .status-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: #E6F4EA; color: #137333; }
          .list-block { background: #F9F8F6; padding: 16px 20px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #333; margin: 8px 0; }
          .list-block ul { margin: 0; padding-left: 20px; }
          .footer { text-align: center; padding: 24px; font-size: 12px; color: #8C867F; background-color: #F1EEE9; border-top: 1px solid #E5E0D8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="header-badge">${escapeHtml(language.toUpperCase())}</span>
            <h1>${escapeHtml(titleText)}</h1>
            <p>Bug Replier AI Debugging and Code Resolution Report</p>
          </div>
          <div class="content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div><strong>Error Type:</strong> ${escapeHtml(errorType || 'Bug Resolution')}</div>
              <span class="status-tag">${escapeHtml(verificationStatus || 'AI-Generated')}</span>
            </div>

            <div class="section-title">Identified Error</div>
            <div class="text-block">${escapeHtml(errorSummary)}</div>

            <div class="section-title">Root Cause</div>
            <div class="text-block cause">${escapeHtml(rootCause)}</div>

            <div class="section-title">Complete Corrected Code</div>
            <div class="code-block">${escapeHtml(correctedCode)}</div>

            <div class="section-title">Changes Made</div>
            <div class="list-block">
              <ul>${changesHtml}</ul>
            </div>

            <div class="section-title">Prevention Tips</div>
            <div class="list-block">
              <ul>${tipsHtml}</ul>
            </div>

            <div class="section-title">Original Submitted Code</div>
            <div class="code-block" style="opacity: 0.85;">${escapeHtml(originalCode)}</div>
          </div>
          <div class="footer">
            <p>Generated by <strong>Bug Replier</strong> &bull; Empowering developers with intelligent debugging.</p>
            <p>&copy; 2026 Bug Replier Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Bug Replier" <${fromEmail}>`,
      to: toEmail,
      subject: `Bug Replier: ${titleText} (${language.toUpperCase()})`,
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

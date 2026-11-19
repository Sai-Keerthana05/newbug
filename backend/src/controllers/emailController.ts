import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Analysis from '../models/Analysis';
import User from '../models/User';
import { sendReportEmail, sendGmailOAuthEmail } from '../services/emailService';

export const sendReport = async (req: AuthRequest, res: Response) => {
  const { analysisId, toEmail } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!analysisId || !toEmail) {
      return res.status(400).json({ message: 'Please provide analysisId and recipient email (toEmail)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ message: 'Please provide a valid recipient email address' });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Call standard SMTP email service
    await sendReportEmail({
      toEmail,
      originalCode: analysis.originalCode,
      correctedCode: analysis.correctedCode,
      language: analysis.language,
      bugTitle: analysis.bugTitle,
      errorType: analysis.errorType,
      errorSummary: analysis.errorExplanation || analysis.errorSummary,
      rootCause: analysis.rootCause,
      explanation: analysis.correctionExplanation || analysis.explanation,
      changesMade: analysis.changesMade,
      verificationStatus: analysis.verificationStatus,
      preventionTips: analysis.preventionTips,
      videoUrl: analysis.videoUrl || undefined
    });

    res.json({
      message: `Bug report successfully dispatched via Platform Mail to ${toEmail}`,
      provider: 'Platform Mail (SMTP)'
    });
  } catch (error: any) {
    console.error('Error sending report email controller:', error);
    res.status(500).json({ message: 'Server error sending email', error: error.message });
  }
};

/**
 * Send Bug Report directly through connected user Gmail using Google OAuth 2.0
 */
export const sendGmailReport = async (req: AuthRequest, res: Response) => {
  const { analysisId, toEmail } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!analysisId || !toEmail) {
      return res.status(400).json({ message: 'Please provide analysisId and recipient email (toEmail)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ message: 'Please provide a valid recipient email address' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.gmailConnected || !user.gmailEmail) {
      return res.status(400).json({
        message: 'Gmail account is not connected. Please connect your Gmail via Google OAuth in Profile Settings.',
        requiresConnect: true
      });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Dispatch report through Gmail API with OAuth 2.0
    const result = await sendGmailOAuthEmail({
      toEmail,
      userGmail: user.gmailEmail,
      accessToken: user.gmailAccessToken,
      refreshToken: user.gmailRefreshToken,
      originalCode: analysis.originalCode,
      correctedCode: analysis.correctedCode,
      language: analysis.language,
      bugTitle: analysis.bugTitle,
      errorType: analysis.errorType,
      errorSummary: analysis.errorExplanation || analysis.errorSummary,
      rootCause: analysis.rootCause,
      explanation: analysis.correctionExplanation || analysis.explanation,
      changesMade: analysis.changesMade,
      verificationStatus: analysis.verificationStatus,
      preventionTips: analysis.preventionTips,
      videoUrl: analysis.videoUrl || undefined
    });

    res.json({
      message: `Bug report successfully sent from ${user.gmailEmail} to ${toEmail} via Gmail.`,
      provider: `Gmail (${user.gmailEmail})`,
      messageId: result.messageId,
      simulated: result.simulated
    });
  } catch (error: any) {
    console.error('Error sending Gmail report:', error);
    res.status(500).json({ message: error.message || 'Failed to send email via Gmail', error: error.message });
  }
};

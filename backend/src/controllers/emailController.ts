import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Analysis from '../models/Analysis';
import { sendReportEmail } from '../services/emailService';

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

    // Call email service with complete structured report details
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

    res.json({ message: `Bug report successfully dispatched to ${toEmail}` });
  } catch (error: any) {
    console.error('Error sending report email controller:', error);
    res.status(500).json({ message: 'Server error sending email', error: error.message });
  }
};

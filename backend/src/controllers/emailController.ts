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
      return res.status(400).json({ message: 'Please provide analysisId and toEmail' });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Call email service
    await sendReportEmail({
      toEmail,
      originalCode: analysis.originalCode,
      correctedCode: analysis.correctedCode,
      language: analysis.language,
      errorSummary: analysis.errorSummary,
      rootCause: analysis.rootCause,
      explanation: analysis.explanation,
      videoUrl: analysis.videoUrl || undefined
    });

    res.json({ message: 'Report email sent successfully!' });
  } catch (error: any) {
    console.error('Error sending report email controller:', error);
    res.status(500).json({ message: 'Server error sending email', error: error.message });
  }
};

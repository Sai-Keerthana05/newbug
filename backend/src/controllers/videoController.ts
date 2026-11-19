import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Analysis from '../models/Analysis';
import { generateVideoExplanation } from '../services/videoService';

export const generateVideo = async (req: AuthRequest, res: Response) => {
  const { analysisId } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!analysisId) {
      return res.status(400).json({ message: 'Please provide analysisId' });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Call video generation service
    const videoUrl = await generateVideoExplanation({
      analysisId: analysis._id.toString(),
      language: analysis.language,
      errorSummary: analysis.errorSummary,
      rootCause: analysis.rootCause
    });

    // Save video URL to analysis model
    analysis.videoUrl = videoUrl;
    await analysis.save();

    res.json({
      message: 'Video explanation generated successfully',
      videoUrl
    });
  } catch (error: any) {
    console.error('Error generating video controller:', error);
    res.status(500).json({ message: 'Server error generating video', error: error.message });
  }
};

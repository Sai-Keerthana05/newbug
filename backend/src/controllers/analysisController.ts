import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Analysis from '../models/Analysis';
import User from '../models/User';
import { analyzeCodeWithAI } from '../services/aiService';

export const analyzeCode = async (req: AuthRequest, res: Response) => {
  const { originalCode, language, bugDescription, errorMessage, expectedBehavior } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!originalCode || !language) {
      return res.status(400).json({ message: 'Please provide code and programming language' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Call enhanced AI debugging engine with all parameters
    const aiResult = await analyzeCodeWithAI({
      code: originalCode,
      language,
      errorMessage,
      bugDescription,
      expectedBehavior
    });

    // Create Analysis record with full structured fields
    const newAnalysis = new Analysis({
      userId: user._id,
      originalCode,
      language: language.toLowerCase().trim(),
      bugDescription: bugDescription || '',
      errorMessage: errorMessage || '',
      bugTitle: aiResult.bug_title,
      errorType: aiResult.error_type,
      errorExplanation: aiResult.error_explanation,
      rootCause: aiResult.root_cause,
      problematicCode: aiResult.problematic_code,
      correctedCode: aiResult.corrected_code,
      correctionExplanation: aiResult.correction_explanation,
      changesMade: aiResult.changes_made,
      verificationStatus: aiResult.verification_status,
      testCases: aiResult.test_cases,
      preventionTips: aiResult.prevention_tips,
      errorSummary: aiResult.errorSummary,
      explanation: aiResult.explanation
    });

    const savedAnalysis = await newAnalysis.save();

    // Increment analysesUsed count for Free users
    if (user.subscription === 'Free') {
      user.analysesUsed += 1;
      await user.save();
    }

    res.status(201).json(savedAnalysis);
  } catch (error: any) {
    console.error('Error during code analysis controller execution:', error);
    res.status(500).json({ message: 'Server error during code analysis', error: error.message });
  }
};

export const getAnalysisById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving analysis', error: error.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query: any = { userId: user._id };

    // Enforce 7 days history restriction for Free plan users
    if (user.subscription === 'Free') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    const history = await Analysis.find(query).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving history' });
  }
};

export const deleteHistory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    await Analysis.deleteOne({ _id: id });
    res.json({ message: 'Analysis report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting report', error: error.message });
  }
};

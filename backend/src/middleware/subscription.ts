import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

export const checkSubscriptionLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscription === 'Prime') {
      return next();
    }

    // Free plan logic: 5 analyses per day
    const today = new Date();
    const lastReset = new Date(user.lastAnalysisResetDate);

    const isSameDay =
      today.getFullYear() === lastReset.getFullYear() &&
      today.getMonth() === lastReset.getMonth() &&
      today.getDate() === lastReset.getDate();

    if (!isSameDay) {
      user.analysesUsed = 0;
      user.lastAnalysisResetDate = today;
      await user.save();
    }

    if (user.analysesUsed >= 5) {
      return res.status(403).json({
        message: 'Daily analysis limit (5/5) reached. Upgrade to Prime for unlimited analyses!',
        limitReached: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};

export const requirePrime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user || user.subscription !== 'Prime') {
      return res.status(403).json({ message: 'Prime subscription required to access this feature.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};

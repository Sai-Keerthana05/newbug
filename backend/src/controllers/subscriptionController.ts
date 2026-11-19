import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscription: user.subscription,
      analysesUsed: user.analysesUsed,
      maxLimit: 5,
      lastAnalysisResetDate: user.lastAnalysisResetDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving subscription details' });
  }
};

export const upgradeToPrime = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = 'Prime';
    await user.save();

    res.json({
      message: 'Subscription successfully upgraded to Prime!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        analysesUsed: user.analysesUsed,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error upgrading subscription' });
  }
};

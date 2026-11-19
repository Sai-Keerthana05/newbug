import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Analysis from '../models/Analysis';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete: delete all analyses for this user
    await Analysis.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: id });

    res.json({ message: 'User and all associated analyses deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();

    const freeUsers = await User.countDocuments({ subscription: 'Free' });
    const primeUsers = await User.countDocuments({ subscription: 'Prime' });

    // Count analyses grouped by language
    const languageStats = await Analysis.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Average analyses per user
    const averageAnalysesPerUser = totalUsers > 0 ? (totalAnalyses / totalUsers).toFixed(1) : 0;

    res.json({
      totalUsers,
      totalAnalyses,
      freeUsers,
      primeUsers,
      languageStats,
      averageAnalysesPerUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving platform analytics' });
  }
};

export const upgradeUserToPrime = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.subscription = 'Prime';
    await user.save();
    res.json({ message: 'User successfully upgraded to Prime', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error upgrading user' });
  }
};


import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Analysis from '../models/Analysis';
import { AuthRequest } from '../middleware/auth';

// Helper to generate JWT Token
const generateToken = (user: any) => {
  const payload = {
    id: user._id,
    role: user.role,
    subscription: user.subscription
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'super_secret_bug_replier_jwt_key_12345',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Make the very first user an Admin, otherwise standard User
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'Admin' : 'User';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        subscription: savedUser.subscription,
        analysesUsed: savedUser.analysesUsed,
        role: savedUser.role,
        gmailConnected: Boolean(savedUser.gmailConnected),
        gmailEmail: savedUser.gmailEmail || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        analysesUsed: user.analysesUsed,
        role: user.role,
        gmailConnected: Boolean(user.gmailConnected),
        gmailEmail: user.gmailEmail || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // In a fully production setup, we would generate a password reset token, save it in the DB with expiration, and email it.
    // For this SaaS application, we will return a simulated success payload, and if SMTP is active, send a dummy link.
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_bug_replier_jwt_key_12345',
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`Password reset requested. Link: ${resetLink}`);

    res.json({
      message: 'Password reset link sent to your email (simulated). Check console logs for link if offline.',
      resetLink // Returned in response for ease of local testing/demo without SMTP config
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during forgot-password' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_bug_replier_jwt_key_12345';
    const decoded = jwt.verify(token, secret) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found or token expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch total analysis statistics
    const totalAnalyses = await Analysis.countDocuments({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        analysesUsed: user.analysesUsed,
        role: user.role,
        createdAt: user.createdAt,
        gmailConnected: Boolean(user.gmailConnected),
        gmailEmail: user.gmailEmail || '',
        totalAnalyses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error getting profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        subscription: updatedUser.subscription,
        analysesUsed: updatedUser.analysesUsed,
        role: updatedUser.role,
        gmailConnected: Boolean(updatedUser.gmailConnected),
        gmailEmail: updatedUser.gmailEmail || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

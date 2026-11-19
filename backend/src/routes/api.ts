import { Router } from 'express';
import { auth } from '../middleware/auth';
import { checkSubscriptionLimit, requirePrime } from '../middleware/subscription';
import { requireAdmin } from '../middleware/admin';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController';
import {
  analyzeCode,
  getAnalysisById,
  getHistory,
  deleteHistory
} from '../controllers/analysisController';
import {
  getSubscriptionStatus,
  upgradeToPrime
} from '../controllers/subscriptionController';
import { generateVideo } from '../controllers/videoController';
import { sendReport, sendGmailReport } from '../controllers/emailController';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  disconnectGoogle,
  connectGoogleDev
} from '../controllers/googleAuthController';
import {
  getUsers,
  deleteUser,
  getAnalytics,
  upgradeUserToPrime
} from '../controllers/adminController';

const router = Router();

// ==========================================
// Authentication routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/profile', auth, getProfile);
router.put('/auth/profile', auth, updateProfile);

// ==========================================
// Google OAuth & Gmail Integration routes
// ==========================================
router.get('/auth/google/url', auth, getGoogleAuthUrl);
router.get('/auth/google/callback', handleGoogleCallback);
router.post('/auth/google/disconnect', auth, disconnectGoogle);
router.post('/auth/google/connect-dev', auth, connectGoogleDev);

// ==========================================
// Code Analysis routes
// ==========================================
router.post('/analyze', auth, checkSubscriptionLimit, analyzeCode);
router.get('/analysis/:id', auth, getAnalysisById);
router.get('/history', auth, getHistory);
router.delete('/history/:id', auth, deleteHistory);

// ==========================================
// Subscription routes
// ==========================================
router.get('/subscription', auth, getSubscriptionStatus);
router.post('/subscription/upgrade', auth, upgradeToPrime);

// ==========================================
// Video Generation routes (Prime only)
// ==========================================
router.post('/video/generate', auth, requirePrime, generateVideo);

// ==========================================
// Email routes (All Authenticated Users)
// ==========================================
router.post('/email/send', auth, sendReport);
router.post('/email/send-gmail', auth, sendGmailReport);

// ==========================================
// Admin routes (Admin only)
// ==========================================
router.get('/admin/users', auth, requireAdmin, getUsers);
router.get('/admin/analytics', auth, requireAdmin, getAnalytics);
router.delete('/admin/user/:id', auth, requireAdmin, deleteUser);
router.put('/admin/user/:id/upgrade', auth, requireAdmin, upgradeUserToPrime);

export default router;

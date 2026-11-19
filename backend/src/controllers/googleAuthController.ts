import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const getGoogleAuthUrl = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.trim() === '' || clientId === 'your_google_client_id_here') {
    return res.json({
      configured: false,
      message: 'Google OAuth Client ID is not configured in backend/.env',
      url: null
    });
  }

  // Minimum required Gmail permission: https://www.googleapis.com/auth/gmail.send
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${req.user.id}`;

  res.json({
    configured: true,
    url: authUrl
  });
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error || !code || !state) {
    console.error('Google OAuth error or denied access:', error);
    return res.redirect(`${frontendUrl}/profile?gmail_error=${encodeURIComponent(String(error || 'Access denied'))}`);
  }

  try {
    const userId = String(state);
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${frontendUrl}/profile?gmail_error=User%20not%20found`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/profile?gmail_error=Google%20OAuth%20not%20configured`);
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData: any = await tokenRes.json();
    if (tokenData.error) {
      console.error('Error exchanging code for Google tokens:', tokenData);
      return res.redirect(`${frontendUrl}/profile?gmail_error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`);
    }

    // Fetch user profile to get verified Gmail address
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profileData: any = await profileRes.json();

    user.gmailConnected = true;
    user.gmailEmail = profileData.email || user.email;
    user.gmailAccessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      user.gmailRefreshToken = tokenData.refresh_token;
    }
    user.gmailTokenExpiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    await user.save();
    return res.redirect(`${frontendUrl}/profile?gmail=connected`);
  } catch (err: any) {
    console.error('Exception during Google OAuth callback:', err);
    return res.redirect(`${frontendUrl}/profile?gmail_error=${encodeURIComponent(err.message || 'Server error during OAuth')}`);
  }
};

export const disconnectGoogle = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.gmailConnected = false;
    user.gmailEmail = '';
    user.gmailAccessToken = '';
    user.gmailRefreshToken = '';
    user.gmailTokenExpiry = undefined;

    await user.save();

    res.json({
      message: 'Gmail account disconnected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gmailConnected: false,
        gmailEmail: ''
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error disconnecting Gmail', error: error.message });
  }
};

/**
 * Developer quick-connect helper for offline or local testing environments
 */
export const connectGoogleDev = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gmailAddress = email && email.includes('@') ? email : user.email;

    user.gmailConnected = true;
    user.gmailEmail = gmailAddress;
    user.gmailAccessToken = 'dev_mock_access_token_' + Date.now();
    user.gmailRefreshToken = 'dev_mock_refresh_token_' + Date.now();
    user.gmailTokenExpiry = new Date(Date.now() + 86400 * 1000);

    await user.save();

    res.json({
      message: `Gmail successfully connected for ${gmailAddress} (Development Mode)`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gmailConnected: true,
        gmailEmail: user.gmailEmail
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error connecting Gmail', error: error.message });
  }
};


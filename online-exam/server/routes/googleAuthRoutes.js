const express = require('express');
const router = express.Router();
const { generateGoogleAuthURL, exchangeCodeForToken, getGoogleUserInfo } = require('../config/googleOAuth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Initiate Google OAuth flow
router.get('/auth/google', (req, res) => {
  try {
    const authURL = generateGoogleAuthURL();
    res.json({ authURL });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ message: 'Failed to generate Google auth URL' });
  }
});

// Google OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const { access_token } = tokenData;

    if (!access_token) {
      return res.status(400).json({ message: 'Failed to get access token' });
    }

    // Get user info from Google
    const googleUserInfo = await getGoogleUserInfo(access_token);
    const { id: googleId, name, email, picture: avatar } = googleUserInfo;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email });

      if (user) {
        // Link existing account with Google
        user.googleId = googleId;
        user.avatar = avatar;
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: name || 'Google User',
          email,
          googleId,
          avatar,
          isEmailVerified: true,
          role: 'Student' // Default role for OAuth users
        });
        await user.save();
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Redirect to frontend with token and user data
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/error?message=${encodeURIComponent('Authentication failed')}`;
    res.redirect(errorUrl);
  }
});

// Handle Google OAuth success (for API calls)
router.post('/auth/google/success', async (req, res) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Google ID and email are required' });
    }

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email });

      if (user) {
        // Link existing account with Google
        user.googleId = googleId;
        user.avatar = avatar;
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: name || 'Google User',
          email,
          googleId,
          avatar,
          isEmailVerified: true,
          role: 'Student' // Default role for OAuth users
        });
        await user.save();
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Google authentication successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
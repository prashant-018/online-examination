const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, logout } = require('../middleware/authMiddleware');
const { validatePassword } = require('../middleware/securityMiddleware');

const router = express.Router();

// ✅ Register Route with enhanced security
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Enhanced validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address',
        code: 'INVALID_EMAIL'
      });
    }

    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet security requirements',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.errors
      });
    }

    // Role validation
    if (!['Student', 'Teacher', 'Admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role specified',
        code: 'INVALID_ROLE'
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isEmailVerified: false
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.status(201).json({
      message: 'User registered successfully',
      code: 'REGISTRATION_SUCCESS',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ Login Route with enhanced security
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to multiple failed login attempts',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact administrator',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(400).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin
    };

    res.json({
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Login failed',
      code: 'LOGIN_ERROR',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ Logout Route
router.post('/logout', auth, logout, (req, res) => {
  res.json({
    message: 'Logged out successfully',
    code: 'LOGOUT_SUCCESS'
  });
});

// ✅ Verify Token Route
router.get('/verify', auth, (req, res) => {
  res.json({
    message: 'Token is valid',
    code: 'TOKEN_VALID',
    user: req.user
  });
});

// ✅ Refresh Token Route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Get user
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      code: 'TOKEN_REFRESHED',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({
      message: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_ERROR'
    });
  }
});

// ✅ Change Password Route
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      });
    }

    // Password strength validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'New password does not meet security requirements',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.errors
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
      code: 'PASSWORD_CHANGED'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({
      message: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

module.exports = router;

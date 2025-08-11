const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

// Add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Remove from blacklist after token expiry (7 days)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({
        message: 'Access Denied. No Token Provided.',
        code: 'NO_TOKEN'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        message: 'Token has been invalidated. Please login again.',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiry
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Check if user's role has changed since token was issued
    if (decoded.role && decoded.role !== user.role) {
      return res.status(401).json({
        message: 'User role has changed. Please login again.',
        code: 'ROLE_CHANGED'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    };

    // Add token info for potential use
    req.token = {
      token,
      decoded,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000)
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Auth middleware error:', err);
    res.status(500).json({
      message: 'Server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    if (isTokenBlacklisted(token)) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.isActive && (!user.lockUntil || user.lockUntil <= Date.now())) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      };
    }

    next();
  } catch (err) {
    // Continue without authentication on any error
    next();
  }
};

// Refresh token middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required.',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Get user
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid refresh token.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    req.newToken = newToken;
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({
      message: 'Invalid refresh token.',
      code: 'REFRESH_TOKEN_ERROR'
    });
  }
};

// Logout middleware
const logout = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
      // Add token to blacklist
      blacklistToken(token);
    }

    next();
  } catch (err) {
    console.error('Logout error:', err);
    next();
  }
};

module.exports = {
  auth,
  optionalAuth,
  refreshToken,
  logout,
  blacklistToken,
  isTokenBlacklisted
};

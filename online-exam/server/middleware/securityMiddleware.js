const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again later.'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests. Please try again later.'
);

const examSubmissionLimiter = createRateLimit(
  60 * 1000, // 1 minute
  3, // 3 submissions
  'Too many exam submissions. Please wait before trying again.'
);

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize and validate common input fields
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        if (key === 'email') {
          req.body[key] = sanitizeEmail(req.body[key]);
        } else {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

// Password strength validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Prevent caching of sensitive routes
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Log security-related events
    if (res.statusCode >= 400) {
      console.warn('Security Event:', logData);
    } else {
      console.log('Request:', logData);
    }
  });

  next();
};

// CSRF protection middleware (basic implementation)
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];

  // For now, we'll implement a basic check
  // In production, you should use a proper CSRF library
  if (!csrfToken) {
    console.warn('CSRF token missing for request:', req.method, req.url);
  }

  next();
};

// IP whitelist middleware (optional)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No restrictions
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        message: 'Access denied. IP not in whitelist.'
      });
    }

    next();
  };
};

// Account lockout middleware
const accountLockoutCheck = async (req, res, next) => {
  try {
    // This middleware should be used after authentication
    if (req.user) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);

      if (user && user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({
          message: 'Account is temporarily locked due to multiple failed login attempts.',
          lockUntil: user.lockUntil
        });
      }
    }

    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next();
  }
};

module.exports = {
  authLimiter,
  generalLimiter,
  examSubmissionLimiter,
  validateInput,
  validatePassword,
  sessionSecurity,
  requestLogger,
  csrfProtection,
  ipWhitelist,
  accountLockoutCheck
}; 
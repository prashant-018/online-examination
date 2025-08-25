const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration for Google OAuth
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005'
];

// Dynamic CORS origin function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log unknown origins for debugging
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Accept'
  ],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// Enhanced security headers for Google OAuth
app.use((req, res, next) => {
  // Fix Cross-Origin-Opener-Policy for Google OAuth
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_exam';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Running without database - using mock data');
  }
};

// Import Models
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const ExamResult = require('./models/ExamResult');

// Import Controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const examController = require('./controllers/examController');
const questionController = require('./controllers/questionController');

// Import Middleware
const { auth, optionalAuth } = require('./middleware/authMiddleware');
const { roleCheck, canAccessExam, canModifyExam } = require('./middleware/roleMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examResultRoutes = require('./routes/examResultRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

// Basic routes for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'Configured for Google OAuth',
    origins: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exam-results', examResultRoutes);
app.use('/api/auth/google', googleAuthRoutes);

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '123243172421-28rsh7uj9gjiiimsa0r55tcjgc0qq2if.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Google OAuth Routes (fallback if routes file doesn't exist)
app.get('/api/auth/google', (req, res) => {
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.json({
    message: 'Google OAuth URL generated',
    authUrl: googleAuthUrl,
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: redirectUri
  });
});

app.get('/api/auth/google/callback', (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      message: 'Authorization code not provided',
      code: 'MISSING_AUTH_CODE'
    });
  }

  // Mock Google OAuth callback response
  const mockUser = {
    id: 'google-user-123',
    name: 'Google Test User',
    email: 'google@example.com',
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    provider: 'google'
  };

  // Redirect to frontend with user data
  const userData = encodeURIComponent(JSON.stringify(mockUser));
  const redirectUrl = `${FRONTEND_URL}/auth/google/success?user=${userData}`;

  res.redirect(redirectUrl);
});

app.post('/api/auth/google/success', async (req, res) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required for Google login',
        code: 'MISSING_EMAIL'
      });
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
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Google login successful',
      code: 'GOOGLE_LOGIN_SUCCESS',
      token: token,
      user: userResponse,
      expiresIn: 7 * 24 * 60 * 60
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      message: 'Google login failed',
      code: 'GOOGLE_LOGIN_ERROR',
      error: error.message
    });
  }
});

// User routes (fallback if routes file doesn't exist)
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
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
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Mock response for now
    res.status(201).json({
      message: 'User registered successfully',
      code: 'REGISTRATION_SUCCESS',
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        name,
        email,
        role,
        isVerified: false
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Mock response for now
    res.json({
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        name: 'Test User',
        email,
        role: 'Student',
        isVerified: true
      },
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Auth routes (fallback if routes file doesn't exist)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      code: 'REGISTRATION_SUCCESS',
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        name,
        email,
        role,
        isVerified: false
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    res.json({
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        name: 'Test User',
        email,
        role: 'Student',
        isVerified: true
      },
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      code: 'INVALID_ID'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value',
      code: 'DUPLICATE_ERROR'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 CORS enabled for Google OAuth`);
  console.log(`🛡️ Security headers configured`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});

// Connect to database
connectDB();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app; 
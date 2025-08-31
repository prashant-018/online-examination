const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const detect = require('detect-port');

// Load environment variables
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ------------------- CORS CONFIG -------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174', // Handle port conflicts
  'http://localhost:5175',
  'https://onlineexaam.netlify.app',
  'https://online-examination-4-nqz9.onrender.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests with no origin (like Postman/curl)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  // Allow specific origins
  else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  // Allow Netlify preview domains (pattern: https://xxxx--onlineexaam.netlify.app)
  else if (origin.match(/^https:\/\/.*--onlineexaam\.netlify\.app$/)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// ------------------- BASIC ROUTES -------------------
app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'CORS test success' });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ------------------- DATABASE -------------------
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_exam';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};

// ------------------- MODELS -------------------
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const ExamResult = require('./models/ExamResult');

// ------------------- CONTROLLERS -------------------
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const examController = require('./controllers/examController');
const questionController = require('./controllers/questionController');

// ------------------- MIDDLEWARE -------------------
const { auth, optionalAuth } = require('./middleware/authMiddleware');
const { roleCheck, canAccessExam, canModifyExam } = require('./middleware/roleMiddleware');

// ------------------- ROUTES -------------------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examResultRoutes = require('./routes/examResultRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'Configured',
    origins: allowedOrigins,
    netlifyPreview: 'Supports https://xxxx--onlineexaam.netlify.app pattern',
    noOrigin: 'Supports requests with no origin (Postman/curl)',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exam-results', examResultRoutes);
app.use('/api/auth/google', googleAuthRoutes);

// ------------------- AUTH VERIFY -------------------
app.get('/api/auth/verify', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await require('./models/User')
      .findById(payload.userId)
      .select('-password')
      .lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ user, ok: true });
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// ------------------- STATIC FILES -------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------- 404 HANDLER -------------------
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err);

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

// ------------------- START SERVER -------------------
let server;
(async () => {
  try {
    const requestedPort = Number(process.env.PORT) || 5000;
    const freePort = await detect(requestedPort);
    if (freePort !== requestedPort) {
      console.warn(`⚠️  Port ${requestedPort} is busy. Using free port ${freePort} instead.`);
    }
    process.env.PORT = String(freePort);
    server = app.listen(freePort, () => {
      console.log(`🚀 Server running on port ${freePort}`);
      console.log(`📡 Health check: http://localhost:${freePort}/api/health`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
      console.log(`🔗 Netlify preview domains: https://xxxx--onlineexaam.netlify.app`);
      console.log(`🔧 No-origin requests: Supported (Postman/curl)`);
    });
    server.on('error', (err) => {
      console.error('❌ Server start error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

// ------------------- CONNECT DB -------------------
connectDB();

// ------------------- GRACEFUL SHUTDOWN -------------------
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

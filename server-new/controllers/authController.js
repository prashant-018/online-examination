const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '1h';

const VALID_ROLES = ['Student', 'Teacher'];

const mockUsers = new Map();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toSafeUser(userLike) {
  const obj = typeof userLike.toObject === 'function' ? userLike.toObject() : { ...userLike };
  delete obj.password;
  delete obj.__v;
  return obj;
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role, image, google } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required', code: 'MISSING_FIELDS' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role', code: 'INVALID_ROLE' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isDbConnected()) {
      const existing = await User.findOne({ email: normalizedEmail }).lean();
      if (existing) {
        return res.status(400).json({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
      }

      const user = new User({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim(),
        email: normalizedEmail,
        password,
        role,
        image: image || null,
        google: Boolean(google),
      });

      await user.save();

      const token = signToken({ id: user._id, role: user.role });
      return res.status(201).json({
        message: 'User registered successfully',
        code: 'REGISTRATION_SUCCESS',
        token,
        user: toSafeUser(user),
        expiresIn: 3600,
      });
    }

    // Fallback: mock store
    if (mockUsers.has(normalizedEmail)) {
      return res.status(400).json({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const mockUser = {
      id: 'mock-' + Date.now(),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim(),
      email: normalizedEmail,
      password: hashed,
      role,
      image: image || null,
      google: Boolean(google),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.set(normalizedEmail, mockUser);

    const token = signToken({ id: mockUser.id, role: mockUser.role });

    return res.status(201).json({
      message: 'User registered successfully',
      code: 'REGISTRATION_SUCCESS',
      token,
      user: toSafeUser(mockUser),
      expiresIn: 3600,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed', code: 'REGISTRATION_ERROR' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required', code: 'MISSING_CREDENTIALS' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      const token = signToken({ id: user._id, role: user.role });
      const safe = toSafeUser(user);
      return res.status(200).json({
        message: 'Login successful',
        code: 'LOGIN_SUCCESS',
        token,
        user: safe,
        expiresIn: 3600,
      });
    }

    // Fallback: mock store
    const mockUser = mockUsers.get(normalizedEmail);
    if (!mockUser) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const ok = await bcrypt.compare(password, mockUser.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = signToken({ id: mockUser.id, role: mockUser.role });
    return res.status(200).json({
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      token,
      user: toSafeUser(mockUser),
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', code: 'LOGIN_ERROR' });
  }
}

module.exports = { register, login };
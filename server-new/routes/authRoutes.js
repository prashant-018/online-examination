const express = require('express');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.get('/', (req, res) => {
  res.json({ message: 'Auth routes placeholder' });
});

router.post('/register', register);
router.post('/login', login);

router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing token', code: 'MISSING_TOKEN' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ message: 'Token valid', code: 'TOKEN_VALID', user: { id: payload.id, role: payload.role } });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
});

module.exports = router;
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'User routes placeholder' });
});

// Mirror endpoints expected by frontend
router.post('/register', register);
router.post('/login', login);

// Basic profile endpoints to satisfy frontend calls
router.put('/profile', (req, res) => {
  res.json({ message: 'Profile updated (mock)', code: 'PROFILE_UPDATED' });
});

router.post('/profile/picture', (req, res) => {
  res.json({ message: 'Profile picture uploaded (mock)', code: 'PICTURE_UPLOADED', url: '/uploads/mock.jpg' });
});

module.exports = router;
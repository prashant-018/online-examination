const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { auth } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const User = require('../models/User');

// Registration and login routes expected by the frontend
router.post('/register', authController.register);
router.post('/login', authController.login);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
		cb(null, `${Date.now()}_${base}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) cb(null, true);
	else cb(new Error('Only image uploads are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload profile picture
router.post('/profile/picture', auth, upload.single('avatar'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
		const filename = req.file.filename;
		await User.findByIdAndUpdate(req.user._id, { avatar: filename });
		return res.json({ message: 'Avatar uploaded', avatar: filename });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to upload avatar' });
	}
});

// Update profile basic fields
router.put('/profile', auth, async (req, res) => {
	try {
		const { name, email, role } = req.body;
		const updated = await User.findByIdAndUpdate(
			req.user._id,
			{ name, email, role },
			{ new: true }
		).select('-password');
		return res.json({ message: 'Profile updated', user: updated });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to update profile' });
	}
});

module.exports = router;








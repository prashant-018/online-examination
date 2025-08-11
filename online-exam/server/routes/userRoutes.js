const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { isAdmin, isTeacher } = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getProfilePicture,
  changeUserRole,
  toggleUserStatus,
  getAllUsers,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - require authentication
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Profile picture routes
router.post('/profile/picture', auth, upload.single('avatar'), uploadProfilePicture);
router.get('/profile/picture', auth, getProfilePicture);

// Admin only routes
router.get('/all', auth, isAdmin, getAllUsers);
router.get('/stats', auth, isAdmin, getUserStats);
router.put('/role', auth, isAdmin, changeUserRole);
router.put('/status', auth, isAdmin, toggleUserStatus);
router.delete('/delete', auth, isAdmin, deleteUser);

// Teacher routes (can view students)
router.get('/students', auth, isTeacher, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = { role: 'Student' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const students = await require('../models/User').find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await require('../models/User').countDocuments(query);

    res.json({
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        studentsPerPage: parseInt(limit)
      }
    });

  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
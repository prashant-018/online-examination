const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsBySubject,
  bulkCreateQuestions,
  validateQuestion
} = require('../controllers/questionController');

// Public routes
router.get('/', getAllQuestions);
router.get('/subject/:subject', getQuestionsBySubject);
router.get('/:id', getQuestionById);

// Protected routes - require authentication
router.post('/', auth, createQuestion);
router.post('/bulk', auth, bulkCreateQuestions);
router.post('/validate', auth, validateQuestion);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router; 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createExam,
  getAllExams,
  getExamsByTeacher,
  getExamById,
  updateExam,
  deleteExam,
  addQuestionsToExam,
  removeQuestionsFromExam,
  getExamQuestions,
  reorderExamQuestions,
  getExamStats
} = require('../controllers/examController');

// Public routes (require authentication)
router.get('/', auth, getAllExams);
router.get('/:id', auth, getExamById);

// Teacher routes - require authentication and teacher role
router.get('/teacher/exams', auth, getExamsByTeacher);
router.post('/', auth, createExam);
router.put('/:id', auth, updateExam);
router.delete('/:id', auth, deleteExam);
router.post('/:id/questions', auth, addQuestionsToExam);
router.delete('/:id/questions', auth, removeQuestionsFromExam);
router.get('/:id/questions', auth, getExamQuestions);
router.put('/:id/questions/reorder', auth, reorderExamQuestions);
router.get('/:id/stats', auth, getExamStats);

module.exports = router; 
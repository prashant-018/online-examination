const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const examController = require('../controllers/examController');
const questionController = require('../controllers/questionController');

// All authenticated users
router.get('/', auth, examController.listExams);
router.get('/:id', auth, examController.getExam);

// Teachers only - get their own exams
router.get('/teacher/exams', auth, roleCheck('Teacher'), examController.getTeacherExams);

// Teachers only
router.post('/', auth, roleCheck('Teacher'), examController.createExam);
router.put('/:id', auth, roleCheck('Teacher'), examController.updateExam);
router.delete('/:id', auth, roleCheck('Teacher'), examController.deleteExam);

// Exam question subroutes (Teachers only)
router.get('/:examId/questions', auth, roleCheck('Teacher'), questionController.listExamQuestions);
router.post('/:examId/questions', auth, roleCheck('Teacher'), questionController.addQuestionsToExam);
router.delete('/:examId/questions', auth, roleCheck('Teacher'), questionController.removeQuestionsFromExam);
router.put('/:examId/questions/reorder', auth, roleCheck('Teacher'), questionController.reorderExamQuestions);

module.exports = router;

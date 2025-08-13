const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const examController = require('../controllers/examController');

// All authenticated users
router.get('/', auth, examController.listExams);
router.get('/:id', auth, examController.getExam);

// Teachers only - get their own exams
router.get('/teacher/exams', auth, roleCheck('Teacher'), examController.getTeacherExams);

// Teachers only
router.post('/', auth, roleCheck('Teacher'), examController.createExam);
router.put('/:id', auth, roleCheck('Teacher'), examController.updateExam);
router.delete('/:id', auth, roleCheck('Teacher'), examController.deleteExam);

module.exports = router;








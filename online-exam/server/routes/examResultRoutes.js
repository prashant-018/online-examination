const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { isTeacher, isAdmin } = require('../middleware/roleMiddleware');

// Create exam result (submit exam)
router.post('/', auth, async (req, res) => {
  try {
    const ExamResult = require('../models/ExamResult');
    const { student, exam, answers, totalMarks, marksObtained, percentage, isPassed, startTime, endTime, duration, status } = req.body;

    // Validate required fields
    if (!student || !exam || !answers || !totalMarks || !marksObtained || !percentage || !isPassed || !startTime) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if student is submitting their own exam
    if (student !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit your own exam' });
    }

    const examResult = new ExamResult({
      student,
      exam,
      answers,
      totalMarks,
      marksObtained,
      percentage,
      isPassed,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      duration,
      status: status || 'Completed'
    });

    await examResult.save();

    const populatedResult = await ExamResult.findById(examResult._id)
      .populate('student', 'name email')
      .populate('exam', 'title subject');

    res.status(201).json({
      message: 'Exam submitted successfully',
      result: populatedResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exam results for a student
router.get('/student/:examId', auth, async (req, res) => {
  try {
    const ExamResult = require('../models/ExamResult');
    const { examId } = req.params;

    const results = await ExamResult.find({
      student: req.user.id,
      exam: examId
    }).populate('exam', 'title subject totalMarks passingMarks');

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exam results for a teacher (all students who took the exam)
router.get('/exam/:examId', auth, isTeacher, async (req, res) => {
  try {
    const ExamResult = require('../models/ExamResult');
    const Exam = require('../models/Exam');
    const { examId } = req.params;

    // Check if teacher created this exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view results for this exam' });
    }

    const results = await ExamResult.find({ exam: examId })
      .populate('student', 'name email')
      .populate('exam', 'title subject totalMarks passingMarks')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all results for a student
router.get('/student', auth, async (req, res) => {
  try {
    const ExamResult = require('../models/ExamResult');

    const results = await ExamResult.find({ student: req.user.id })
      .populate('exam', 'title subject totalMarks passingMarks')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    marksObtained: Number,
    timeSpent: Number // in seconds
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned'],
    default: 'In Progress'
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Index for efficient queries
examResultSchema.index({ student: 1, exam: 1, attemptNumber: 1 });
examResultSchema.index({ exam: 1, status: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema); 
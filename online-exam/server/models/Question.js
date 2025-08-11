const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay'],
    default: 'Multiple Choice'
  },
  options: [String], // For multiple choice questions
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true, default: 1 },
  explanation: String, // Explanation for the correct answer
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  subject: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema); 
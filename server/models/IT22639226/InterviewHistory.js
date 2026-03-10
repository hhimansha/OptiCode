// models/InterviewHistory.js
import mongoose from 'mongoose';

const interviewHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  task: String, 
  code: String,
   skillLevel: { type: String, default: 'Beginner' }, // 
  duration: { type: Number, required: true },
  conversation: [{
    speaker: String,
    text: String,
    timestamp: String,
    emotion: { type: String, default: 'Neutral' }
  }],
  // Store marks per question and overall score
  questionsAnalysis: [{
    question: String,
    userAnswer: String,
    feedback: String,
    marksOutOf10: Number
  }],
  overallScore: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('InterviewHistory', interviewHistorySchema);
// models/InterviewQuestion.js
import mongoose from 'mongoose';

const InterviewQuestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // linked user
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      useranswer: { type: String, default: "" } // field to store user's answer
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const InterviewQuestion = mongoose.model('InterviewQuestion', InterviewQuestionSchema);

export default InterviewQuestion;

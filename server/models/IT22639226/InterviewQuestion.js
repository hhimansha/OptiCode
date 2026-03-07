import mongoose from 'mongoose';

const InterviewQuestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: String, required: true },
  code: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const InterviewQuestion = mongoose.model('InterviewQuestion', InterviewQuestionSchema);

export default InterviewQuestion;
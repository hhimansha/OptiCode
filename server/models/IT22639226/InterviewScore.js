// models/IT22639226/InterviewScore.js
import mongoose from "mongoose";

const interviewScoreSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  task: { type: String, required: true },
  code: { type: String, required: true },
  skillLevel: { type: String, default: "Beginner" },
  duration: { type: Number, required: true },
  conversation: [
    {
      speaker: String,
      text: String,
      timestamp: String,
      emotion: { type: String, default: "Neutral" }
    }
  ],
  questionsAnalysis: [
    {
      question: String,
      userAnswer: String,
      feedback: String,
      marksOutOf10: Number
    }
  ],
  overallScore: { type: String, required: true },
  // ✅ Add this field
  emotionAnalysis: {
    type: Map,
    of: Number, // e.g., { "Neutral": 60, "Happy": 20, "Confused": 20 }
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("InterviewScore", interviewScoreSchema);
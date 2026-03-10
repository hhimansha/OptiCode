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

    emotionTimeline: [
    {
      timestamp: { type: String, required: true },
      emotion: { type: String, default: "Neutral" },
      durationSec: { type: Number, default: 60 } // How long the user stayed in this emotion
    }
  ],
  // ✅ Add this field
 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("InterviewScore", interviewScoreSchema);
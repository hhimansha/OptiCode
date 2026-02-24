import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  task: String,
  weakness: String,
  skillLevel: String,
  solved: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const studentProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillLevel: { type: String, default: "Beginner" },
  totalSolved: { type: Number, default: 0 },
  weaknessHistory: { type: Map, of: Number, default: {} },
  sessions: [sessionSchema]
});

export default mongoose.model("StudentProgress", studentProgressSchema);
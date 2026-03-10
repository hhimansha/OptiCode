import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  task:             String,
  weakness:         String,
  concept:          String,
  learningMode:     { type: String, default: "level_up" }, // "level_up" or "improve_concept"
  skillLevel:       String,
  solved:           Boolean,
  timeTakenSeconds: { type: Number, default: 0 },
  taskLevel:        { type: String, default: null },
  codeSubmission:   String,
  timestamp:        { type: Date, default: Date.now }
});

const conceptProgressSchema = new mongoose.Schema({
  attempts:      { type: Number, default: 0 },
  solved:        { type: Number, default: 0 },
  mastery:       { type: Number, default: 0.2 },
  avgSolveTime:  { type: Number, default: 0 }
}, { _id: false });

const studentProgressSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillLevel:   { type: String, default: "Beginner" },
  totalSolved:  { type: Number, default: 0 },
  totalXP:      { type: Number, default: 0 },
  conceptProgress: { type: Map, of: conceptProgressSchema, default: {} },
  preferredLearningMode: { type: String, default: "level_up" },
  targetConcept: { type: String, default: null },

  // BKT — Bayesian Knowledge Tracing mastery probability
  // Source: Corbett & Anderson (1994)
  bktMastery:   { type: Number, default: 0.2 },

  // Khan Academy — accuracy and streak tracking
  solvedAtCurrentLevel:    { type: Number, default: 0 },
  consecutiveCleanSolves:  { type: Number, default: 0 },

  // Duolingo — time performance tracking
  avgSolveTime: { type: Number, default: 0 },
  zpd_boost:    { type: Boolean, default: false },
  weaknessHistory: { type: Map, of: Number, default: {} },
  sessions:        [sessionSchema]
});

export default mongoose.model("StudentProgress", studentProgressSchema);
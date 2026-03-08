import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  task: String,
  codeSubmission: String,
  solved: Boolean,
  skillLevel: String,
  taskLevel: String,
  timeTakenSeconds: Number
});

const studentProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sessions: [sessionSchema]
  },
  { timestamps: true }
);

export default mongoose.model(
  "StudentProgress",
  studentProgressSchema
);
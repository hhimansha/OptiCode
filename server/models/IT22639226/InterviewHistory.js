import mongoose from 'mongoose';

const interviewHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true // Stored in seconds
  },
  conversation: [{
    speaker: String,
    text: String,
    timestamp: String,
    emotion: { 
      type: String, 
      default: 'Neutral' // Defaults to Neutral if no emotion is detected
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('InterviewHistory', interviewHistorySchema);
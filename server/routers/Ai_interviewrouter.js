// routes/interviewRoutes.js
import express from 'express';
import userAuth from '../middlewares/Userauth.js';
import InterviewHistory from '../models/IT22639226/InterviewHistory.js';
import InterviewQuestion from '../models/IT22639226/InterviewQuestion.js'; // Import the other model

const router = express.Router();

router.post('/save-history', userAuth, async (req, res) => {
  try {
    const { conversation, duration } = req.body;
    const userId = req.userId; // Provided by your userAuth middleware

    // 1. Fetch the latest Task and Code for this user from the InterviewQuestion database
    const latestQuestionData = await InterviewQuestion.findOne({ user: userId })
      .sort({ createdAt: -1 }); // Gets the most recent one

    if (!latestQuestionData) {
      return res.status(404).json({ 
        success: false, 
        message: 'No interview questions/tasks found for this user.' 
      });
    }

    // 2. Create the history record using data from the DB + data from the request body
    const newHistory = new InterviewHistory({
      userId: userId,
      task: latestQuestionData.task, // Pulled from InterviewQuestion DB
      code: latestQuestionData.code,
      skillLevel: latestQuestionData.skillLevel || "Beginner", // Pulled from InterviewQuestion DB
      conversation,
      duration
    });

    // 3. Save to History database
    await newHistory.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Interview history saved successfully with task and code data.',
      data: newHistory
    });

  } catch (error) {
    console.error('Error saving interview history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
});

export default router;
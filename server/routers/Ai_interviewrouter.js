import express from 'express';
import userAuth from '../middlewares/Userauth.js';
import InterviewHistory from '../models/IT22639226/InterviewHistory.js'; // Adjust path as needed

const router = express.Router();

router.post('/save-history', userAuth, async (req, res) => {
  try {
    const { conversation, duration } = req.body;
    
    // req.userId is provided by the userAuth middleware
    const newHistory = new InterviewHistory({
      userId: req.userId,
      conversation,
      duration
    });

    await newHistory.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Interview history saved successfully' 
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
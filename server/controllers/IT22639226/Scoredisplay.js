// controllers/IT22639226/scoreController.js
import InterviewScore from "../../models/IT22639226/InterviewScore.js";

export const getUserInterviewResults = async (req, res) => {
  try {
    const userId = req.userId;

    const results = await InterviewScore.find({ userId })
      .select(
        "task code skillLevel questionsAnalysis overallScore duration createdAt emotionTimeline"
      )
      .sort({ createdAt: -1 }); // latest first

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No interview results found for this user",
      });
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching results",
    });
  }
};
import StudentProgress from "../../models/StudentProgress.js"; 

export const getLatestSession = async (req, res) => {
  try {
    // 1. Get the userId from the auth middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    // 2. Find the progress document for this user
    const progress = await StudentProgress.findOne({ userId });

    if (!progress || !progress.sessions || progress.sessions.length === 0) {
      return res.status(404).json({ 
        message: "No learning sessions found for this user." 
      });
    }

    // 3. Get the most recent session (last item in the array)
    // This matches the structure in your screenshot where 'sessions' is an array
    const latestSession = progress.sessions[progress.sessions.length - 1];

    // 4. Return the specific task and code submission
    res.status(200).json({
      success: true,
      data: {
        task: latestSession.task,
        codeSubmission: latestSession.codeSubmission,
        skillLevel: latestSession.skillLevel,
        taskLevel: latestSession.taskLevel
      }
    });

  } catch (error) {
    console.error("Error fetching latest session:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};
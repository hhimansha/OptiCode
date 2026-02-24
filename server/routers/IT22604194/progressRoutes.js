import express from "express";
import StudentProgress from "../../models/IT22604194/StudentProgress.js";

const router = express.Router();

// Save a session
router.post("/save", async (req, res) => {
  try {
    const { userId, task, weakness, skillLevel, solved } = req.body;

    let progress = await StudentProgress.findOne({ userId });

    if (!progress) {
      progress = new StudentProgress({ userId, skillLevel });
    }

    // Add session
    progress.sessions.push({ task, weakness, skillLevel, solved });

    // Update weakness history
    if (weakness && solved) {
      const current = progress.weaknessHistory.get(weakness) || 0;
      progress.weaknessHistory.set(weakness, current + 1);
    }

    // Update total solved
    if (solved) progress.totalSolved += 1;

    // Auto level up logic
    if (progress.totalSolved >= 10 && progress.skillLevel === "Beginner") {
      progress.skillLevel = "Intermediate";
    } else if (progress.totalSolved >= 25 && progress.skillLevel === "Intermediate") {
      progress.skillLevel = "Advanced";
    }

    await progress.save();
    res.json({ success: true, skillLevel: progress.skillLevel, totalSolved: progress.totalSolved });

  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Get student profile
router.get("/:userId", async (req, res) => {
  try {
    const progress = await StudentProgress.findOne({ userId: req.params.userId });
    if (!progress) return res.json({ totalSolved: 0, skillLevel: "Beginner", sessions: [], weaknessHistory: {} });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Failed to get progress" });
  }
});

export default router;
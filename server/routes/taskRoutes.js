import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * POST /api/tasks/generate
 * Body: { student_skill: number }
 */
router.post("/generate", async (req, res) => {
  try {
    const { student_skill } = req.body;

    if (!student_skill) {
      return res.status(400).json({ error: "student_skill is required" });
    }

    const prompt = `Generate a Python coding task for skill level ${student_skill}`;

    const HF_API_URL =
      "https://ashani-shashikala-qwen-lora-task-generator.hf.space/generate";

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HF API error ${response.status}`);
    }

    const data = await response.json();
    const fullText = data.response || "";

    // ONLY return the task sentence
    const taskLine = fullText
      .split("\n")
      .find(line => line.trim().toLowerCase().startsWith("task:"));

    res.json({
      generated_task: taskLine || "Task generation failed",
    });
  } catch (error) {
    console.error("Task generation failed:", error);
    res.status(500).json({
      error: "Task generation failed",
      details: error.message,
    });
  }
});

export default router;

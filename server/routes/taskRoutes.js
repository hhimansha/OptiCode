import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * POST /api/tasks/generate
 * Body: { student_skill, confidence, categoryScores }
 */
router.post("/generate", async (req, res) => {
  try {
    const { student_skill, confidence, categoryScores } = req.body;

    if (!student_skill) {
      return res.status(400).json({ error: "student_skill is required" });
    }

    //  Compute weakest area PER REQUEST
    let weakestArea = "general problem solving";

    if (categoryScores && typeof categoryScores === "object") {
      weakestArea = Object.entries(categoryScores)
        .sort((a, b) => a[1] - b[1])[0][0];
    }

    let prompt = "";

    if (student_skill <= 2) {
      prompt = `
You are an adaptive coding tutor.

Student profile:
- Level: Beginner
- Confidence: ${confidence}%
- Weak area: ${weakestArea}

Generate ONE simple Python task that helps improve the weak area.
Use print, variables, loops, or simple conditions.

Return ONLY one line starting with "Task:".
`;
    } else if (student_skill <= 4) {
      prompt = `
You are an adaptive coding tutor.

Student profile:
- Level: Intermediate
- Confidence: ${confidence}%
- Weak area: ${weakestArea}

Generate ONE Python task that focuses on improving this weak area.
Functions and loops allowed.
No advanced algorithms.

Return ONLY one line starting with "Task:".
`;
    } else {
      prompt = `
You are an adaptive coding tutor.

Student profile:
- Level: Advanced
- Confidence: ${confidence}%
- Weak area: ${weakestArea}

Generate ONE challenging Python task that targets this weak area.
Algorithms or data structures allowed.

Return ONLY one line starting with "Task:".
`;
    }

    const HF_API_URL =
      "https://ashani-shashikala-qwen-lora-task-generator-own.hf.space/generate";

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

    //  Extract task safely
    let taskLine = null;

    const inlineMatch = fullText.match(/Task:\s*(.+)/i);
    if (inlineMatch && inlineMatch[1].trim().length > 3) {
      taskLine = "Task: " + inlineMatch[1].trim();
    }

    if (!taskLine) {
      const lines = fullText
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      const taskIndex = lines.findIndex(l => l.toLowerCase() === "task:");
      if (taskIndex !== -1 && lines[taskIndex + 1]) {
        taskLine = "Task: " + lines[taskIndex + 1];
      }
    }

    if (!taskLine) {
      taskLine = "Task: Write a simple Python program related to this skill level.";
    }

    res.json({ generated_task: taskLine });

  } catch (error) {
    console.error("Task generation failed:", error);
    res.status(500).json({
      error: "Task generation failed",
      details: error.message,
    });
  }
});

export default router;

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

    let prompt = "";

if (student_skill <= 2) {
  prompt = `
You are an adaptive coding tutor.

Generate ONE very simple Python coding task for a beginner student.

Guidelines:
- Use basic concepts like print, variables, loops, or simple if statements
- Keep the task suitable for a first-week Python learner



Now generate a new task.
`;
}


else if (student_skill <= 4) {
  prompt = `
You are an adaptive coding tutor.

Generate ONE Python coding task for an intermediate student.

Guidelines:
- Functions and loops are allowed
- Simple problem-solving tasks (e.g., sum, factorial, list processing)


Now generate a new task.
`;
}


else {
  prompt = `
You are an adaptive coding tutor.

Generate ONE challenging Python coding task for an advanced student.

Guidelines:
- Algorithms, recursion, or data structures are allowed



Now generate a new task.
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

    // ONLY return the task sentence
  let taskLine = null;

// Case 1: Task and content on the same line
const inlineMatch = fullText.match(/Task:\s*(.+)/i);
if (inlineMatch && inlineMatch[1].trim().length > 3) {
  taskLine = "Task: " + inlineMatch[1].trim();
}

// Case 2: "Task:" on one line, content on next line
if (!taskLine) {
  const lines = fullText
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const taskIndex = lines.findIndex(
    l => l.toLowerCase() === "task:"
  );

  if (taskIndex !== -1 && lines[taskIndex + 1]) {
    taskLine = "Task: " + lines[taskIndex + 1];
  }
}

// Final safe fallback
if (!taskLine) {
  taskLine = "Task: Write a simple Python program related to this skill level.";
}

res.json({
  generated_task: taskLine,
});


// fallback if "Task:" is missing or malformed
//if (!taskLine && fullText.length > 0) {
  //taskLine = "Task: " + fullText.split("\n")[0].trim();
//}



  } catch (error) {
    console.error("Task generation failed:", error);
    res.status(500).json({
      error: "Task generation failed",
      details: error.message,
    });
  }
});

export default router;

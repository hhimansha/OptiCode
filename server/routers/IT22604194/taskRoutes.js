import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * POST /api/tasks/generate
 * Body: { student_skill }
 */
router.post("/generate", async (req, res) => {
  try {
    const { student_skill } = req.body;

    if (!student_skill) {
      return res.status(400).json({ error: "student_skill is required" });
    }

    // ---------- PROMPT ----------
    let prompt = "";

    if (student_skill <= 2) {
      prompt = `
Generate ONE simple Python coding task for a BEGINNER student.

Rules:
- Describe the task in plain English
- Do NOT include code
- Do NOT include function definitions
- Use print, variables, loops, or simple if conditions

Output format:
Task: <one clear sentence>.
`;
    } else if (student_skill <= 4) {
      prompt = `
Generate ONE Python coding task for an INTERMEDIATE student.

Rules:
- Describe the task in plain English
- Do NOT include code
- Do NOT include function definitions
- The task must require writing a function
- The task must involve a loop or conditional logic

Output format:
Task: <one clear sentence>.
`;
    } else {
      prompt = `
Generate ONE challenging Python coding task for an ADVANCED student.

Rules:
- Describe the task in plain English
- Do NOT include code
- Do NOT include function definitions
- The task must involve algorithms, recursion, or data structures

Output format:
Task: <one clear sentence>.
`;
    }

    const HF_API_URL =
      "https://ashani-shashikala-qwen-lora-task-generator-own.hf.space/generate";

    // ---------- MULTI-SAMPLE GENERATION ----------
    const NUM_TRIES = 3;
    let finalTask = null;

    const forbidden = [
      "generate one",
      "adaptive coding tutor",
      "student profile",
      "rules:",
      "output format",
      "beginner student",
      "intermediate student",
      "advanced student",
      "describe the task"
    ];

    for (let i = 0; i < NUM_TRIES; i++) {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const raw = (data.response || "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Extract first meaningful sentence
      const match =
        raw.match(/Task:\s*([A-Z][^.]{20,}\.)/) ||
        raw.match(/([A-Z][^.]{20,}\.)/);

      if (!match) continue;

      const candidate = match[0].startsWith("Task:")
        ? match[0]
        : "Task: " + match[0];

      if (!forbidden.some(f => candidate.toLowerCase().includes(f))) {
        finalTask = candidate;
        break; // ✅ stop at first valid task
      }
    }

    // ---------- LAST-RESORT FALLBACK (VERY RARE) ----------
    if (!finalTask) {
      finalTask =
        "Task: Write a Python program suitable for your current skill level that solves a real-world problem.";
    }

    //res.json({ generated_task: finalTask });
    res.json({
  generated_task: finalTask,
  expected_output: "15"
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

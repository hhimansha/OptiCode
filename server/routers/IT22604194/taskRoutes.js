import express from "express";
import fetch from "node-fetch";
import { structuredTasks } from "../../data/structuredTasks.js";

const router = express.Router();

/**
 * POST /api/tasks/generate
 * Body: { student_skill, weakness }
 */
router.post("/generate", async (req, res) => {
  try {
    const { student_skill, weakness } = req.body;

    if (!student_skill) {
      return res.status(400).json({ error: "student_skill is required" });
    }

    const skillLabel =
      student_skill <= 2 ? "Beginner" :
      student_skill <= 4 ? "Intermediate" :
      "Advanced";

    // ================= QWEN PROMPT =================

    const prompt = `
Generate ONE Python coding task.

Return STRICT JSON ONLY:

{
  "task": "...",
  "test_input": "...",
  "expected_output": "..."
}

Skill: ${skillLabel}

Rules:
- Task must require printing output
- test_input must match task
- expected_output must be correct for test_input
- No explanation
- No markdown
- Only valid JSON
`;

    const HF_API_URL =
      "https://ashani-shashikala-qwen-lora-task-generator-own.hf.space/generate";

    let parsed = null;

    for (let i = 0; i < 3; i++) {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const raw = (data.response || "").trim();

      try {
        parsed = JSON.parse(raw);
        if (parsed.task && parsed.expected_output !== undefined) break;
      } catch {
        parsed = null;
      }
    }

    // ================= STRUCTURED WEAKNESS TASK (OPTIONAL BOOST) =================

    if (weakness) {
      const pool = structuredTasks?.[skillLabel]?.[weakness];
      if (pool && pool.length > 0) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        return res.json({
          generated_task: chosen.task,
          expected_output: chosen.expected_output,
          test_input: chosen.test_input,
          weakness_target: weakness
        });
      }
    }

    // ================= QWEN RESULT =================

    if (parsed) {
      return res.json({
        generated_task: "Task: " + parsed.task,
        expected_output: String(parsed.expected_output),
        test_input: String(parsed.test_input || ""),
        weakness_target: weakness || "logic_error"
      });
    }

    // ================= LAST RESORT =================

    return res.json({
      generated_task: "Task: Print the sum of 5 and 10.",
      test_input: "",
      expected_output: "15",
      weakness_target: "logic_error"
    });

  } catch (error) {
    console.error("Task generation failed:", error);
    res.status(500).json({
      error: "Task generation failed",
      details: error.message
    });
  }
});

export default router;

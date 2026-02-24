import express from "express";
import { structuredTasks } from "../../data/structuredTasks.js";
import { generateTaskWithGemini } from "../../services/IT22604194/geminiService.js";

const router = express.Router();

// Local fallback pool per skill level (used when Gemini quota exceeded)
const fallbackTasks = {
  Beginner: [
    { task: "Print the sum of 5 and 10.", test_input: "", expected_output: "15" },
    { task: "Create a variable x = 7 and print it.", test_input: "", expected_output: "7" },
    { task: "Print numbers from 1 to 3 using a for loop.", test_input: "", expected_output: "1\n2\n3" },
    { task: "Print the result of 4 multiplied by 5.", test_input: "", expected_output: "20" },
    { task: "Calculate 10 - 4 and print the result.", test_input: "", expected_output: "6" },
  ],
  Intermediate: [
    { task: "Print the sum of all numbers from 1 to 10.", test_input: "", expected_output: "55" },
    { task: "Print all even numbers from 2 to 10 using a loop.", test_input: "", expected_output: "2\n4\n6\n8\n10" },
    { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", test_input: "", expected_output: "True" },
    { task: "Print the factorial of 4 by computing it.", test_input: "", expected_output: "24" },
    { task: "Write a function max_of_two(a,b) that returns the larger number. Print max_of_two(3,7).", test_input: "", expected_output: "7" },
  ],
  Advanced: [
    { task: "Print all prime numbers between 1 and 20.", test_input: "", expected_output: "2\n3\n5\n7\n11\n13\n17\n19" },
    { task: "Write a recursive function to compute factorial of 5. Print the result.", test_input: "", expected_output: "120" },
    { task: "Print the first 8 Fibonacci numbers.", test_input: "", expected_output: "0\n1\n1\n2\n3\n5\n8\n13" },
    { task: "Write a function is_palindrome(s). Print is_palindrome('racecar').", test_input: "", expected_output: "True" },
    { task: "Compute and print the sum of digits of 12345.", test_input: "", expected_output: "15" },
  ]
};

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

    // ===== STEP 1: Weakness-targeted structured task =====
    if (weakness) {
      const pool = structuredTasks?.[skillLabel]?.[weakness];
      if (pool && pool.length > 0) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        console.log(`Serving structured task for ${skillLabel} / ${weakness}`);
        return res.json({
          generated_task: chosen.task,
          expected_output: chosen.expected_output,
          test_input: chosen.test_input,
          weakness_target: weakness
        });
      }
    }

    // ===== STEP 2: Gemini dynamic task generation =====
    console.log(`Generating task with Gemini for ${skillLabel} / weakness: ${weakness}`);
    const geminiTask = await generateTaskWithGemini(skillLabel, weakness);

    if (geminiTask) {
      return res.json({
        generated_task: geminiTask.task,
        expected_output: geminiTask.expected_output,
        test_input: geminiTask.test_input,
        weakness_target: weakness || "logic_error"
      });
    }

    // ===== STEP 3: Local fallback (Gemini quota exceeded) =====
    console.log(`Gemini unavailable, using local fallback for ${skillLabel}`);
    const pool = fallbackTasks[skillLabel] || fallbackTasks.Beginner;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return res.json({
      generated_task: chosen.task,
      expected_output: chosen.expected_output,
      test_input: chosen.test_input,
      weakness_target: weakness || "logic_error"
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
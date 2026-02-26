import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── LOAD TRAINING DATA ONCE AT STARTUP ──────────────────────────────────
let trainingData = [];
try {
  const dataPath = path.join(__dirname, "../../data/cleaned_merged.jsonl");
  const lines = fs.readFileSync(dataPath, "utf-8").trim().split("\n");
  trainingData = lines.map(line => JSON.parse(line));
  console.log(`✅ Loaded ${trainingData.length} training examples for task generation`);
} catch (err) {
  console.warn("⚠️ Training data not found, using prompt only");
}

// ─── GET FEW-SHOT EXAMPLES FROM YOUR TRAINING DATA ───────────────────────
function getFewShotExamples(skillLevel, weakness) {
  const skillMap = { Beginner: [1, 2], Intermediate: [3, 4], Advanced: [5] };
  const skillNumbers = skillMap[skillLevel] || [1, 2];

  // Filter by skill level
  let filtered = trainingData.filter(t => skillNumbers.includes(t.skill));

  // If weakness provided, try to match concept
  const weaknessConceptMap = {
    logic_error: ["logic", "conditionals", "boolean"],
    infinite_loop: ["loops", "loop"],
    missing_base_case: ["recursion"],
    syntax_error: ["print", "variables"],
    hardcoded_value: ["variables", "math"],
    missing_print: ["print", "output"],
    no_function: ["functions", "methods"],
    idle_stuck: ["print", "variables", "math"]
  };

  if (weakness && weaknessConceptMap[weakness]) {
    const concepts = weaknessConceptMap[weakness];
    const matched = filtered.filter(t => concepts.includes(t.concept));
    if (matched.length >= 2) filtered = matched;
  }

  // Pick 3 random examples
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ─── TASK GENERATION (customized with your training data) ─────────────────
export async function generateTaskWithGemini(skillLabel, weakness) {
  try {
    const examples = getFewShotExamples(skillLabel, weakness);

    const exampleText = examples.map((ex, i) => `
Example ${i + 1}:
Task: ${ex.task}
Expected Output: ${Array.isArray(ex.expected_output) ? ex.expected_output.join("\\n") : ex.expected_output}
`).join("\n");

    const weaknessContext = weakness
      ? `The task should specifically help the student practice and overcome their detected weakness: "${weakness.replace(/_/g, " ")}".`
      : "";

    const prompt = `
You are a task generator for an AI adaptive coding education platform for university students learning Python.

Generate ONE Python coding task for a ${skillLabel} level student.
${weaknessContext}

Here are example tasks from our training dataset at this skill level to guide your style:
${exampleText}

Follow the SAME style and difficulty as the examples above.

Rules:
- Task must be solvable by printing output to console
- expected_output must be exactly correct
- test_input should be empty string if no input needed
- No explanation, no markdown, no extra text
- Match the difficulty and concept style of the examples

Return ONLY this exact JSON format:
{
  "task": "task description here",
  "test_input": "",
  "expected_output": "exact output here"
}
`;

    const raw = await callGemini(prompt);
    if (!raw) return null;

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (parsed.task && parsed.expected_output !== undefined) {
      return {
        task: "Task: " + parsed.task,
        expected_output: String(parsed.expected_output),
        test_input: String(parsed.test_input || "")
      };
    }
    return null;

  } catch (err) {
    console.error("Gemini task generation failed:", err);
    return null;
  }
}

// ─── HINT GENERATION ──────────────────────────────────────────────────────
export async function askGemini({ weakness, skill, code, task }) {
  try {
    const prompt = `
You are an AI coding tutor in an adaptive learning platform for university students learning Python.

Student skill level: ${skill}
Coding task given: ${task}
Detected weakness: ${weakness}
Student's current code:
${code}

Give a SHORT, targeted hint (max 2 sentences) appropriate for a ${skill} level student.
Do NOT give the full solution. Guide them toward fixing the ${weakness} issue.
`;
    const result = await callGemini(prompt);
    return result || getFallbackHint(weakness, skill);

  } catch (err) {
    console.error("Gemini hint failed:", err);
    return getFallbackHint(weakness, skill);
  }
}

// ─── SHARED GEMINI API CALLER ─────────────────────────────────────────────
async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  console.log("Gemini raw:", JSON.stringify(data).substring(0, 200));

  if (data.error?.status === "RESOURCE_EXHAUSTED") {
    console.warn("Gemini quota exceeded, using fallback");
    return null;
  }

  if (!data.candidates?.length) return null;
  return data.candidates[0]?.content?.parts?.[0]?.text || null;
}

// ─── LOCAL FALLBACK HINTS ─────────────────────────────────────────────────
function getFallbackHint(weakness, skill) {
  const hints = {
    syntax_error: {
      Beginner: "Check your code carefully for missing colons, brackets, or typos.",
      Intermediate: "Review your syntax — look for unclosed brackets or incorrect indentation.",
      Advanced: "A syntax error is preventing execution. Check the parser error location."
    },
    missing_base_case: {
      Beginner: "Your recursive function needs a stopping condition to avoid infinite recursion.",
      Intermediate: "Ensure your recursive function has a base case that stops the recursion.",
      Advanced: "Validate your base case — the recursion must terminate."
    },
    infinite_loop: {
      Beginner: "Make sure your loop has a way to stop, like a counter or break statement.",
      Intermediate: "Check your loop condition — it may never become false.",
      Advanced: "Review your loop invariant to ensure termination is guaranteed."
    },
    logic_error: {
      Beginner: "Your output doesn't match what's expected. Check your calculation.",
      Intermediate: "Double-check your logic — the algorithm may have an edge case issue.",
      Advanced: "Verify your logic covers all edge cases and produces the correct result."
    },
    hardcoded_value: {
      Beginner: "Don't write the answer directly — compute it using the operators.",
      Intermediate: "Avoid hardcoding the result. Use variables and expressions instead.",
      Advanced: "The output appears hardcoded. Compute it dynamically."
    },
    missing_print: {
      Beginner: "Use print() to show your result on the screen.",
      Intermediate: "Make sure you print the final output.",
      Advanced: "Ensure the result is returned or printed."
    },
    no_function: {
      Beginner: "Try defining a function using the 'def' keyword.",
      Intermediate: "Encapsulate your logic inside a function.",
      Advanced: "Define the required function to structure your solution."
    },
    idle_stuck: {
      Beginner: "Start by writing print() and put your answer inside it.",
      Intermediate: "Break the problem into smaller steps and tackle one at a time.",
      Advanced: "Re-evaluate your approach and consider a different algorithm."
    }
  };
  return hints[weakness]?.[skill] || "Review your code carefully and try a different approach.";
}
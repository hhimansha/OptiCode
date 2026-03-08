import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── LOAD TRAINING DATA ONCE AT STARTUP ──────────────────────────────────
let trainingData = [];
try {
  const dataPath = path.join(__dirname, "../../data/new_dataset.jsonl");
  const lines = fs.readFileSync(dataPath, "utf-8").trim().split("\n");
  trainingData = lines.map(line => JSON.parse(line));
  console.log(`✅ Loaded ${trainingData.length} training examples`);
} catch (err) {
  console.warn("⚠️ Training data not found, using prompt only");
}

// ✅ Export so taskRoutes can use dataset as fallback
export { trainingData };

// ─── RESPONSE CACHE ───────────────────────────────────────────────────────
const taskCache = new Map();

// ─── KEY ROTATION ─────────────────────────────────────────────────────────
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

let keyIndex = 0;

// ═══════════════════════════════════════════════════════════════════════════
//  SKILL-LEVEL SYSTEM INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════
const SKILL_SYSTEM_INSTRUCTIONS = {
  Beginner: `You are OptiCode Beginner Task Generator — a specialized AI for generating
Python coding tasks for absolute beginners at university level.

YOUR STRICT RULES:
- ONLY use: print(), variables, basic arithmetic (+,-,*,/,**,%), simple for loops, basic if/else
- NEVER use: functions (def), imports, classes, recursion, complex data structures
- Task must be ONE sentence, crystal clear, no ambiguity
- ALWAYS include exact values in the task description so student knows exactly what to use
  GOOD: "Print the sum of 5 and 10."
  GOOD: "Convert the list ['Hello','WORLD','Python'] to lowercase and print it."
  GOOD: "Check if 10 is greater than 5 and print Yes or No."
  BAD:  "Convert a list of strings to lower case."
  BAD:  "Check if a number is positive."
  BAD:  "Print the result of two numbers."
- expected_output must be exactly what Python would print for those exact values
- Student should be able to solve it in under 2 minutes
- Concepts allowed: print, variables, math, simple loops, basic conditionals`,

  Intermediate: `You are OptiCode Intermediate Task Generator — a specialized AI for generating
Python coding tasks for intermediate university students.

YOUR STRICT RULES:
- USE: functions (def/return), loops, conditionals, list comprehensions, built-ins (range, sum, len, sorted)
- MAY USE: simple imports (math, random)
- NEVER use: recursion, classes, decorators, generators
- Task should require writing a function or multi-step logic
- ALWAYS include exact values in the task description so student knows exactly what to use
  GOOD: "Write a function is_even(n). Print is_even(4)."
  GOOD: "Sort the list [5,2,8,1,9] and print it."
  GOOD: "Write a function max_of_two(a,b). Print max_of_two(3,7)."
  BAD:  "Write a function to check a number."
  BAD:  "Sort a list of numbers."
  BAD:  "Write a function that processes a string."
- expected_output must be exactly reproducible every time
- Student should solve it in 1-3 minutes`,

  Advanced: `You are OptiCode Advanced Task Generator — a specialized AI for generating
Python coding tasks for advanced university students.

YOUR STRICT RULES:
- USE: recursion, OOP (classes, inheritance), decorators, generators, algorithms
- MUST test actual problem-solving ability, not just syntax recall
- Tasks should involve: data structures, algorithmic thinking, design patterns
- ALWAYS include exact values in the task description so student knows exactly what to use
  GOOD: "Write a recursive factorial(n). Print factorial(5)."
  GOOD: "Binary search for 7 in [1,3,5,7,9]. Print the index."
  GOOD: "Write a class Rectangle with width=4 height=5. Print its area."
  BAD:  "Write a recursive function."
  BAD:  "Implement binary search."
  BAD:  "Create a class with attributes."
- expected_output must be exactly reproducible every time
- Student should solve it in 2-5 minutes`,
};

// ─── WEAKNESS → CONCEPT MAPPING ───────────────────────────────────────────
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

// ─── GET FEW-SHOT EXAMPLES FROM TRAINING DATA ─────────────────────────────
function getFewShotExamples(skillLabel, weakness) {
  const skillMap = { Beginner: [1, 2], Intermediate: [3, 4], Advanced: [5] };
  const skillNumbers = skillMap[skillLabel] || [1, 2];

  let filtered = trainingData.filter(t =>
    skillNumbers.includes(t.skill) &&
    t.type !== "function" &&
    t.type !== "file" &&
    Array.isArray(t.expected_output) &&
    t.expected_output.length > 0
  );

  if (weakness && weaknessConceptMap[weakness]) {
    const concepts = weaknessConceptMap[weakness];
    const matched = filtered.filter(t => concepts.includes(t.concept));
    if (matched.length >= 2) filtered = matched;
  }

  if (filtered.length === 0) {
    filtered = trainingData.filter(t =>
      skillNumbers.includes(t.skill) &&
      t.type !== "file" &&
      Array.isArray(t.expected_output) &&
      t.expected_output.length > 0
    );
  }

  return filtered.sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─── FORMAT EXAMPLES FOR PROMPT ───────────────────────────────────────────
function formatExamples(examples) {
  if (!examples.length) return "No examples available.";
  return examples.map((ex, i) => `
Example ${i + 1}:
Task: ${ex.task}
Expected Output: ${
    Array.isArray(ex.expected_output)
      ? ex.expected_output.join("\n")
      : ex.expected_output
  }
`).join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════
//  TASK GENERATION — customized per skill level with few-shot examples
// ═══════════════════════════════════════════════════════════════════════════
export async function generateTaskWithGemini(skillLabel, weakness) {
  const cacheKey = `${skillLabel}_${weakness}_${Math.floor(Date.now() / 60000)}`;
  if (taskCache.has(cacheKey)) {
    console.log(`⚡ Cache hit [${skillLabel}/${weakness}]`);
    return taskCache.get(cacheKey);
  }

  try {
    const examples = getFewShotExamples(skillLabel, weakness);
    const exampleText = formatExamples(examples);
    const systemInstruction =
      SKILL_SYSTEM_INSTRUCTIONS[skillLabel] || SKILL_SYSTEM_INSTRUCTIONS.Beginner;

    const weaknessContext = weakness
      ? `IMPORTANT: The student struggles with "${weakness.replace(/_/g, " ")}".
Generate a task that specifically helps them practice and overcome this weakness.`
      : `Generate a varied task appropriate for ${skillLabel} level.`;

    const prompt = `
${systemInstruction}

${weaknessContext}

Here are example tasks from our training dataset to guide your style and difficulty:
${exampleText}

Follow the SAME style and difficulty as the examples above.
Remember: ALWAYS include exact values (numbers, lists, strings) in the task description.

IMPORTANT RULES:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- expected_output must be exactly what Python would print
- test_input should be empty string "" if no user input needed

CRITICAL EXTRA RULE FOR FUNCTION TASKS:
If the task requires writing a function, you MUST:
1. Include the exact test value in the task text e.g. "Print print_factors(12)" not "a number"
2. The function_call in JSON must match: e.g. "print_factors(12)"
3. expected_output must be exactly what that specific call prints

BAD:  "Write a function that prints all factors of a number."
GOOD: "Write a function print_factors(n). Print print_factors(12)."

Return ONLY this exact JSON:
{
  "task": "task description with exact values here",
  "test_input": "",
  "expected_output": "exact output here",
  "function_call": "function_name(exact_args) or null if no function needed"
}`;
    const raw = await callGemini(prompt);
    if (!raw) return null;

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!parsed.task || parsed.expected_output === undefined) {
      throw new Error("Invalid Gemini response structure");
    }

    console.log(`✅ Gemini [${skillLabel}] generated: "${parsed.task.substring(0, 60)}..."`);

    const result = {
      task: "Task: " + parsed.task,
      expected_output: String(parsed.expected_output),
      test_input: String(parsed.test_input || ""),
      function_call: parsed.function_call || null
    };

    taskCache.set(cacheKey, result);
    if (taskCache.size > 50) {
      const firstKey = taskCache.keys().next().value;
      taskCache.delete(firstKey);
    }

    return result;
  } catch (err) {
    console.error(`❌ Gemini task generation failed [${skillLabel}]:`, err.message);
    return null;
  }
}

// ─── CONCEPT LABEL HELPER ────────────────────────────────────────────────
function resolveConcept(concept, weakness, task) {
  if (concept) return concept;
  if (weakness === "missing_base_case") return "recursion";
  if (weakness === "infinite_loop") return "loops";
  if (weakness === "no_function") return "functions";
  if (weakness === "missing_print") return "print";
  if (weakness === "hardcoded_value") return "math";
  if (weakness === "syntax_error") return "syntax";

  const taskText = (task || "").toLowerCase();
  if (taskText.includes("recursion") || taskText.includes("recursive")) return "recursion";
  if (taskText.includes("loop") || taskText.includes("for ") || taskText.includes("while ")) return "loops";
  if (taskText.includes("function") || taskText.includes("def ")) return "functions";
  if (taskText.includes("print") || taskText.includes("output")) return "print";
  if (taskText.includes("list")) return "lists";
  if (taskText.includes("string")) return "strings";
  if (taskText.includes("class")) return "oop";
  return "general";
}

function getHintInstruction(skill, learningMode) {
  const modeLine =
    learningMode === "improve_concept"
      ? "The student is specifically trying to improve a weak concept area."
      : "The student is mainly trying to level up overall.";

  return {
    Beginner: `${modeLine}
Give a very simple hint in plain language.
Explain the next step clearly.
Be encouraging.
Max 2 sentences.
Do NOT give the full solution.`,
    Intermediate: `${modeLine}
Give a targeted hint about the specific issue.
Mention the concept involved.
Keep it short and clear.
Max 2 sentences.
Do NOT give the full solution.`,
    Advanced: `${modeLine}
Give a concise technical hint.
Reference the relevant concept or pattern.
Keep it brief.
Max 2 sentences.
Do NOT give the full solution.`
  }[skill] || `${modeLine}
Give a short helpful hint.
Max 2 sentences.
Do NOT give the full solution.`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HINT GENERATION — skill-aware + concept-aware tutor hints
// ═══════════════════════════════════════════════════════════════════════════
export async function askGemini({
  weakness,
  skill,
  code,
  task,
  concept = null,
  learningMode = "level_up"
}) {
  try {
    const resolvedConcept = resolveConcept(concept, weakness, task);
    const hintInstruction = getHintInstruction(skill, learningMode);

    const prompt = `You are an AI coding tutor for university students learning Python.

${hintInstruction}

Student skill level: ${skill}
Learning mode: ${learningMode}
Task concept: ${resolvedConcept}
Task: ${task}
Detected weakness: ${weakness}
Student's current code:
${code}

Give a hint to help the student improve the "${resolvedConcept}" concept while fixing the "${weakness.replace(/_/g, " ")}" issue.
Do not write the full answer.
Do not give complete corrected code.
Keep the hint aligned to the student's skill level.`;

    const result = await callGemini(prompt);
    return result || getFallbackHint(weakness, skill, resolvedConcept, learningMode);
  } catch (err) {
    console.error("Gemini hint failed:", err.message);
    return getFallbackHint(weakness, skill, concept, learningMode);
  }
}

// ─── SHARED GEMINI API CALLER WITH KEY ROTATION ───────────────────────────
async function callGemini(prompt) {
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];
    keyIndex++;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 300
            }
          })
        }
      );

      const data = await res.json();

      if (data.error?.status === "RESOURCE_EXHAUSTED") {
        console.warn(`⚠️ Gemini key ${attempt + 1} quota exceeded — trying next key`);
        continue;
      }

      if (!data.candidates?.length) {
        console.warn("⚠️ No Gemini candidates returned");
        return null;
      }

      return data.candidates[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.warn(`⚠️ Gemini key ${attempt + 1} error:`, err.message);
      continue;
    }
  }

  console.warn("⚠️ All Gemini keys exhausted — falling back to local hint");
  return null;
}

// ─── LOCAL FALLBACK HINTS ─────────────────────────────────────────────────
function getFallbackHint(weakness, skill, concept = "general", learningMode = "level_up") {
  const modePrefix =
    learningMode === "improve_concept"
      ? skill === "Beginner"
        ? "You are practicing a weak concept. "
        : skill === "Intermediate"
        ? "Focus on improving this concept. "
        : "Target the weak concept directly. "
      : "";

  const hints = {
    syntax_error: {
      Beginner: "Check for missing colons, brackets, or typing mistakes.",
      Intermediate: "Review the syntax — look for unclosed brackets or incorrect indentation.",
      Advanced: "Parser issue detected. Check syntax and indentation precisely."
    },
    missing_base_case: {
      Beginner: "Your recursive function needs a stopping condition.",
      Intermediate: "Ensure your recursive function has a valid base case.",
      Advanced: "Validate the recursion termination condition."
    },
    infinite_loop: {
      Beginner: "Make sure your loop has a way to stop.",
      Intermediate: "Check your loop condition and update step.",
      Advanced: "Review the loop invariant and termination logic."
    },
    logic_error: {
      Beginner: `Your output is not correct. Check the ${concept} logic step by step.`,
      Intermediate: `Double-check your ${concept} logic and compare the output with the expected result.`,
      Advanced: `Verify ${concept} logic, intermediate states, and edge cases.`
    },
    hardcoded_value: {
      Beginner: "Do not write the final answer directly — compute it using Python.",
      Intermediate: "Avoid hardcoding the result. Compute it dynamically.",
      Advanced: "Output appears hardcoded. Derive it programmatically."
    },
    missing_print: {
      Beginner: "Use print() to show your final result.",
      Intermediate: "Make sure you print the final output.",
      Advanced: "Emit the computed result."
    },
    no_function: {
      Beginner: "Try defining a function using the def keyword.",
      Intermediate: "Encapsulate your logic inside the required function.",
      Advanced: "Define the required function abstraction."
    },
    idle_stuck: {
      Beginner: "Start with one small step first, like writing print() or the function header.",
      Intermediate: "Break the problem into smaller parts and solve the core step first.",
      Advanced: "Re-evaluate the approach and implement the key step first."
    }
  };

  return modePrefix + (hints[weakness]?.[skill] || "Review your code carefully and try a different approach.");
}
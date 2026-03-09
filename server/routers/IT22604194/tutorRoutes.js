import express from "express";
import { askGemini } from "../../services/IT22604194/geminiService.js";

const router = express.Router();

// ─── WEAKNESS → CONCEPT LABEL ────────────────────────────────────────────
const weaknessConceptMap = {
  syntax_error: "syntax",
  missing_base_case: "recursion",
  infinite_loop: "loops",
  logic_error: "logic",
  hardcoded_value: "math",
  missing_print: "print",
  no_function: "functions",
  idle_stuck: "general"
};

// ─── LOCAL SKILL-AWARE HINT TEMPLATES ────────────────────────────────────
const LOCAL_HINTS = {
  syntax_error: {
    Beginner: ({ concept }) =>
      `There is a syntax problem in your code. Check spelling, brackets, colons, and indentation${concept && concept !== "general" ? ` in this ${concept} task` : ""}.`,
    Intermediate: ({ concept }) =>
      `Review the syntax carefully${concept && concept !== "general" ? ` for this ${concept} task` : ""} — look for missing colons, brackets, or indentation issues.`,
    Advanced: ({ concept }) =>
      `Parser issue detected${concept && concept !== "general" ? ` in ${concept}` : ""}. Inspect syntax and indentation near the failing statement.`
  },

  missing_base_case: {
    Beginner: () =>
      "Your recursive solution needs a stopping condition. Add a base case so the function knows when to stop calling itself.",
    Intermediate: () =>
      "This recursion needs a valid base case. Make sure one condition returns directly without another recursive call.",
    Advanced: () =>
      "Add a terminating base case to guarantee recursion stops."
  },

  infinite_loop: {
    Beginner: ({ concept }) =>
      `Your loop may never stop. Check whether the loop condition changes each time${concept === "loops" ? " and whether your counter is updated" : ""}.`,
    Intermediate: () =>
      "Review the loop condition and update step. The controlling variable may not be moving toward termination.",
    Advanced: () =>
      "Ensure loop termination by fixing the invariant or update step."
  },

  logic_error: {
    Beginner: ({ concept }) =>
      `Your code runs, but the result is not correct. Break the problem into smaller steps and check the ${concept && concept !== "general" ? concept : "logic"} carefully.`,
    Intermediate: ({ concept }) =>
      `The output suggests a logic issue${concept && concept !== "general" ? ` in ${concept}` : ""}. Trace the values step by step and compare with the expected result.`,
    Advanced: ({ concept }) =>
      `Logic mismatch detected${concept && concept !== "general" ? ` in ${concept}` : ""}. Validate edge cases and intermediate values.`
  },

  hardcoded_value: {
    Beginner: () =>
      "Do not write the final answer directly. Use Python operations or logic to calculate it from the task requirements.",
    Intermediate: () =>
      "Avoid hardcoding the expected result. Compute it dynamically from the given values.",
    Advanced: () =>
      "Output appears hardcoded. Derive it programmatically."
  },

  missing_print: {
    Beginner: () =>
      "You may have found the answer, but Python will not show it unless you use print(). Print the final result so it appears in the output.",
    Intermediate: () =>
      "Print the final result.",
    Advanced: () =>
      "Emit the computed output."
  },

  no_function: {
    Beginner: () =>
      "This task needs a function. Start with def, give the function a name, add parameters if needed, and then put your logic inside it.",
    Intermediate: () =>
      "Define the required function using def and place the logic inside it.",
    Advanced: () =>
      "Encapsulate the logic in the required function."
  },

  idle_stuck: {
    Beginner: ({ concept, task }) =>
      `Start with one small step. ${concept === "print"
        ? "Try writing print() first."
        : concept === "functions"
        ? "Try writing the function header first."
        : concept === "loops"
        ? "Try writing the loop structure first."
        : "Write the first line that solves part of the task."
      }${task ? " Then build from there." : ""}`,
    Intermediate: ({ concept }) =>
      `Break the problem into smaller parts${concept && concept !== "general" ? ` for this ${concept} task` : ""}. Start with the core step first.`,
    Advanced: ({ concept }) =>
      `Reframe the approach${concept && concept !== "general" ? ` for ${concept}` : ""} and implement the core step first.`
  }
};

// ─── OPTIONAL MODE-AWARE PREFIX ──────────────────────────────────────────
function modePrefix(learningMode, skill) {
  if (learningMode !== "improve_concept") return "";

  if (skill === "Beginner") return "You are practicing a weak concept area. ";
  if (skill === "Intermediate") return "Focus on improving this weak concept. ";
  return "Target the weak concept directly. ";
}

// ─── LOCAL HINT GENERATOR ────────────────────────────────────────────────
function getLocalHint({ weakness, skill, code, task, concept, learningMode }) {
  const safeSkill =
    skill === "Beginner" || skill === "Intermediate" || skill === "Advanced"
      ? skill
      : "Beginner";

  const resolvedConcept =
    concept ||
    weaknessConceptMap[weakness] ||
    inferConceptFromTask(task) ||
    "general";

  const builder =
    LOCAL_HINTS[weakness]?.[safeSkill] ||
    (() =>
      safeSkill === "Beginner"
        ? "Look at the task carefully and fix one small part at a time."
        : safeSkill === "Intermediate"
        ? "Review the current approach and correct the key issue."
        : "Refine the current approach and fix the main defect.");

  const prefix = modePrefix(learningMode, safeSkill);

  return prefix + builder({ code, task, concept: resolvedConcept, learningMode });
}

// ─── SIMPLE CONCEPT INFERENCE ────────────────────────────────────────────
function inferConceptFromTask(task = "") {
  const text = task.toLowerCase();

  if (text.includes("recursion") || text.includes("recursive")) return "recursion";
  if (text.includes("class") || text.includes("object") || text.includes("inherit")) return "oop";
  if (text.includes("dictionary")) return "dictionaries";
  if (text.includes("tuple")) return "tuples";
  if (text.includes("list")) return "lists";
  if (text.includes("string")) return "strings";
  if (text.includes("loop") || text.includes("for ") || text.includes("while ")) return "loops";
  if (text.includes("function") || text.includes("def ")) return "functions";
  if (text.includes("print") || text.includes("output") || text.includes("display")) return "print";
  if (text.includes("if ") || text.includes("else") || text.includes("condition")) return "conditionals";
  if (
    text.includes("sum") ||
    text.includes("multiply") ||
    text.includes("divide") ||
    text.includes("subtract") ||
    text.includes("factorial") ||
    text.includes("power")
  ) {
    return "math";
  }
  if (
    text.includes("search") ||
    text.includes("sort") ||
    text.includes("prime") ||
    text.includes("fibonacci") ||
    text.includes("algorithm")
  ) {
    return "algorithm";
  }

  return "general";
}

router.post("/hint", async (req, res) => {
  try {
    const {
      weakness,
      skill,
      code,
      task,
      concept = null,
      learningMode = "level_up",
      use_ai = false
    } = req.body;

    // 1. Local hint first (default path)
    const localHint = getLocalHint({
      weakness,
      skill,
      code,
      task,
      concept,
      learningMode
    });

    // By default, return local hint immediately
    if (!use_ai) {
      return res.json({
        hint: localHint,
        source: "local_rules"
      });
    }

    // 2. Gemini fallback / richer hint only when explicitly requested
    const reply = await askGemini({
      weakness,
      skill,
      code,
      task,
      concept,
      learningMode
    });

    return res.json({
      hint: reply || localHint,
      source: reply ? "gemini" : "local_rules"
    });

  } catch (err) {
    console.error("Tutor hint error:", err);

    return res.status(500).json({
      hint: "Review the task carefully and fix one issue at a time.",
      source: "error_fallback"
    });
  }
});

export default router;
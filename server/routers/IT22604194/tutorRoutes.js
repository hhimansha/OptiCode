import express from "express";
import { askGemini } from "../../services/IT22604194/geminiService.js";
import { WeaknessHintEngine } from "../../services/IT22604194/WeaknessHintEngine.js";
import { structuredTasks } from '../../data/structuredTasks.js';

const router = express.Router();
function findSolutionStages(task) {
  for (const level of Object.values(structuredTasks)) {
    for (const category of Object.values(level)) {
      for (const t of category) {
        if (t.task === task) {
          return t.solution_stages || null;
        }
      }
    }
  }
  return null;
}

// ─── SOLUTION STAGE HINT (NEW) ─────────────────────────────────────────
function getSolutionStageHint(code, solution_stages, skill = "Beginner", weakness = null) {
  if (!solution_stages || solution_stages.length === 0) return null;

  const safeSkill = ["Beginner", "Intermediate", "Advanced"].includes(skill)
    ? skill : "Beginner";

  // Weakness context labels — tells student what error type they have
  const weaknessContext = {
    logic_error:       "Your code runs but gives wrong output (logic error).",
    syntax_error:      "There is a syntax problem in your code.",
    missing_print:     "Your answer is not being displayed (missing print).",
    no_function:       "This task needs a function definition.",
    missing_base_case: "Your recursion has no stopping condition (missing base case).",
    infinite_loop:     "Your loop may never stop (infinite loop risk).",
    hardcoded_value:   "You typed the answer directly instead of computing it (hardcoded value).",
    idle_stuck:        "Take it one step at a time."
  };

  for (const stage of solution_stages) {
    if (!stage.pattern.test(code)) {
      const stageHint = stage.hint[safeSkill] || stage.hint["Beginner"];

      // Combine weakness context + stage hint
      const context = weakness && weaknessContext[weakness]
        ? `${weaknessContext[weakness]} `
        : "";

      return `${context}${stageHint}`;
    }
  }
  return null;
}

// ─── WEAKNESS → CONCEPT MAP ────────────────────────────────────────────
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

// ─── SIMPLE CONCEPT INFERENCE ─────────────────────────────────────────
function inferConceptFromTask(task = "") {
  const text = task.toLowerCase();

  if (text.includes("recursion") || text.includes("recursive")) return "recursion";
  if (text.includes("class") || text.includes("object")) return "oop";
  if (text.includes("list") || text.includes("array")) return "lists";
  if (text.includes("string") || text.includes("text")) return "strings";
  if (text.includes("dict") || text.includes("dictionary")) return "dictionaries";
  if (text.includes("set")) return "sets";
  if (text.includes("for") || text.includes("while") || text.includes("loop")) return "loops";
  if (text.includes("function") || text.includes("def")) return "functions";
  if (text.includes("print")) return "print";
  if (text.includes("if") || text.includes("condition")) return "conditionals";
  if (text.includes("variable") || text.includes("assign")) return "variables";
  if (text.includes("algorithm")) return "algorithm";
  if (text.includes("sum") || text.includes("factorial") || text.includes("multiply") || text.includes("calculate")) return "math";

  return "general";
}

// ─── CODE-AWARE STAGE DETECTION ───────────────────────────────────────
function getStageHint(code, task, weakness, concept) {

  const hasDef = /def\s+\w+\s*\(/.test(code);
  const hasReturn = /return\s+/.test(code);
  const hasPrint = /print\s*\(/.test(code);
  const hasLoop = /for\s+|while\s+/.test(code);
  const hasIf = /if\s+/.test(code);

  if (concept === "functions") {
    if (!hasDef) return "Start by writing a function using def.";
    if (!hasReturn) return "Add a return statement inside your function.";
    if (!hasPrint) return "Call your function and print the result.";
  }

  if (concept === "loops") {
    if (!hasLoop) return "Start by writing a loop (for or while).";
    if (!hasPrint) return "Print values inside the loop.";
  }

  if (concept === "recursion") {
    if (!hasDef) return "Start by writing the recursive function.";
    if (!hasIf) return "Add a base case using if.";
    if (!hasReturn) return "Return the recursive result.";
  }

  return null;
}

// ─── LOCAL FALLBACK HINT ──────────────────────────────────────────────
function getLocalHint({ weakness }) {
  const hints = {
    syntax_error: "Check syntax: brackets, indentation, colons.",
    logic_error: "Check your logic step by step.",
    infinite_loop: "Ensure your loop condition changes.",
    missing_print: "Use print() to display output.",
    no_function: "Define a function using def.",
    idle_stuck: "Start with a small step and build."
  };

  return hints[weakness] || "Review your code carefully.";
}

// ─── MAIN HINT ROUTE ──────────────────────────────────────────────────
router.post("/hint", async (req, res) => {
  try {
    const {
      weakness,
      skill,
      code,
      task,
      concept,
      learningMode,
      use_ai = false,
      solution_stages
    } = req.body;

    const resolvedConcept = concept || inferConceptFromTask(task);
    
    // ── DEBUG LOGGING ──────────────────────────────────────────────────
    console.log("\n📝 HINT REQUEST:");
    console.log(`  Weakness: ${weakness}`);
    console.log(`  Concept: ${resolvedConcept}`);
    console.log(`  Skill: ${skill}`);
    console.log(`  Task: ${task.substring(0, 60)}...`);
    console.log(`  Code preview: ${code.substring(0, 40)}...`);

    // ── STEP 1: SOLUTION STAGES (MOST ACCURATE) ─────────────────────
const stages = findSolutionStages(task);
const solutionHint = getSolutionStageHint(code, stages, skill, weakness);
    if (solutionHint) {
      console.log("✅ Hint from: solution_stages");
      return res.json({ hint: solutionHint, source: "solution_stages" });
    }

    // ── STEP 2: CODE PATTERN STAGE DETECTION ───────────────────────
    const stageHint = getStageHint(code, task, weakness, resolvedConcept);
    if (stageHint) {
      console.log("✅ Hint from: stage_guidance");
      return res.json({ hint: stageHint, source: "stage_guidance" });
    }

    // ── STEP 3: WEAKNESS ENGINE ────────────────────────────────────
    const weakHint = WeaknessHintEngine.generateHint(
      weakness,
      resolvedConcept,
      skill,
      code,
      task
    );

    if (weakHint) {
      console.log("✅ Hint from: weakness_engine");
      console.log(`   Hint: ${weakHint.substring(0, 60)}...`);
      return res.json({ hint: weakHint, source: "weakness_engine" });
    }

    // ── STEP 4: LOCAL FALLBACK ─────────────────────────────────────
    const localHint = getLocalHint({ weakness });

    if (!use_ai) {
      console.log("✅ Hint from: local");
      return res.json({ hint: localHint, source: "local" });
    }

    // ── STEP 5: GEMINI AI ──────────────────────────────────────────
    const aiHint = await askGemini({
      weakness,
      skill,
      code,
      task,
      concept,
      learningMode
    });

    console.log("✅ Hint from:", aiHint ? "gemini" : "local");
    return res.json({
      hint: aiHint || localHint,
      source: aiHint ? "gemini" : "local"
    });

  } catch (err) {
    console.error("❌ Hint error:", err);
    return res.status(500).json({
      hint: "Try solving step by step.",
      source: "error"
    });
  }
});

export default router;
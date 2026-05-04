import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { analyzeWeakness } from "./weaknessApi";

// ─── CODE PATTERN VALIDATION (sanity check on ML predictions) ──────────────
function validateWeaknessDetection(code, predictedWeakness, requiresFunction, taskText = "") {
  // If no prediction, return it as-is
  if (!predictedWeakness) return null;

  // Check for obvious contradictions
  const hasPrint = /print\s*\(/.test(code);
  const hasDef = /def\s+\w+\s*\(/.test(code);
  const hasReturn = /return\s+/.test(code);
  const hasLoop = /for\s+|while\s+/.test(code);
  const hasIf = /if\s+/.test(code);

  // If model says "missing_print" but code has print() → it's not missing_print
  
if (predictedWeakness === "missing_print" && hasPrint) {
  console.warn("⚠️ Model said missing_print but code has print() — checking logic_error");
  return "logic_error";
}

// If model says "hardcoded_value" but the task explicitly mentions a specific number → intentional

// SINGLE clean hardcoded_value check using the passed taskText parameter
if (predictedWeakness === "hardcoded_value" && /\b\d+\b/.test(taskText)) {
  console.warn("⚠️ hardcoded_value suppressed — task specifies literal number");
  return null;
}

  // If model says "no_function" but code has def → it's not no_function
  if (predictedWeakness === "no_function" && hasDef) {
    console.warn("⚠️ Model said no_function but code has def — checking logic_error");
    return "logic_error";
  }

  // If model says "infinite_loop" but code is a for loop with range() → it's logic_error
  if (predictedWeakness === "infinite_loop") {
  if (/for\s+.*range\s*\(/.test(code)) {
    return null; // definitely not infinite loop
  }
}

  // If model says "missing_base_case" but code is not recursive → wrong
  if (predictedWeakness === "missing_base_case" && !code.match(/\w+\s*\(\s*\w+\s*-\s*\d+/)) {
    console.warn("⚠️ Model said missing_base_case but code is not recursive — checking logic_error");
    return "logic_error";
  }

  // Otherwise trust the model's prediction
  return predictedWeakness;
}

const DEMO_USER_ID = "000000000000000000000001";

// ─── LEVEL-UP LOGIC (matches progressRoutes.js exactly) ──────────────────
// Beginner → Intermediate:
//   REQUIRED: bktMastery ≥ 0.85 AND solvedAtCurrentLevel ≥ 10
//   OPTIONAL (need 2 of 3): accuracy ≥ 75%, avgTime ≤ 120s, cleanStreak ≥ 5
//
// KEY FIX: All tasks have weakness: null so consecutiveCleanSolves
// increments on every correct solve. Scenes 2, 4, 5 show wrong starter
// code so the LIVE DETECTOR fires visually (hardcoded_value, logic_error,
// syntax_error) — but we save weakness:null because the student fixes it
// and submits the correct answer. Streak is never broken. ✅
//
// BKT math: starts 0.2, pLearn=0.3, pSlip=0.1, pGuess=0.2
// After 10 correct solves → ~0.92 (well above 0.85 threshold) ✅
// timeTakenSeconds defaults to 30s → well under 120s ✅
// accuracy = 10/10 = 100% → above 75% ✅

const DEMO_TASKS = [
  // ── BEGINNER TASKS 1-10 ─────────────────────────────────────────────────
  {
    scene: 1,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "📘 Beginner — loops",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    starterCode: " ",
    solutionCode: "for i in range(2, 9, 2):\n    print(i)",
    
  },
  {
    scene: 2,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "math",
    weakness: null,
    label: "🔒 Beginner — hardcoded_value detected (fix it!)",
    task: "Calculate 10 - 4 and print the result.",
    expectedOutput: "6",
    starterCode: "",
    solutionCode: "print(10 - 4)",
    
  },
  {
    scene: 3,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "math",
    weakness: null,
    label: "📘 Beginner — multiplication",
    task: "Print the result of 3 multiplied by 4.",
    expectedOutput: "12",
    starterCode: " ",
    solutionCode: "print(3 * 4)",
    
  },
  {
  scene: 4,
  skillLevel: "Beginner",
  learningMode: "level_up",
  concept: "conditions",
  weakness: null,
  label: "📘 Beginner — conditions",
  task: "Print the letters in the word cat each on a new line.",
  expectedOutput: "c\na\nt",
  starterCode: "",
  solutionCode: "for ch in 'cat':\n    print(ch)",
},
  {
    scene: 5,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "variables",
    weakness: null,
    label: "📘 Beginner — variables",
    task: "Create two variables x = 5 and y = 3 and print their sum.",
    expectedOutput: "8",
    starterCode: "",
    solutionCode: "x = 5\ny = 3\nprint(x + y)",
    
  },
  {
    scene: 6,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "🎯 Beginner — weakness remediation",
    task: "Print numbers from 1 to 5 using a for loop.",
    expectedOutput: "1\n2\n3\n4\n5",
    starterCode: " ",
    solutionCode: "for i in range(1, 6):\n    print(i)",
    
  },
  {
    scene: 7,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "variables",
    weakness: null,
    label: "📘 Beginner — variables",
    task: "Create a variable name = 'Alice' and print it.",
    expectedOutput: "Alice",
    starterCode: " ",
    solutionCode: "name = 'Alice'\nprint(name)",
    
  },
  {
    scene: 8,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "functions",
    weakness: null,
    label: "📘 Beginner — functions",
    task: "Write a function square(n) that returns n*n. Print square(6).",
    expectedOutput: "36",
    starterCode: " ",
    solutionCode: "def square(n):\n    return n * n\n\nprint(square(6))",
    
  },
  {
    scene: 9,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "math",
    weakness: null,
    label: "📘 Beginner — math",
    task: "Print the sum of 5 and 10.",
    expectedOutput: "15",
    starterCode: " ",
    solutionCode: "print(5 + 10)",
    
  },
  {
    scene: 10,
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "📘 Beginner — task 10 (🚀 Level Up trigger!)",
    task: "Print numbers from 5 down to 1 using a for loop.",
    expectedOutput: "5\n4\n3\n2\n1",
    starterCode: " ",
    solutionCode: "for i in range(5, 0, -1):\n    print(i)",
    
  },

  // ── INTERMEDIATE TASKS 11-25 ────────────────────────────────────────────
  {
    scene: 11,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "recursion",
    weakness: null,
    label: "📗 Intermediate — missing_base_case detected (fix it!)",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    starterCode: " ",
    solutionCode: "def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
    
  },
  {
  scene: 12,
  skillLevel: "Intermediate",
  learningMode: "level_up",
  concept: "strings",
  weakness: null,
  label: "📗 Intermediate — string reverse",
  task: "Reverse the string 'hello' and print it.",
  expectedOutput: "olleh",
  starterCode: "",
  solutionCode: "text = 'hello'\nprint(text[::-1])",
},
  {
    scene: 13,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "📗 Intermediate — loops",
    task: "Print the sum of all numbers from 1 to 10.",
    expectedOutput: "55",
    starterCode: " ",
    solutionCode: "total = 0\nfor i in range(1, 11):\n    total += i\nprint(total)",
    
  },
  {
    scene: 14,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "functions",
    weakness: null,
    label: "📗 Intermediate — functions",
    task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).",
    expectedOutput: "True",
    starterCode: " ",
    solutionCode: "def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4))",
    
  },
  {
    scene: 15,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "lists",
    weakness: null,
    label: "📗 Intermediate — lists",
    task: "Sort the list [5,2,8,1,9] and print it.",
    expectedOutput: "[1, 2, 5, 8, 9]",
    starterCode: " ",
    solutionCode: "lst = [5, 2, 8, 1, 9]\nlst.sort()\nprint(lst)",
    
  },
  {
    scene: 16,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "📗 Intermediate — while loop",
    task: "Use a while loop to print numbers from 5 down to 1.",
    expectedOutput: "5\n4\n3\n2\n1",
    starterCode: " ",
    solutionCode: "i = 5\nwhile i >= 1:\n    print(i)\n    i -= 1",
    
  },
  {
    scene: 17,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "functions",
    weakness: null,
    label: "📗 Intermediate — function",
    task: "Write a function multiply(a,b) that returns a*b. Print multiply(6,7).",
    expectedOutput: "42",
    starterCode: " ",
    solutionCode: "def multiply(a, b):\n    return a * b\n\nprint(multiply(6, 7))",
    
  },
  {
    scene: 18,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "lists",
    weakness: null,
    label: "📗 Intermediate — list comprehension",
    task: "Write a list comprehension returning squares of 1 to 4 and print it.",
    expectedOutput: "[1, 4, 9, 16]",
    starterCode: " ",
    solutionCode: "result = [x**2 for x in range(1, 5)]\nprint(result)",
    
  },
  {
    scene: 19,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "dictionaries",
    weakness: null,
    label: "📗 Intermediate — dictionaries",
    task: "Create a dictionary with keys 'name' and 'age' with values 'Alice' and 25. Print the name value.",
    expectedOutput: "Alice",
    starterCode: " ",
    solutionCode: "person = {'name': 'Alice', 'age': 25}\nprint(person['name'])",
    
  },
  {
    scene: 20,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "strings",
    weakness: null,
    label: "📗 Intermediate — string methods",
    task: "Convert the string 'python' to uppercase and print it.",
    expectedOutput: "PYTHON",
    starterCode: " ",
    solutionCode: "text = 'python'\nprint(text.upper())",
    
  },
  {
    scene: 21,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "loops",
    weakness: null,
    label: "📗 Intermediate — even numbers",
    task: "Print even numbers from 2 to 10 using a loop.",
    expectedOutput: "2\n4\n6\n8\n10",
    starterCode: " ",
    solutionCode: "for i in range(2, 11, 2):\n    print(i)",
    
  },
  {
    scene: 22,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "recursion",
    weakness: null,
    label: "📗 Intermediate — recursion countdown",
    task: "Write a recursive countdown(n) that prints each number. Call countdown(4).",
    expectedOutput: "4\n3\n2\n1",
    starterCode: " ",
    solutionCode: "def countdown(n):\n    if n == 0:\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(4)",
    
  },
  {
    scene: 23,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "sets",
    weakness: null,
    label: "📗 Intermediate — sets",
    task: "Create two sets {1,2,3} and {3,4,5} and print their union.",
    expectedOutput: "{1, 2, 3, 4, 5}",
    starterCode: " ",
    solutionCode: "set_a = {1, 2, 3}\nset_b = {3, 4, 5}\nprint(set_a | set_b)",
    
  },
  {
    scene: 24,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "functions",
    weakness: null,
    label: "📗 Intermediate — palindrome",
    task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').",
    expectedOutput: "True",
    starterCode: " ",
    solutionCode: "def is_palindrome(s):\n    return s == s[::-1]\n\nprint(is_palindrome('madam'))",
    
  },
  {
    scene: 25,
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "algorithm",
    weakness: null,
    label: "📗 Intermediate — task 25 (🚀 Level Up to Advanced!)",
    task: "Print whether 17 is prime — True or False.",
    expectedOutput: "True",
    starterCode: " ",
    solutionCode: "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint(is_prime(17))",
    
  },
];

// ─── SESSION STORAGE KEYS ────────────────────────────────────────────────
const DEMO_SCENE_KEY        = "demoSceneIndex";
const DEMO_RETURN_KEY       = "demoReturn";
const DEMO_USERID_KEY       = "demoUserId";
const DEMO_BKT_KEY          = "demoBkt";
const DEMO_RESTORE_LOCK_KEY = "demoRestoreLock";
const DEMO_RESET_LOCK_KEY   = "demoResetLock";

export default function DemoPage() {
  const navigate = useNavigate();

  const [sceneIndex, setSceneIndex]       = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [liveBkt, setLiveBkt]             = useState(20);
  const [generatedTask, setGeneratedTask] = useState("");
  const [skillLevel, setSkillLevel]       = useState("Beginner");
  const [learningMode, setLearningMode]   = useState("level_up");
  const [currentConcept, setCurrentConcept] = useState(null);
  const [expectedOutput, setExpectedOutput] = useState("");
  const [code, setCode]                   = useState("");
  const [hints, setHints]                 = useState([]);
  const [loadingHints, setLoadingHints]   = useState(false);
  const [isCorrect, setIsCorrect]         = useState(false);
  const [lastTypedAt, setLastTypedAt]     = useState(Date.now());
  const [levelUpData, setLevelUpData]     = useState(null);
  const [showAnswerUsed, setShowAnswerUsed] = useState(false); // NEW

  const isCorrectRef      = useRef(false);
  const skillLevelRef     = useRef("Beginner");
  const expectedOutputRef = useRef("");
  const sceneRef          = useRef(DEMO_TASKS[0]);
  const generatedTaskRef  = useRef("");
  const taskStartRef      = useRef(Date.now());
  const progressSavedRef  = useRef(false);
  const sceneIndexRef     = useRef(0);

  const initFromProfileRef = useRef(sessionStorage.getItem(DEMO_RETURN_KEY) === "true");
  const initSceneIdxRef    = useRef(() => {
    const raw = sessionStorage.getItem(DEMO_SCENE_KEY);
    return raw !== null ? (parseInt(raw, 10) || 0) : 0;
  });
  const initBktRef = useRef(() => {
    const raw = sessionStorage.getItem(DEMO_BKT_KEY);
    return raw !== null ? (parseFloat(raw) || 20) : 20;
  });

  // ── Navigate to profile ───────────────────────────────────────────────
  function goToDemoProfile() {
    sessionStorage.setItem(DEMO_USERID_KEY, DEMO_USER_ID);
    sessionStorage.setItem(DEMO_RETURN_KEY, "true");
    sessionStorage.setItem(DEMO_SCENE_KEY,  String(sceneIndexRef.current));
    sessionStorage.setItem(DEMO_BKT_KEY,    String(liveBkt));
    navigate("/profile-demo");
  }

  // ── Apply a scene ─────────────────────────────────────────────────────
  function applyScene(idx) {
    setTransitioning(true);
    setLevelUpData(null);
    setShowAnswerUsed(false); // reset on each new scene
    setTimeout(() => {
      const s = DEMO_TASKS[idx];
      sceneRef.current          = s;
      generatedTaskRef.current  = s.task;
      expectedOutputRef.current = s.expectedOutput;
      skillLevelRef.current     = s.skillLevel;
      sceneIndexRef.current     = idx;

      setSceneIndex(idx);
      setGeneratedTask(s.task);
      setSkillLevel(s.skillLevel);
      setLearningMode(s.learningMode);
      setCurrentConcept(s.concept);
      setExpectedOutput(s.expectedOutput);
      setCode(s.starterCode);
      setHints([]);
      setIsCorrect(false);
      isCorrectRef.current     = false;
      progressSavedRef.current = false;
      taskStartRef.current     = Date.now();
      setTransitioning(false);
    }, 250);
  }

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fromProfile = sessionStorage.getItem(DEMO_RETURN_KEY) === "true";
    const restoreLock = sessionStorage.getItem(DEMO_RESTORE_LOCK_KEY) === "true";
    const rawScene    = sessionStorage.getItem(DEMO_SCENE_KEY);
    const rawBkt      = sessionStorage.getItem(DEMO_BKT_KEY);

    const idx = rawScene !== null ? (parseInt(rawScene, 10) || 0) : 0;
    const bkt = rawBkt   !== null ? (parseFloat(rawBkt)    || 20) : 20;

    console.log("🎬 DemoPage init — fromProfile:", fromProfile, "restoreLock:", restoreLock, "scene:", idx, "bkt:", bkt);

    if (fromProfile) {
      sessionStorage.setItem(DEMO_RESTORE_LOCK_KEY, "true");
      sessionStorage.removeItem(DEMO_RETURN_KEY);
      console.log(`🔙 Restoring from profile — scene=${idx}, BKT=${bkt}`);
      setLiveBkt(bkt);
      applyScene(idx);
      return;
    }

    if (restoreLock) {
      console.log("🔒 Restore lock active — skipping reset");
      sessionStorage.removeItem(DEMO_RESTORE_LOCK_KEY);
      setLiveBkt(bkt);
      applyScene(idx);
      return;
    }

    console.log("🆕 Fresh demo open — resetting MongoDB");

    if (sessionStorage.getItem(DEMO_RESET_LOCK_KEY) === "true") {
      console.log("🔒 Fresh reset already running — skip duplicate");
      return;
    }

    sessionStorage.setItem(DEMO_RESET_LOCK_KEY, "true");

    const doReset = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/progress/reset-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: DEMO_USER_ID, skillLevel: "Beginner" })
        });
        if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
        setLiveBkt(20);
        sessionStorage.setItem(DEMO_BKT_KEY,   "20");
        sessionStorage.setItem(DEMO_SCENE_KEY,  "0");
      } catch (err) {
        console.error("Demo reset failed:", err);
      } finally {
        sessionStorage.removeItem(DEMO_RESET_LOCK_KEY);
      }
      applyScene(0);
    };

    doReset();
  }, []);

  // ── Save progress ─────────────────────────────────────────────────────
  const saveProgress = async (solved) => {
    if (progressSavedRef.current) return;
    progressSavedRef.current = true;

    const s        = sceneRef.current;
    const timeTaken = Math.floor((Date.now() - taskStartRef.current) / 1000);

    try {
      const res = await fetch("http://localhost:5000/api/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:           DEMO_USER_ID,
          task:             s.task,
          weakness:         s.weakness,
          concept:          s.concept,
          learningMode:     s.learningMode,
          skillLevel:       s.skillLevel,
          solved,
          timeTakenSeconds: timeTaken > 0 ? timeTaken : 30,
          taskLevel:        s.skillLevel,
          codeSubmission:   code,
        }),
      });

      if (!res.ok) {
        throw new Error(`Save failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data || typeof data.bktMastery === 'undefined') {
        throw new Error("Invalid response: missing bktMastery");
      }

      const newBkt = (data.bktMastery || 0) * 100;
      setLiveBkt(newBkt);
      sessionStorage.setItem(DEMO_BKT_KEY, String(newBkt));

      console.log(
        `✅ Saved — BKT:${newBkt.toFixed(1)}%`,
        `XP:${data.totalXP}`,
        `Streak:${data.consecutiveCleanSolves}`,
        `Solved@lvl:${data.levelUpProgress?.solvedAtCurrentLevel}`
      );

      if (data.leveledUp) {
        setLevelUpData(data);
        setSkillLevel(data.skillLevel);
        skillLevelRef.current = data.skillLevel;
      }
    } catch (err) {
      console.error("❌ Demo save error:", err);
      progressSavedRef.current = false; // Reset on error so retry is possible
    }
  };

  // ── Show Answer handler ───────────────────────────────────────────────
  // NEW: fills editor with solution and auto-marks correct after 2s
  function handleShowAnswer() {
    const solution = sceneRef.current.solutionCode;
    if (!solution) return;

    setCode(solution);
    setShowAnswerUsed(true);
    setHints(["💡 Answer shown — review the solution below!"]);

    // Auto-mark correct after 2 seconds so Next Task button appears
    setTimeout(() => {
      setIsCorrect(true);
      isCorrectRef.current = true;
      setHints(["✅ Answer shown — study it and move to the next task!"]);
      saveProgress(true); // false = shown answer, not self-solved// for the presentation only i changed this as true
    }, 2000);
  }

  // ── Live weakness detection ───────────────────────────────────────────
  // FIX: increased timeout from 1200ms → 3000ms to avoid premature hints
  // FIX: increased minimum code length from 3 → 10 characters
  useEffect(() => {
    if (!code || code.trim().length < 10) {
      setHints([]);
      return;
    }

    if (isCorrectRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setLoadingHints(true);

        const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);
        const requiresFunction =
          generatedTaskRef.current.toLowerCase().includes("function") ||
          generatedTaskRef.current.toLowerCase().includes("def ");

      const result = await analyzeWeakness(
        code,
        skillLevelRef.current,
        idleSeconds,
        expectedOutputRef.current,
        "",
        requiresFunction
      );

        // ── CODE PATTERN VALIDATION (sanity check on ML predictions) ─────
        const validatedWeakness = validateWeaknessDetection(code, result.primary, requiresFunction, generatedTaskRef.current);
        
        const correct = result.hints?.some((h) =>
          h.toLowerCase().includes("correct")
        );

        if (correct) {
          setIsCorrect(true);
          isCorrectRef.current = true;
          setHints(["✅ Your answer is correct!"]);
          saveProgress(true);
        } else if (!result.primary && !correct) {
          setHints(["✔ No issues detected"]);
        } else if (validatedWeakness) {
          try {
            const tutor = await fetch("http://localhost:5000/api/tutor/hint", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                weakness:     validatedWeakness,
                skill:        skillLevelRef.current,
                code,
                task:         generatedTaskRef.current,
                concept:      sceneRef.current.concept,
                learningMode: sceneRef.current.learningMode,
              }),
            });

            const tutorData = await tutor.json();
            // ── COMBINED HINTS: weakness_model + tutorRoutes ─────────────
            const combinedHints = [];
            
            // 1. Add weakness_model hints first
            if (result.hints && result.hints.length > 0) {
              combinedHints.push(...result.hints);
            }
            
            // 2. Add tutorRoutes hint (WeaknessHintEngine + fallback)
            if (tutorData.hint) {
              combinedHints.push(tutorData.hint);
            }
            
            setHints(combinedHints.length > 0 ? combinedHints : ["Try solving step by step."]);
          } catch {
            setHints(result.hints || ["Try solving step by step."]);
          }
        } else {
          const secondaryCorrect = (result.hints || []).some(h =>
          h.toLowerCase().includes("correct")
          );
          if (secondaryCorrect) {
            setIsCorrect(true);
            isCorrectRef.current = true;
            setHints(["✅ Your answer is correct!"]);
            saveProgress(true);  // ← THIS is what was never being called
          } else {
            setHints(["✔ No issues detected"]);
          }
        }
      } catch (err) {
        console.error("Demo hint error:", err);
      } finally {
        setLoadingHints(false);
      }
    }, 3000); // ← FIXED: was 1200, now 3000ms

  return () => clearTimeout(timeout);
}, [code, lastTypedAt]);

  // ── Navigation ────────────────────────────────────────────────────────
  function handleNext() {
  if (!isCorrectRef.current) {
    alert("⚠️ Complete the task before moving!");
    return;
  }

  const cur = sceneIndexRef.current;
  if (cur < DEMO_TASKS.length - 1) {
    const next = cur + 1;
    sessionStorage.setItem(DEMO_SCENE_KEY, String(next));
    applyScene(next);
  }
}

  function handlePrev() {
    const cur = sceneIndexRef.current;
    if (cur > 0) {
      const prev = cur - 1;
      sessionStorage.setItem(DEMO_SCENE_KEY, String(prev));
      applyScene(prev);
    }
  }

  const total = DEMO_TASKS.length;
  const scene = DEMO_TASKS[sceneIndex];

  const bktColor =
    liveBkt >= 85 ? "linear-gradient(90deg,#16a34a,#22c55e)"
    : liveBkt >= 60 ? "linear-gradient(90deg,#eab308,#f59e0b)"
    : "linear-gradient(90deg,#2563eb,#7c3aed)";

  return (
    <div
      className="task-container"
      style={{
        paddingBottom: 32,
        opacity: transitioning ? 0.3 : 1,
        transition: "opacity 0.25s ease"
      }}
    >
      <h1 className="title">🧠 Adaptive Coding Task</h1>

      {/* ── Skill row ── */}
      <p className="skill">
        Predicted Skill:
        <span className="skill-pill">{skillLevel}</span>

        <button
          className="quiz-again-btn"
          onClick={() => {
            sessionStorage.removeItem(DEMO_USERID_KEY);
            sessionStorage.removeItem(DEMO_RETURN_KEY);
            sessionStorage.removeItem(DEMO_SCENE_KEY);
            sessionStorage.removeItem(DEMO_BKT_KEY);
            navigate("/exercise");
          }}
          type="button"
        >← Back to Editor</button>

        <button className="quiz-again-btn" onClick={goToDemoProfile} type="button">
          📊 My Profile
        </button>

        <button type="button" className="quiz-again-btn" style={{
          background: learningMode === "level_up"
            ? "linear-gradient(90deg, #2563eb, #7c3aed)" : undefined,
          color: learningMode === "level_up" ? "#fff" : undefined,
        }}>🚀 Level Up</button>

        <button type="button" className="quiz-again-btn">🧠 Concept Tutor</button>

        <button type="button" className="quiz-again-btn" style={{
          background: "rgba(30, 58, 95, 0.9)",
          border: "1px solid #3b82f644",
          color: "#60a5fa", fontWeight: "700"
        }}>🎬 Demo (Active)</button>

        <span style={{
          marginLeft: 8, color: "#60a5fa", fontSize: 13, fontWeight: 700,
          background: "#1e3a5f", padding: "4px 12px", borderRadius: 999
        }}>
          Task {sceneIndex + 1} / {total}
        </span>
      </p>

      {/* Scene label */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <span style={{
          background: "#1e293b", color: "#a78bfa",
          padding: "3px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700
        }}>
          {scene.label}
        </span>
      </div>

      {/* Mode line */}
      <div style={{ textAlign: "center", marginBottom: "12px", color: "#a5b4fc" }}>
        <small>
          Current Mode:{" "}
          <strong>{learningMode === "level_up" ? "Level Up" : "Improve Weak Concept"}</strong>
          {currentConcept ? ` • Concept: ${currentConcept}` : ""}
        </small>
      </div>

      {/* ── Level Up Overlay ── */}
      {levelUpData && (
        <div style={{
          background: "linear-gradient(135deg, #0f2027, #1e3a5f)",
          border: "2px solid #3b82f6", borderRadius: 16,
          padding: 28, marginBottom: 20, textAlign: "center",
          boxShadow: "0 0 40px #3b82f644"
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={{ color: "#4ade80", fontSize: 26, margin: "0 0 12px" }}>
            LEVEL UP — You are now {levelUpData.skillLevel}!
          </h2>
          <div style={{
            display: "flex", justifyContent: "center",
            gap: 20, flexWrap: "wrap", marginBottom: 16
          }}>
            {[
              ["🧠 BKT Mastery",  `${(levelUpData.bktMastery * 100).toFixed(1)}%`],
              ["✅ Tasks Solved",  levelUpData.totalSolved],
              ["⭐ Total XP",      levelUpData.totalXP?.toFixed(1)],
              ["⏱ Avg Time",      `${levelUpData.avgSolveTime}s`],
              ["🔥 Clean Streak",  levelUpData.consecutiveCleanSolves],
            ].map(([label, val]) => (
              <div key={label} style={{
                background: "#0f172a", border: "1px solid #1e40af",
                borderRadius: 10, padding: "10px 18px", minWidth: 120
              }}>
                <div style={{ color: "#60a5fa", fontSize: 12 }}>{label}</div>
                <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 20 }}>{val}</div>
              </div>
            ))}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 14px" }}>
            MongoDB updated • skillLevel ={" "}
            <strong style={{ color: "#facc15" }}>{levelUpData.skillLevel}</strong> •
            Bloom XP bonus applied
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={goToDemoProfile} style={{
              background: "linear-gradient(90deg, #0f766e, #0d9488)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>📊 View Profile →</button>
            <button onClick={() => { setLevelUpData(null); handleNext(); }} style={{
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>Continue Demo →</button>
          </div>
        </div>
      )}

      {/* Task box */}
      <div className="task-box">
        <h3>Your Task</h3>
        <p className="task-text" style={{ whiteSpace: "pre-line" }}>{generatedTask}</p>
      </div>

      <h3 className="solution-title">Your Solution</h3>

      {/* ── Editor + Hint panel ── */}
      <div className="editor-hint-wrapper">
        <div className="editor-container">
          <Editor
            height="420px"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              setCode(value || "");
              setLastTypedAt(Date.now());
              if (isCorrectRef.current) {
                setIsCorrect(false);
                isCorrectRef.current     = false;
                progressSavedRef.current = false;
                setHints([]);
                setShowAnswerUsed(false);
              }
            }}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <div className="hint-panel">
            <h4>Live Hints</h4>

            {loadingHints && <p className="hint-loading">Analyzing…</p>}
            {!loadingHints && hints.length === 0 && !isCorrect && (
              <p className="hint-ok">✔ No issues detected</p>
            )}
            {!loadingHints && hints.map((hint, i) => (
              <p key={i}
                className={hint.includes("correct") || hint.includes("✅") ? "hint-correct" : "hint-item"}
              >
                {hint.includes("✅") || hint.includes("correct") ? "" : "⚠ "}
                {hint}
              </p>
            ))}

            {/* ── Show Answer button — always visible unless already correct ── */}
            {/* NEW: only show if not yet correct and answer not already shown */}
            {!isCorrect && !showAnswerUsed && (
              <button
                type="button"
                onClick={handleShowAnswer}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "9px",
                  background: "linear-gradient(90deg, #d97706, #f59e0b)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                💡 Show Answer
              </button>
            )}

            {/* Next Task button — only when correct and no level-up overlay */}
            {isCorrect && !levelUpData && (
              <button
                onClick={handleNext}
                disabled={sceneIndex === total - 1}
                type="button"
                style={{
                  marginTop: "12px", width: "100%", padding: "10px",
                  background: sceneIndex === total - 1
                    ? "#1e293b"
                    : "linear-gradient(90deg, #16a34a, #22c55e)",
                  color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: "bold", cursor: "pointer"
                }}
              >
                {sceneIndex === total - 1 ? "Demo Complete ✓" : "Next Task →"}
              </button>
            )}

            {/* Live BKT bar */}
            <div style={{
              marginTop: 16, padding: "10px 12px",
              background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b"
            }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
                BKT MASTERY (live from MongoDB)
              </div>
              <div style={{ height: 8, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  width: `${liveBkt}%`, height: "100%",
                  borderRadius: 999, background: bktColor,
                  transition: "width 0.8s ease"
                }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 13, marginTop: 6,
                color: liveBkt >= 85 ? "#4ade80" : liveBkt >= 60 ? "#facc15" : "#f87171"
              }}>
                {liveBkt.toFixed(1)}%
                {liveBkt >= 85 && (
                  <span style={{ color: "#4ade80", marginLeft: 6, fontSize: 11, fontWeight: 600 }}>
                    ✅ Threshold met!
                  </span>
                )}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>
                Target ≥ 85% • Updates after each correct solve
              </div>
            </div>

            {/* Profile shortcut */}
            <button type="button" onClick={goToDemoProfile} style={{
              marginTop: "12px", width: "100%", padding: "9px",
              background: "linear-gradient(90deg, #0f766e, #0d9488)",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "13px", fontWeight: "bold", cursor: "pointer"
            }}>📊 View My Profile</button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <div className="editor-actions">
          <button
            className="submit-btn" type="button"
            onClick={handlePrev} disabled={sceneIndex === 0}
            style={{
              background: "linear-gradient(90deg, #374151, #4b5563)",
              transform: "none", opacity: sceneIndex === 0 ? 0.4 : 1
            }}
          >← Prev Task</button>

          <button
            className="submit-btn" type="button"
            onClick={handleNext} disabled={sceneIndex === total - 1}
            style={{ background: "linear-gradient(90deg, #0ea5e9, #6366f1)", transform: "none" }}
          >🔁 Next Task</button>
        </div>
      </div>
    </div>
  );
}
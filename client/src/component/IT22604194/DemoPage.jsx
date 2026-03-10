import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { analyzeWeakness } from "./weaknessApi";

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
    skillLevel: "Beginner", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "📘 Beginner — loops",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    starterCode: "for i in range(2, 10, 2):\n    print(i)\n",
  },
  {
    scene: 2,
    skillLevel: "Beginner", learningMode: "level_up", concept: "math",
    weakness: null,   // null — hardcoded_value shown VISUALLY by live detector only
    label: "🔒 Beginner — hardcoded_value detected (fix it!)",
    task: "Calculate 10 - 4 and print the result.",
    expectedOutput: "6",
    starterCode: "print(6)\n",   // wrong → detector fires ⚠ hardcoded_value
  },
  {
    scene: 3,
    skillLevel: "Beginner", learningMode: "level_up", concept: "math",
    weakness: null,
    label: "✅ Beginner — hardcoded fixed",
    task: "Calculate 10 - 4 and print the result.",
    expectedOutput: "6",
    starterCode: "print(10 - 4)\n",
  },
  {
    scene: 4,
    skillLevel: "Beginner", learningMode: "level_up", concept: "loops",
    weakness: null,   // null — logic_error shown VISUALLY by live detector only
    label: "❌ Beginner — logic_error detected (fix it!)",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    starterCode: "for i in range(1, 9):\n    print(i)\n",  // wrong → fires ⚠ logic_error
  },
  {
    scene: 5,
    skillLevel: "Beginner", learningMode: "level_up", concept: "variables",
    weakness: null,   // null — syntax_error shown VISUALLY by live detector only
    label: "⚠️ Beginner — syntax_error detected (fix it!)",
    task: "Create a variable x = 7 and print it.",
    expectedOutput: "7",
    starterCode: "x = 7\nprint(x\n",   // wrong → fires ⚠ syntax_error
  },
  {
    scene: 6,
    skillLevel: "Beginner", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "🎯 Beginner — weakness remediation",
    task: "Print numbers from 1 to 5 using a for loop.",
    expectedOutput: "1\n2\n3\n4\n5",
    starterCode: "for i in range(1, 6):\n    print(i)\n",
  },
  {
    scene: 7,
    skillLevel: "Beginner", learningMode: "level_up", concept: "variables",
    weakness: null,
    label: "📘 Beginner — variables",
    task: "Create a variable name = 'Alice' and print it.",
    expectedOutput: "Alice",
    starterCode: "name = 'Alice'\nprint(name)\n",
  },
  {
    scene: 8,
    skillLevel: "Beginner", learningMode: "level_up", concept: "functions",
    weakness: null,
    label: "📘 Beginner — functions",
    task: "Write a function square(n) that returns n*n. Print square(6).",
    expectedOutput: "36",
    starterCode: "def square(n):\n    return n * n\n\nprint(square(6))\n",
  },
  {
    scene: 9,
    skillLevel: "Beginner", learningMode: "level_up", concept: "math",
    weakness: null,
    label: "📘 Beginner — math",
    task: "Print the sum of 5 and 10.",
    expectedOutput: "15",
    starterCode: "print(5 + 10)\n",
  },
  {
    scene: 10,
    skillLevel: "Beginner", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "📘 Beginner — task 10 (🚀 Level Up trigger!)",
    task: "Print numbers from 5 down to 1 using a for loop.",
    expectedOutput: "5\n4\n3\n2\n1",
    starterCode: "for i in range(5, 0, -1):\n    print(i)\n",
  },

  // ── INTERMEDIATE TASKS 11-25 ────────────────────────────────────────────
  // Scene 11 shows missing_base_case visually (wrong starter) but saves null.
  {
    scene: 11,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "recursion",
    weakness: null,   // null — missing_base_case shown VISUALLY only
    label: "📗 Intermediate — missing_base_case detected (fix it!)",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    starterCode: "def factorial(n):\n    return n * factorial(n - 1)\n\nprint(factorial(5))\n",
  },
  {
    scene: 12,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "recursion",
    weakness: null,
    label: "📗 Intermediate — recursion correct",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    starterCode: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))\n",
  },
  {
    scene: 13,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "📗 Intermediate — loops",
    task: "Print the sum of all numbers from 1 to 10.",
    expectedOutput: "55",
    starterCode: "print(sum(range(1, 11)))\n",
  },
  {
    scene: 14,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "functions",
    weakness: null,
    label: "📗 Intermediate — functions",
    task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).",
    expectedOutput: "True",
    starterCode: "def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4))\n",
  },
  {
    scene: 15,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "lists",
    weakness: null,
    label: "📗 Intermediate — lists",
    task: "Sort the list [5,2,8,1,9] and print it.",
    expectedOutput: "[1, 2, 5, 8, 9]",
    starterCode: "lst = [5,2,8,1,9]\nlst.sort()\nprint(lst)\n",
  },
  {
    scene: 16,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "📗 Intermediate — while loop",
    task: "Use a while loop to print numbers from 5 down to 1.",
    expectedOutput: "5\n4\n3\n2\n1",
    starterCode: "i = 5\nwhile i >= 1:\n    print(i)\n    i -= 1\n",
  },
  {
    scene: 17,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "functions",
    weakness: null,
    label: "📗 Intermediate — function",
    task: "Write a function multiply(a,b) that returns a*b. Print multiply(6,7).",
    expectedOutput: "42",
    starterCode: "def multiply(a, b):\n    return a * b\n\nprint(multiply(6, 7))\n",
  },
  {
    scene: 18,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "lists",
    weakness: null,
    label: "📗 Intermediate — list comprehension",
    task: "Write a list comprehension returning squares of 1 to 4 and print it.",
    expectedOutput: "[1, 4, 9, 16]",
    starterCode: "print([x**2 for x in range(1, 5)])\n",
  },
  {
    scene: 19,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "dictionaries",
    weakness: null,
    label: "📗 Intermediate — dictionaries",
    task: "Create a dictionary with keys 'name' and 'age' with values 'Alice' and 25. Print the name value.",
    expectedOutput: "Alice",
    starterCode: "d = {'name': 'Alice', 'age': 25}\nprint(d['name'])\n",
  },
  {
    scene: 20,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "exception_handling",
    weakness: null,
    label: "📗 Intermediate — exception handling",
    task: "Write a try/except block that catches a ZeroDivisionError when dividing 10 by 0 and prints Cannot divide by zero.",
    expectedOutput: "Cannot divide by zero",
    starterCode: "try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\n",
  },
  {
    scene: 21,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "loops",
    weakness: null,
    label: "📗 Intermediate — even numbers",
    task: "Print even numbers from 2 to 10 using a loop.",
    expectedOutput: "2\n4\n6\n8\n10",
    starterCode: "for i in range(2, 11, 2):\n    print(i)\n",
  },
  {
    scene: 22,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "recursion",
    weakness: null,
    label: "📗 Intermediate — recursion countdown",
    task: "Write a recursive countdown(n) that prints each number. Call countdown(4).",
    expectedOutput: "4\n3\n2\n1",
    starterCode: "def countdown(n):\n    if n == 0:\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(4)\n",
  },
  {
    scene: 23,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "sets",
    weakness: null,
    label: "📗 Intermediate — sets",
    task: "Create two sets {1,2,3} and {3,4,5} and print their union.",
    expectedOutput: "{1, 2, 3, 4, 5}",
    starterCode: "a = {1,2,3}\nb = {3,4,5}\nprint(a | b)\n",
  },
  {
    scene: 24,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "functions",
    weakness: null,
    label: "📗 Intermediate — palindrome",
    task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').",
    expectedOutput: "True",
    starterCode: "def is_palindrome(s):\n    return s == s[::-1]\n\nprint(is_palindrome('madam'))\n",
  },
  {
    scene: 25,
    skillLevel: "Intermediate", learningMode: "level_up", concept: "algorithm",
    weakness: null,
    label: "📗 Intermediate — task 25 (🚀 Level Up to Advanced!)",
    task: "Print whether 17 is prime — True or False.",
    expectedOutput: "True",
    starterCode: "n = 17\nis_prime = all(n % i != 0 for i in range(2, n))\nprint(is_prime)\n",
  },
];

// ─── SESSION STORAGE KEYS ────────────────────────────────────────────────
const DEMO_SCENE_KEY  = "demoSceneIndex";
const DEMO_RETURN_KEY = "demoReturn";
const DEMO_USERID_KEY = "demoUserId";
const DEMO_BKT_KEY    = "demoBkt";
const DEMO_RESTORE_LOCK_KEY = "demoRestoreLock";
const DEMO_RESET_LOCK_KEY = "demoResetLock";

export default function DemoPage() {
  const navigate = useNavigate();
  

  const [sceneIndex, setSceneIndex]         = useState(0);
  const [transitioning, setTransitioning]   = useState(false);
  const [liveBkt, setLiveBkt]               = useState(20);
  const [generatedTask, setGeneratedTask]   = useState("");
  const [skillLevel, setSkillLevel]         = useState("Beginner");
  const [learningMode, setLearningMode]     = useState("level_up");
  const [currentConcept, setCurrentConcept] = useState(null);
  const [expectedOutput, setExpectedOutput] = useState("");
  const [code, setCode]                     = useState("");
  const [hints, setHints]                   = useState([]);
  const [loadingHints, setLoadingHints]     = useState(false);
  const [isCorrect, setIsCorrect]           = useState(false);
  const [lastTypedAt, setLastTypedAt]       = useState(Date.now());
  const [levelUpData, setLevelUpData]       = useState(null);
  

  const isCorrectRef      = useRef(false);
  const skillLevelRef     = useRef("Beginner");
  const expectedOutputRef = useRef("");
  const sceneRef          = useRef(DEMO_TASKS[0]);
  const generatedTaskRef  = useRef("");
  const taskStartRef      = useRef(Date.now());
  const progressSavedRef  = useRef(false);
  // tracks current scene index for use inside callbacks (avoids stale closure)
  const sceneIndexRef     = useRef(0);

  // ── Read sessionStorage ONCE at component creation (before any effect runs)
  // This survives React 18 Strict Mode double-invocation because refs are
  // initialised only once even when effects fire twice.
  const initFromProfileRef = useRef(sessionStorage.getItem(DEMO_RETURN_KEY) === "true");
  const initSceneIdxRef    = useRef(() => {
    const raw = sessionStorage.getItem(DEMO_SCENE_KEY);
    return raw !== null ? (parseInt(raw, 10) || 0) : 0;
  });
  const initBktRef         = useRef(() => {
    const raw = sessionStorage.getItem(DEMO_BKT_KEY);
    return raw !== null ? (parseFloat(raw) || 20) : 20;
  });

  // ── Navigate to profile — save exact scene + BKT ─────────────────────
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
    setTimeout(() => {
      const s = DEMO_TASKS[idx];
      sceneRef.current          = s;
      generatedTaskRef.current  = s.task;
      expectedOutputRef.current = s.expectedOutput;
      skillLevelRef.current     = s.skillLevel;
      sceneIndexRef.current     = idx;   // keep ref in sync

      setSceneIndex(idx);               // also update state
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
  // Read sessionStorage here (inside useEffect) — guaranteed reliable after mount.
  useEffect(() => {
  const fromProfile = sessionStorage.getItem(DEMO_RETURN_KEY) === "true";
  const restoreLock = sessionStorage.getItem(DEMO_RESTORE_LOCK_KEY) === "true";
  const rawScene = sessionStorage.getItem(DEMO_SCENE_KEY);
  const rawBkt = sessionStorage.getItem(DEMO_BKT_KEY);

  const idx = rawScene !== null ? (parseInt(rawScene, 10) || 0) : 0;
  const bkt = rawBkt !== null ? (parseFloat(rawBkt) || 20) : 20;

  console.log("🎬 DemoPage init — fromProfile:", fromProfile, "restoreLock:", restoreLock, "scene:", idx, "bkt:", bkt);

  // Case 1: returning from profile
  if (fromProfile) {
    sessionStorage.setItem(DEMO_RESTORE_LOCK_KEY, "true");
    sessionStorage.removeItem(DEMO_RETURN_KEY);

    console.log(`🔙 Restoring from profile — scene=${idx}, BKT=${bkt}`);
    setLiveBkt(bkt);
    applyScene(idx);
    return;
  }

  // Case 2: second mount in Strict Mode right after restore
  if (restoreLock) {
    console.log("🔒 Restore lock active — skipping reset");
    sessionStorage.removeItem(DEMO_RESTORE_LOCK_KEY);
    setLiveBkt(bkt);
    applyScene(idx);
    return;
  }

  // Case 3: real fresh open
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
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        skillLevel: "Beginner"
      })
    });

    if (!res.ok) {
      throw new Error(`Reset failed: ${res.status}`);
    }

    setLiveBkt(20);
    sessionStorage.setItem(DEMO_BKT_KEY, "20");
    sessionStorage.setItem(DEMO_SCENE_KEY, "0");

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

    const s = sceneRef.current;
    const timeTaken = Math.floor((Date.now() - taskStartRef.current) / 1000);

    try {
      const res = await fetch("http://localhost:5000/api/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:           DEMO_USER_ID,
          task:             s.task,
          weakness:         s.weakness,     // always null → streak never breaks ✅
          concept:          s.concept,
          learningMode:     s.learningMode,
          skillLevel:       s.skillLevel,
          solved,
          timeTakenSeconds: timeTaken > 0 ? timeTaken : 30,
          taskLevel:        s.skillLevel,
          codeSubmission:   code,
        }),
      });

      const data = await res.json();
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
      console.error("Demo save error:", err);
    }
  };

  // ── Live weakness detection ───────────────────────────────────────────
  useEffect(() => {
    if (!code || code.trim().length < 3) { setHints([]); return; }
    if (isCorrectRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setLoadingHints(true);
        const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);
        const requiresFunction =
          generatedTaskRef.current.toLowerCase().includes("function") ||
          generatedTaskRef.current.toLowerCase().includes("def ");

        const result = await analyzeWeakness(
          code, skillLevelRef.current, idleSeconds,
          expectedOutputRef.current, "", requiresFunction
        );

        const correct = result.hints?.some((h) => h.includes("correct"));

        if (correct) {
          setIsCorrect(true);
          isCorrectRef.current = true;
          setHints(["✅ Your answer is correct!"]);
          saveProgress(true);
        } else {
          if (result.primary) {
            try {
              const tutor = await fetch("http://localhost:5000/api/tutor/hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  weakness:     result.primary,
                  skill:        skillLevelRef.current,
                  code,
                  task:         generatedTaskRef.current,
                  concept:      sceneRef.current.concept,
                  learningMode: sceneRef.current.learningMode,
                }),
              });
              const tutorData = await tutor.json();
              setHints([tutorData.hint]);
            } catch {
              setHints(result.hints || []);
            }
          } else {
            setHints(result.hints || []);
          }
        }
      } catch (err) {
        console.error("Demo hint error:", err);
      } finally {
        setLoadingHints(false);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [code, lastTypedAt]);

  // ── Navigation ────────────────────────────────────────────────────────
  // Use sceneIndexRef for current value — avoids stale closure in callbacks
  function handleNext() {
    const cur = sceneIndexRef.current;
    if (cur < DEMO_TASKS.length - 1) {
      const next = cur + 1;
      sessionStorage.setItem(DEMO_SCENE_KEY, String(next));
      applyScene(next);  // applyScene also calls setSceneIndex(next) internally
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
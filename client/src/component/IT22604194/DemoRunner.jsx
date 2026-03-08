/**
 * DemoRunner.jsx
 * 
 * HOW TO USE:
 * 1. Import DemoRunner into your TaskEditor.jsx
 * 2. Add a "🎬 Demo" button that sets showDemo=true
 * 3. Pass your TaskEditor's state setters into DemoRunner
 * 
 * Example in TaskEditor.jsx:
 * 
 *   import DemoRunner from "./DemoRunner";
 *   const [showDemo, setShowDemo] = useState(false);
 * 
 *   // Add button next to your existing buttons:
 *   <button onClick={() => setShowDemo(true)} style={{...}}>🎬 Demo</button>
 * 
 *   // Add at bottom of return:
 *   {showDemo && (
 *     <DemoRunner
 *       onClose={() => setShowDemo(false)}
 *       setTask={setTask}               // sets the task text shown
 *       setExpectedOutput={setExpectedOutput}
 *       setCode={setCode}               // sets code editor content
 *       setOutput={setOutput}           // sets output panel
 *       setWeakness={setWeakness}       // sets weakness/hint panel
 *       setHint={setHint}
 *       setSkillLevel={setSkillLevel}   // sets displayed skill level
 *       setConcept={setConcept}
 *       setBktMastery={setBktMastery}
 *       setXP={setXP}
 *       setIsCorrect={setIsCorrect}
 *     />
 *   )}
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DEMO SCRIPT ─────────────────────────────────────────────────────────────
// Each step drives the actual TaskEditor state + shows a narrator overlay
const DEMO_SCRIPT = [
  // ── SCENE 1: Beginner task, correct answer ──────────────────────────────
  {
    scene: 1,
    label: "Beginner · Correct Answer",
    narrator: "📘 Beginner task generated from structuredTasks. Student solves correctly → BKT mastery increases.",
    skillLevel: "Beginner",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    concept: "loops",
    source: "structured_tasks",
    code: "for i in range(2, 10, 2):\n    print(i)",
    output: "2\n4\n6\n8",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.67,
    xp: 4,
    delay: 800,
  },

  // ── SCENE 2: Beginner task, WRONG answer → logic_error detected ─────────
  {
    scene: 2,
    label: "Beginner · logic_error Detected",
    narrator: "❌ Same task, wrong answer submitted. ML model detects logic_error → hint shown in hint panel.",
    skillLevel: "Beginner",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    concept: "loops",
    source: "structured_tasks",
    code: "for i in range(1, 9):\n    print(i)",
    output: "1\n2\n3\n4\n5\n6\n7\n8",
    isCorrect: false,
    weakness: "logic_error",
    hint: "Your loop range is wrong. range(2, 10, 2) produces even numbers. Trace the values step by step and compare with the expected output.",
    bktMastery: 0.54,
    xp: 0,
    delay: 800,
  },

  // ── SCENE 3: Weakness-targeted task (logic_error → loops task) ──────────
  {
    scene: 3,
    label: "Weakness-Based Task · logic_error → loops",
    narrator: "🎯 Previous logic_error → system selects a targeted loops task from structuredTasks to remediate weakness.",
    skillLevel: "Beginner",
    task: "Print numbers from 1 to 5 using a for loop.",
    expectedOutput: "1\n2\n3\n4\n5",
    concept: "loops",
    source: "structured_tasks",
    weakness: "logic_error",
    code: "for i in range(1, 6):\n    print(i)",
    output: "1\n2\n3\n4\n5",
    isCorrect: true,
    hint: null,
    bktMastery: 0.71,
    xp: 4,
    delay: 800,
  },

  // ── SCENE 4: syntax_error detected ──────────────────────────────────────
  {
    scene: 4,
    label: "Beginner · syntax_error Detected",
    narrator: "⚠️ Student submits code with syntax error. AST parser detects it immediately before execution.",
    skillLevel: "Beginner",
    task: "Create a variable x = 7 and print it.",
    expectedOutput: "7",
    concept: "variables",
    source: "structured_tasks",
    code: "x = 7\nprint(x",
    output: "",
    isCorrect: false,
    weakness: "syntax_error",
    hint: "SyntaxError detected. Check your parentheses — print() requires a closing bracket.",
    bktMastery: 0.54,
    xp: 0,
    delay: 800,
  },

  // ── SCENE 5: LEVEL UP → Intermediate ────────────────────────────────────
  {
    scene: 5,
    label: "🚀 LEVEL UP: Beginner → Intermediate",
    narrator: "🚀 All 5 level-up criteria met: BKT ≥ 85%, tasks solved ≥ 10, accuracy ≥ 75%, avg time ≤ 120s, clean streak ≥ 5.",
    skillLevel: "Intermediate",
    task: "LEVEL UP ACHIEVED",
    expectedOutput: "",
    concept: "",
    source: "",
    code: "# 🎉 Level Up! You are now Intermediate.\n# BKT Mastery: 91%\n# Tasks Solved: 12\n# Accuracy: 83%\n# Avg Solve Time: 98s\n# Clean Streak: 5",
    output: "LEVEL UP: Beginner → Intermediate",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.91,
    xp: 20,
    delay: 1000,
  },

  // ── SCENE 6: Intermediate task, correct ─────────────────────────────────
  {
    scene: 6,
    label: "Intermediate · Correct Answer",
    narrator: "📗 System now generates Intermediate tasks. Student solves recursion task correctly.",
    skillLevel: "Intermediate",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    concept: "recursion",
    source: "structured_tasks",
    code: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
    output: "120",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.78,
    xp: 6,
    delay: 800,
  },

  // ── SCENE 7: missing_base_case detected ─────────────────────────────────
  {
    scene: 7,
    label: "Intermediate · missing_base_case Detected",
    narrator: "⚠️ Same task, student forgets the base case. ML model detects missing_base_case weakness.",
    skillLevel: "Intermediate",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    concept: "recursion",
    source: "structured_tasks",
    code: "def factorial(n):\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
    output: "",
    isCorrect: false,
    weakness: "missing_base_case",
    hint: "Your recursive function has no base case — it will recurse forever. Add: if n == 0: return 1",
    bktMastery: 0.62,
    xp: 0,
    delay: 800,
  },

  // ── SCENE 8: ZPD Boost ───────────────────────────────────────────────────
  {
    scene: 8,
    label: "⚡ ZPD Boost Activated",
    narrator: "⚡ ZPD Boost: 3 consecutive fast solves (avg 22s). System elevates task level to Advanced — Vygotsky's Zone of Proximal Development.",
    skillLevel: "Intermediate",
    task: "ZPD BOOST ACTIVE",
    expectedOutput: "",
    concept: "",
    source: "",
    code: "# ⚡ ZPD Boost Triggered!\n# 3 consecutive fast solves detected\n# Average solve time: 22s (threshold: 60s)\n# zpd_boost: true saved to MongoDB\n# Next task → Advanced level",
    output: "ZPD_BOOST: Elevating to Advanced tasks",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.85,
    xp: 0,
    delay: 800,
  },

  // ── SCENE 9: Advanced task, correct ─────────────────────────────────────
  {
    scene: 9,
    label: "Advanced · OOP Task Correct",
    narrator: "📕 Advanced task from structuredTasks. OOP concept — student implements Rectangle class correctly.",
    skillLevel: "Advanced",
    task: "Write a class Rectangle with width=4 and height=5. Print its area.",
    expectedOutput: "20",
    concept: "oop",
    source: "structured_tasks",
    code: "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height\n\nprint(Rectangle(4, 5).area())",
    output: "20",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.82,
    xp: 8,
    delay: 800,
  },

  // ── SCENE 10: Concept Chatbot ────────────────────────────────────────────
  {
    scene: 10,
    label: "🧠 Concept Tutor — recursion",
    narrator: "🧠 Student opens Concept Tutor, selects 'recursion'. System generates 5 ordered tasks easy→hard. Per-concept mastery tracked separately in MongoDB.",
    skillLevel: "Advanced",
    task: "CONCEPT TUTOR: recursion\n\n1. [easy]   Write a function countdown(n). Print countdown(3).\n2. [easy]   Write recursive factorial(n). Print factorial(5).\n3. [medium] Write recursive fibonacci(n). Print fibonacci(7).\n4. [medium] Write recursive sum_digits(n). Print sum_digits(1234).\n5. [hard]   Write recursive binary_search. Find index of 7 in [1,3,5,7,9].",
    expectedOutput: "3\n2\n1\n---\n120\n---\n13\n---\n10\n---\n3",
    concept: "recursion",
    source: "structured_tasks_concept",
    code: "# Concept Tutor: recursion\n# 5 tasks generated from easy → hard\n# Each submission updates conceptProgress\n# in MongoDB for this concept\n# BKT mastery tracked per concept separately",
    output: "Concept: recursion\nTasks: 5 ordered\nMastery before: 62%\nMastery after:  78%",
    isCorrect: true,
    weakness: null,
    hint: null,
    bktMastery: 0.78,
    xp: 0,
    delay: 800,
  },
];

// ─── NARRATOR OVERLAY ─────────────────────────────────────────────────────────
function NarratorBox({ step, sceneIndex, total, onNext, onPrev, onClose, isTransitioning }) {
  const skillColors = {
    Beginner: { bg: "#14532d", text: "#4ade80", border: "#16a34a" },
    Intermediate: { bg: "#713f12", text: "#facc15", border: "#ca8a04" },
    Advanced: { bg: "#7f1d1d", text: "#f87171", border: "#dc2626" },
  };
  const sc = skillColors[step.skillLevel] || skillColors.Beginner;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(720px, 95vw)",
      background: "#0a0f1e",
      border: "1px solid #1e3a5f",
      borderRadius: 14,
      boxShadow: "0 8px 40px #000c, 0 0 0 1px #3b82f611",
      zIndex: 99999,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      overflow: "hidden",
      opacity: isTransitioning ? 0 : 1,
      transition: "opacity 0.3s ease",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", background: "#060c1a",
        borderBottom: "1px solid #1e293b"
      }}>
        <div style={{
          background: "#1e3a5f", borderRadius: 6,
          padding: "3px 10px", color: "#60a5fa",
          fontSize: 11, fontWeight: 800, letterSpacing: 1
        }}>🎬 DEMO {sceneIndex + 1}/{total}</div>

        <div style={{
          background: sc.bg + "55", border: `1px solid ${sc.border}44`,
          borderRadius: 6, padding: "3px 10px",
          color: sc.text, fontSize: 11, fontWeight: 700
        }}>{step.skillLevel}</div>

        {step.concept && step.concept !== "" && (
          <div style={{
            background: "#4c1d9522", border: "1px solid #7c3aed44",
            borderRadius: 6, padding: "3px 10px",
            color: "#a78bfa", fontSize: 11, fontWeight: 600
          }}>{step.concept}</div>
        )}

        {step.source && step.source !== "" && (
          <div style={{
            background: "#0f766e22", border: "1px solid #0f766e44",
            borderRadius: 6, padding: "3px 10px",
            color: "#2dd4bf", fontSize: 11, fontWeight: 600
          }}>{step.source}</div>
        )}

        <div style={{ flex: 1 }} />

        {/* Step dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {DEMO_SCRIPT.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i === sceneIndex ? "#3b82f6" : i < sceneIndex ? "#1e40af" : "#1e293b",
              transition: "background 0.3s"
            }} />
          ))}
        </div>

        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: "#475569", cursor: "pointer", fontSize: 16, padding: "0 4px"
        }}>✕</button>
      </div>

      {/* Narrator text */}
      <div style={{ padding: "12px 16px 10px" }}>
        <div style={{
          color: "#e2e8f0", fontSize: 14, lineHeight: 1.6,
          fontFamily: "'Segoe UI', sans-serif"
        }}>
          <span style={{ color: "#64748b", fontSize: 12, marginRight: 8, fontFamily: "monospace" }}>
            [{step.label}]
          </span>
          {step.narrator}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 12, padding: "0 16px 10px",
        borderBottom: "1px solid #1e293b"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#475569" }}>BKT</span>
          <span style={{
            fontWeight: 800, fontSize: 13,
            color: step.bktMastery >= 0.8 ? "#4ade80" : step.bktMastery >= 0.6 ? "#facc15" : "#f87171"
          }}>{Math.round(step.bktMastery * 100)}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#475569" }}>XP</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: "#facc15" }}>+{step.xp}</span>
        </div>
        {step.weakness && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#475569" }}>weakness</span>
            <span style={{
              fontWeight: 700, fontSize: 12, color: "#f87171",
              background: "#7f1d1d22", padding: "2px 8px", borderRadius: 4
            }}>{step.weakness}</span>
          </div>
        )}
        {step.isCorrect && !step.weakness && step.task !== "LEVEL UP ACHIEVED" && step.task !== "ZPD BOOST ACTIVE" && (
          <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 13 }}>✅ Correct</div>
        )}
        {step.task === "LEVEL UP ACHIEVED" && (
          <div style={{ color: "#facc15", fontWeight: 800, fontSize: 13 }}>🚀 LEVEL UP!</div>
        )}
        {step.task === "ZPD BOOST ACTIVE" && (
          <div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 13 }}>⚡ ZPD BOOST</div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", alignItems: "center" }}>
        <button onClick={onPrev} disabled={sceneIndex === 0} style={{
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 8, color: sceneIndex === 0 ? "#334155" : "#94a3b8",
          cursor: sceneIndex === 0 ? "not-allowed" : "pointer",
          padding: "7px 16px", fontFamily: "monospace", fontSize: 12
        }}>← Prev</button>

        <div style={{ flex: 1, textAlign: "center", color: "#475569", fontSize: 11 }}>
          Click Next to advance through demo scenes
        </div>

        <button onClick={onNext} disabled={sceneIndex === total - 1} style={{
          background: sceneIndex === total - 1 ? "#1e293b" : "#1e3a5f",
          border: `1px solid ${sceneIndex === total - 1 ? "#334155" : "#3b82f644"}`,
          borderRadius: 8,
          color: sceneIndex === total - 1 ? "#334155" : "#60a5fa",
          cursor: sceneIndex === total - 1 ? "not-allowed" : "pointer",
          padding: "7px 18px", fontFamily: "monospace",
          fontSize: 12, fontWeight: 700
        }}>{sceneIndex === total - 1 ? "Done ✓" : "Next →"}</button>
      </div>
    </div>
  );
}

// ─── MAIN DEMO RUNNER ─────────────────────────────────────────────────────────
// Props match exactly what TaskEditor.jsx passes:
export default function DemoRunner({
  onClose,
  setGeneratedTask,
  setExpectedOutput,
  setCode,
  setHints,
  setPrimaryWeakness,
  setSkillLevel,
  setCurrentConcept,
  setIsCorrect,
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const applyScene = useCallback((step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (setGeneratedTask) setGeneratedTask(step.task);
      if (setExpectedOutput) setExpectedOutput(step.expectedOutput);
      if (setCode) setCode(step.code);
      // Show hint if wrong answer, clear if correct
      if (setHints) setHints(step.hint ? [step.hint] : step.isCorrect ? ["✅ Your answer is correct!"] : []);
      if (setPrimaryWeakness) setPrimaryWeakness(step.weakness);
      if (setSkillLevel) setSkillLevel(step.skillLevel);
      if (setCurrentConcept) setCurrentConcept(step.concept);
      if (setIsCorrect) setIsCorrect(step.isCorrect);
      setIsTransitioning(false);
    }, step.delay || 400);
  }, [setGeneratedTask, setExpectedOutput, setCode, setHints, setPrimaryWeakness, setSkillLevel, setCurrentConcept, setIsCorrect]);

  // Apply first scene on mount
  useEffect(() => {
    applyScene(DEMO_SCRIPT[0]);
  }, []);

  function handleNext() {
    if (sceneIndex < DEMO_SCRIPT.length - 1) {
      const next = sceneIndex + 1;
      setSceneIndex(next);
      applyScene(DEMO_SCRIPT[next]);
    }
  }

  function handlePrev() {
    if (sceneIndex > 0) {
      const prev = sceneIndex - 1;
      setSceneIndex(prev);
      applyScene(DEMO_SCRIPT[prev]);
    }
  }

  return (
    <NarratorBox
      step={DEMO_SCRIPT[sceneIndex]}
      sceneIndex={sceneIndex}
      total={DEMO_SCRIPT.length}
      onNext={handleNext}
      onPrev={handlePrev}
      onClose={onClose}
      isTransitioning={isTransitioning}
    />
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { analyzeWeakness } from "./weaknessApi";

// ─── DEMO SCRIPT — tasks pre-scripted, code typed live ───────────────────────
const DEMO_SCRIPT = [
  {
    scene: 1,
    label: "📘 Beginner — loops task",
    narrator: "Beginner task from structuredTasks. Type the CORRECT answer — hint panel will show ✅ correct live. BKT mastery increases on correct solve.",
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    source: "structured_tasks",
    weakness: null,
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    bkt: 67,
    starterCode: "# Type your solution here\n",
  },
  {
    scene: 2,
    label: "❌ Beginner — logic_error detection",
    narrator: "Wrong answer pre-loaded. Watch hint panel detect logic_error. Edit the range to fix it and see ✅ appear automatically.",
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    source: "structured_tasks",
    weakness: "logic_error",
    task: "Print even numbers from 2 to 8 using a for loop.",
    expectedOutput: "2\n4\n6\n8",
    bkt: 54,
    starterCode: "for i in range(1, 9):\n    print(i)\n",
  },
  {
    scene: 3,
    label: "⚠️ Beginner — syntax_error detection",
    narrator: "Code has a missing closing bracket. AST parser detects SyntaxError instantly. Fix it (add the closing bracket) to clear the error.",
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "variables",
    source: "structured_tasks",
    weakness: "syntax_error",
    task: "Create a variable x = 7 and print it.",
    expectedOutput: "7",
    bkt: 50,
    starterCode: "x = 7\nprint(x\n",
  },
  {
    scene: 4,
    label: "🎯 Weakness-Based Task — loops remediation",
    narrator: "Previous logic_error triggered a targeted loops task from structuredTasks. weakness parameter drives task selection. Type the correct answer.",
    skillLevel: "Beginner",
    learningMode: "level_up",
    concept: "loops",
    source: "structured_tasks",
    weakness: "logic_error",
    task: "Print numbers from 1 to 5 using a for loop.",
    expectedOutput: "1\n2\n3\n4\n5",
    bkt: 71,
    starterCode: "# Weakness remediation task\n",
  },
  {
    scene: 5,
    label: "🚀 LEVEL UP — Beginner → Intermediate",
    narrator: "All 5 level-up criteria met: BKT ≥ 85%, tasks ≥ 10, accuracy ≥ 75%, time ≤ 120s, clean streak ≥ 5. MongoDB updated: skillLevel = Intermediate.",
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "loops",
    source: "structured_tasks",
    weakness: null,
    task: "🎉 LEVEL UP — You are now Intermediate!\n\n✅ BKT Mastery:   91%  (target ≥ 85%)\n✅ Tasks Solved:   12   (target ≥ 10)\n✅ Accuracy:       83%  (target ≥ 75%)\n✅ Avg Solve Time: 98s  (target ≤ 120s)\n✅ Clean Streak:   5    (target ≥ 5)",
    expectedOutput: "",
    bkt: 91,
    starterCode: "# MongoDB updated: skillLevel = 'Intermediate'\n# Bloom XP bonus: +20 XP for level up\n# Next tasks will be Intermediate difficulty.\n",
  },
  {
    scene: 6,
    label: "📗 Intermediate — missing_base_case",
    narrator: "Recursion task. Code is missing the base case — ML model detects missing_base_case. Add 'if n == 0: return 1' to fix it and see ✅.",
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "recursion",
    source: "structured_tasks",
    weakness: "missing_base_case",
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    bkt: 62,
    starterCode: "def factorial(n):\n    return n * factorial(n - 1)\n\nprint(factorial(5))\n",
  },
  {
    scene: 7,
    label: "📗 Intermediate — Correct Recursion",
    narrator: "Base case added — now the correct solution. Hint panel shows ✅ correct. Per-concept BKT mastery for 'recursion' increases in MongoDB.",
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "recursion",
    source: "structured_tasks",
    weakness: null,
    task: "Write a function factorial(n) that returns n! recursively. Print factorial(5).",
    expectedOutput: "120",
    bkt: 78,
    starterCode: "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))\n",
  },
  {
    scene: 8,
    label: "⚡ ZPD Boost — Fast Learner Elevated",
    narrator: "3 consecutive fast solves (avg 22s, threshold 60s). ZPD Boost triggers — Vygotsky's Zone of Proximal Development. Next tasks → Advanced level.",
    skillLevel: "Intermediate",
    learningMode: "level_up",
    concept: "algorithm",
    source: "structured_tasks",
    weakness: null,
    task: "⚡ ZPD Boost Activated!\n\n3 consecutive fast solves: avg 22s (threshold: 60s)\nClean streak: 3 tasks\n\nzpd_boost: true → saved to MongoDB\nNext task → Advanced level",
    expectedOutput: "",
    bkt: 85,
    starterCode: "# ZPD Boost active\n# System elevating task difficulty\n# Based on Vygotsky Zone of Proximal Development\n",
  },
  {
    scene: 9,
    label: "📕 Advanced — OOP task",
    narrator: "Advanced task — OOP. Student implements Rectangle class. BKT mastery for 'oop' concept tracked separately. Type the solution to show ✅.",
    skillLevel: "Advanced",
    learningMode: "level_up",
    concept: "oop",
    source: "structured_tasks",
    weakness: null,
    task: "Write a class Rectangle with width=4 and height=5. Print its area.",
    expectedOutput: "20",
    bkt: 82,
    starterCode: "# Advanced OOP task\n",
  },
  {
    scene: 10,
    label: "🧠 Concept Tutor — recursion",
    narrator: "Concept Tutor mode. Student picks 'recursion' — system generates 5 tasks easy→hard. improve_concept mode, per-concept BKT tracked in MongoDB.",
    skillLevel: "Advanced",
    learningMode: "improve_concept",
    concept: "recursion",
    source: "structured_tasks_concept",
    weakness: null,
    task: "Write a recursive function countdown(n) that prints from n down to 1. Call countdown(5).",
    expectedOutput: "5\n4\n3\n2\n1",
    bkt: 78,
    starterCode: "# Concept Tutor: recursion — Task 1 of 5 (easy)\n",
  },
];

// ─── SCENE BADGE ──────────────────────────────────────────────────────────────
function SceneBadge({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 999,
      background: bg, color, fontSize: 12, fontWeight: 700,
      border: `1px solid ${color}44`, marginRight: 6
    }}>{label}</span>
  );
}

// ─── NARRATOR BAR ─────────────────────────────────────────────────────────────
function NarratorBar({ scene, sceneIndex, total, onNext, onPrev, onClose }) {
  const skillColors = {
    Beginner:     { text: "#4ade80", bg: "#14532d33" },
    Intermediate: { text: "#facc15", bg: "#71390f33" },
    Advanced:     { text: "#f87171", bg: "#7f1d1d33" },
  };
  const sc = skillColors[scene.skillLevel] || skillColors.Beginner;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#020617f0", backdropFilter: "blur(12px)",
      borderTop: "1px solid #1e3a5f",
      zIndex: 9999, fontFamily: "inherit",
      boxShadow: "0 -4px 30px #000a"
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "#0f172a" }}>
        <div style={{
          width: `${((sceneIndex + 1) / total) * 100}%`, height: "100%",
          background: "linear-gradient(90deg, #2563eb, #7c3aed)",
          transition: "width 0.4s ease"
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 24px" }}>
        {/* Badges + dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{
            background: "#1e3a5f", color: "#60a5fa",
            padding: "2px 10px", borderRadius: 999,
            fontSize: 11, fontWeight: 800, letterSpacing: 1
          }}>🎬 DEMO {sceneIndex + 1}/{total}</span>

          <SceneBadge label={scene.skillLevel} color={sc.text} bg={sc.bg} />
          {scene.concept && <SceneBadge label={`concept: ${scene.concept}`} color="#a78bfa" bg="#4c1d9522" />}
          {scene.source  && <SceneBadge label={`source: ${scene.source}`}  color="#2dd4bf" bg="#0f766e22" />}
          {scene.weakness && <SceneBadge label={`weakness: ${scene.weakness}`} color="#f87171" bg="#7f1d1d22" />}
          <span style={{ color: "#475569", fontSize: 11 }}>[{scene.label}]</span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
            {DEMO_SCRIPT.map((_, i) => (
              <div key={i} style={{
                width: i === sceneIndex ? 18 : 7, height: 7, borderRadius: 999,
                background: i === sceneIndex ? "#3b82f6" : i < sceneIndex ? "#1e40af" : "#1e293b",
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>

          <button onClick={onClose} style={{
            background: "transparent", border: "none",
            color: "#475569", cursor: "pointer", fontSize: 18,
            padding: "0 4px", marginLeft: 8
          }}>✕</button>
        </div>

        {/* Narrator + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onPrev} disabled={sceneIndex === 0} style={{
            background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
            color: sceneIndex === 0 ? "#334155" : "#94a3b8",
            cursor: sceneIndex === 0 ? "not-allowed" : "pointer",
            padding: "7px 16px", fontSize: 13, fontFamily: "inherit", flexShrink: 0
          }}>← Prev</button>

          <p style={{ flex: 1, margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>
            {scene.narrator}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{
              color: scene.bkt >= 80 ? "#4ade80" : scene.bkt >= 60 ? "#facc15" : "#f87171",
              fontWeight: 800, fontSize: 15
            }}>BKT {scene.bkt}%</span>

            <button onClick={onNext} disabled={sceneIndex === total - 1} style={{
              background: sceneIndex === total - 1
                ? "#1e293b" : "linear-gradient(90deg, #2563eb, #7c3aed)",
              border: "none", borderRadius: 8,
              color: sceneIndex === total - 1 ? "#334155" : "#fff",
              cursor: sceneIndex === total - 1 ? "not-allowed" : "pointer",
              padding: "8px 20px", fontSize: 13, fontFamily: "inherit", fontWeight: 700
            }}>{sceneIndex === total - 1 ? "Done ✓" : "Next Scene →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DEMO PAGE ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // ── State mirrors TaskEditor exactly ──────────────────────────────────
  const [generatedTask, setGeneratedTask]   = useState("");
  const [skillLevel, setSkillLevel]         = useState("Beginner");
  const [learningMode, setLearningMode]     = useState("level_up");
  const [currentConcept, setCurrentConcept] = useState(null);
  const [expectedOutput, setExpectedOutput] = useState("");
  const [code, setCode]                     = useState("# Type your solution here\n");

  // ── Live hint state ────────────────────────────────────────────────────
  const [hints, setHints]               = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [isCorrect, setIsCorrect]       = useState(false);
  const [lastTypedAt, setLastTypedAt]   = useState(Date.now());

  // ── Refs ───────────────────────────────────────────────────────────────
  const isCorrectRef      = useRef(false);
  const skillLevelRef     = useRef("Beginner");
  const expectedOutputRef = useRef("");
  const sceneRef          = useRef(DEMO_SCRIPT[0]);
  const generatedTaskRef  = useRef("");

  // ── Apply scene ────────────────────────────────────────────────────────
  function applyScene(idx) {
    setTransitioning(true);
    setTimeout(() => {
      const s = DEMO_SCRIPT[idx];
      sceneRef.current        = s;
      generatedTaskRef.current = s.task;
      expectedOutputRef.current = s.expectedOutput;
      skillLevelRef.current   = s.skillLevel;

      setGeneratedTask(s.task);
      setSkillLevel(s.skillLevel);
      setLearningMode(s.learningMode);
      setCurrentConcept(s.concept);
      setExpectedOutput(s.expectedOutput);
      setCode(s.starterCode);
      setHints([]);
      setIsCorrect(false);
      isCorrectRef.current = false;
      setTransitioning(false);
    }, 250);
  }

  useEffect(() => { applyScene(0); }, []);

  // ── Live weakness detection — same logic as TaskEditor ────────────────
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
          code,
          skillLevelRef.current,
          idleSeconds,
          expectedOutputRef.current,
          "",
          requiresFunction
        );

        const correct = result.hints?.some(h => h.includes("correct"));

        if (correct) {
          setIsCorrect(true);
          isCorrectRef.current = true;
          setHints(["✅ Your answer is correct!"]);
        } else {
          if (result.primary) {
            try {
              const tutor = await fetch("http://localhost:5000/api/tutor/hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  weakness: result.primary,
                  skill: skillLevelRef.current,
                  code,
                  task: generatedTaskRef.current,
                  concept: sceneRef.current.concept,
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

  // ── Navigation ─────────────────────────────────────────────────────────
  function handleNext() {
    if (sceneIndex < DEMO_SCRIPT.length - 1) {
      const next = sceneIndex + 1;
      setSceneIndex(next);
      applyScene(next);
    }
  }
  function handlePrev() {
    if (sceneIndex > 0) {
      const prev = sceneIndex - 1;
      setSceneIndex(prev);
      applyScene(prev);
    }
  }

  const scene = DEMO_SCRIPT[sceneIndex];

  return (
    <>
      <div
        className="task-container"
        style={{
          paddingBottom: 130,
          opacity: transitioning ? 0.3 : 1,
          transition: "opacity 0.25s ease"
        }}
      >
        <h1 className="title">🧠 Adaptive Coding Task</h1>

        {/* ── Skill row — identical to TaskEditor ── */}
        <p className="skill">
          Predicted Skill:
          <span className="skill-pill">{skillLevel}</span>

          <button className="quiz-again-btn" onClick={() => navigate("/exercise")} type="button">
            ← Back to Editor
          </button>

          <button type="button" className="quiz-again-btn"
            style={{
              background: learningMode === "level_up"
                ? "linear-gradient(90deg, #2563eb, #7c3aed)" : undefined,
              color: learningMode === "level_up" ? "#fff" : undefined,
            }}
          >🚀 Level Up</button>

          <button type="button" className="quiz-again-btn">🧠 Concept Tutor</button>

          <button type="button" className="quiz-again-btn" style={{
            background: "rgba(30, 58, 95, 0.9)",
            border: "1px solid #3b82f644",
            color: "#60a5fa", fontWeight: "700"
          }}>🎬 Demo (Active)</button>
        </p>

        {/* Mode line */}
        <div style={{ textAlign: "center", marginBottom: "12px", color: "#a5b4fc" }}>
          <small>
            Current Mode:{" "}
            <strong>{learningMode === "level_up" ? "Level Up" : "Improve Weak Concept"}</strong>
            {currentConcept ? ` • Concept: ${currentConcept}` : ""}
          </small>
        </div>

        {/* Task box */}
        <div className="task-box">
          <h3>Your Task</h3>
          <p className="task-text" style={{ whiteSpace: "pre-line" }}>{generatedTask}</p>
        </div>

        <h3 className="solution-title">Your Solution</h3>

        {/* ── Editor + Hint panel — identical layout ── */}
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
                  isCorrectRef.current = false;
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

              {/* Next Scene button appears when correct */}
              {isCorrect && (
                <button
                  onClick={handleNext}
                  disabled={sceneIndex === DEMO_SCRIPT.length - 1}
                  type="button"
                  style={{
                    marginTop: "12px", width: "100%", padding: "10px",
                    background: "linear-gradient(90deg, #16a34a, #22c55e)",
                    color: "#fff", border: "none", borderRadius: "8px",
                    fontSize: "15px", fontWeight: "bold", cursor: "pointer"
                  }}
                >Next Scene →</button>
              )}

              {/* BKT bar */}
              <div style={{
                marginTop: 16, padding: "10px 12px",
                background: "#0f172a", borderRadius: 8,
                border: "1px solid #1e293b"
              }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
                  BKT MASTERY
                </div>
                <div style={{ height: 8, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    width: `${scene.bkt}%`, height: "100%", borderRadius: 999,
                    background: scene.bkt >= 80 ? "#4ade80" : scene.bkt >= 60 ? "#facc15" : "#f87171",
                    transition: "width 0.8s ease"
                  }} />
                </div>
                <div style={{
                  color: scene.bkt >= 80 ? "#4ade80" : scene.bkt >= 60 ? "#facc15" : "#f87171",
                  fontWeight: 800, fontSize: 18, marginTop: 6
                }}>{scene.bkt}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <div className="editor-actions">
            <button className="submit-btn" type="button" style={{ transform: "none" }}>
              Submit Code
            </button>
            <button className="submit-btn" type="button" onClick={handleNext}
              style={{ background: "linear-gradient(90deg, #0ea5e9, #6366f1)", transform: "none" }}
            >🔁 Next Scene</button>
          </div>
        </div>
      </div>

      {/* ── Narrator bar ── */}
      <NarratorBar
        scene={scene}
        sceneIndex={sceneIndex}
        total={DEMO_SCRIPT.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={() => navigate("/task-editor")}
      />
    </>
  );
}

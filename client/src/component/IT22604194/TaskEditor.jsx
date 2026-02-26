import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { useState, useEffect, useRef } from "react";
import { analyzeWeakness } from "./weaknessApi";

export default function TaskEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const [generatedTask, setGeneratedTask] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [code, setCode] = useState("# Write your Python solution here\n");

  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [lastTypedAt, setLastTypedAt] = useState(Date.now());
  const [expectedOutput, setExpectedOutput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [primaryWeakness, setPrimaryWeakness] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const userId = localStorage.getItem("userId");

  // Refs to always have latest values in async callbacks
  const isCorrectRef = useRef(false);
  const primaryWeaknessRef = useRef(null);
  const skillLevelRef = useRef("Beginner");
  const generatedTaskRef = useRef("");

  // Keep refs in sync
  useEffect(() => { isCorrectRef.current = isCorrect; }, [isCorrect]);
  useEffect(() => { primaryWeaknessRef.current = primaryWeakness; }, [primaryWeakness]);
  useEffect(() => { skillLevelRef.current = skillLevel; }, [skillLevel]);
  useEffect(() => { generatedTaskRef.current = generatedTask; }, [generatedTask]);

  // Load task from navigation state or sessionStorage
  useEffect(() => {
    if (location.state?.generatedTask) {
      setGeneratedTask(location.state.generatedTask);
      if (location.state?.skillLevel) setSkillLevel(location.state.skillLevel);
      if (location.state?.expected_output) setExpectedOutput(location.state.expected_output);
      if (location.state?.test_input) setTestInput(location.state.test_input);

      sessionStorage.setItem("generatedTask", location.state.generatedTask);
      sessionStorage.setItem("expectedOutput", location.state.expected_output);
      sessionStorage.setItem("testInput", location.state.test_input);
    } else {
      setGeneratedTask(sessionStorage.getItem("generatedTask") || "");
      setExpectedOutput(sessionStorage.getItem("expectedOutput") || "");
      setTestInput(sessionStorage.getItem("testInput") || "");
    }
  }, [location.state]);

  const handleAnotherTask = async () => {
    try {
      const skillMap = { Beginner: 1, Intermediate: 3, Advanced: 5 };
      const numericSkill = skillMap[skillLevelRef.current];

      const response = await fetch("http://localhost:5000/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_skill: numericSkill,
          weakness: primaryWeaknessRef.current
        }),
      });

      const data = await response.json();

      setGeneratedTask(data.generated_task);
      setExpectedOutput(data.expected_output);
      setTestInput(data.test_input);

      sessionStorage.setItem("generatedTask", data.generated_task);
      sessionStorage.setItem("expectedOutput", data.expected_output);
      sessionStorage.setItem("testInput", data.test_input);

      // Reset everything for new task
      setCode("# Write your Python solution here\n");
      setHints([]);
      setIsCorrect(false);
      setPrimaryWeakness(null);
      isCorrectRef.current = false;

    } catch (err) {
      console.error("Failed to fetch another task:", err);
      alert("Could not generate a new task");
    }
  };

  const handleTakeQuizAgain = () => {
    sessionStorage.removeItem("generatedTask");
    navigate("/assessment");
  };

  const saveProgress = async (solved) => {
  if (!userId) return;
  try {
    const res = await fetch("http://localhost:5000/api/progress/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        task: generatedTaskRef.current,
        weakness: primaryWeaknessRef.current,
        skillLevel: skillLevelRef.current,
        solved
      })
    });
    const data = await res.json();

    // Auto update skill level if leveled up
    if (data.skillLevel && data.skillLevel !== skillLevelRef.current) {
      setSkillLevel(data.skillLevel);
      alert(`🎉 Level Up! You are now ${data.skillLevel}!`);
    }
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
};

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8002/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_text: code,
          time_since_last_keystroke_s: 0,
          skill_level: skillLevel
        })
      });
      const data = await res.json();
      alert(data[0] || data[1]);
    } catch (err) {
      alert("Execution failed");
    }
  };

  // Live weakness detection (debounced, runs on typing)
  useEffect(() => {
    if (!code || code.trim().length < 3) {
      setHints([]);
      return;
    }

    // Don't re-analyze if already marked correct
    if (isCorrectRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setLoadingHints(true);
        const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);

        const result = await analyzeWeakness(
          code, skillLevel, idleSeconds, expectedOutput, testInput
        );

        const correct = result.hints?.some(h => h.includes("correct"));

        if (correct) {
          setIsCorrect(true);
          isCorrectRef.current = true;
          setHints(["✅ Your answer is correct!"]);
          setPrimaryWeakness(result.primary);
          primaryWeaknessRef.current = result.primary;
          saveProgress(true);
        } else {
          setHints(result.hints || []);
          setPrimaryWeakness(result.primary);
          primaryWeaknessRef.current = result.primary;

          // Gemini tutor hint
          if (result.primary) {
            try {
              const tutor = await fetch("http://localhost:5000/api/tutor/hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  weakness: result.primary,
                  skill: skillLevelRef.current,
                  code,
                  task: generatedTaskRef.current
                })
              });
              const tutorData = await tutor.json();
              setHints([tutorData.hint]);
            } catch (e) {
              // Gemini failed, keep ML hints
            }
          }
        }
      } catch (err) {
        console.error("Weakness analysis failed:", err);
      } finally {
        setLoadingHints(false);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [code, skillLevel, expectedOutput, testInput]);

  // Idle watcher - only runs if NOT correct
  useEffect(() => {
    const interval = setInterval(async () => {
      // Stop if already correct
      if (isCorrectRef.current) return;

      const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);

      if (idleSeconds >= 6 && code.trim().length >= 3) {
        try {
          const result = await analyzeWeakness(
            code, skillLevel, idleSeconds, expectedOutput, testInput
          );

          const correct = result.hints?.some(h => h.includes("correct"));

          if (correct) {
            setIsCorrect(true);
            isCorrectRef.current = true;
            setHints(["✅ Your answer is correct!"]);
            setPrimaryWeakness(result.primary);
            primaryWeaknessRef.current = result.primary;
          } else {
            setHints(result.hints || []);
          }
        } catch (err) {
          console.error("Idle weakness check failed:", err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTypedAt, code, skillLevel, expectedOutput, testInput]);

  // Auto load next task when correct - fires ONCE
  useEffect(() => {
    if (!isCorrect) return;

    const timer = setTimeout(() => {
      handleAnotherTask();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isCorrect]);

  return (
    <div className="task-container">
      <h1 className="title">🧠Adaptive Coding Task</h1>

      <p className="skill">
        Predicted Skill:
        <span className="skill-pill">{skillLevel}</span>
        <button className="quiz-again-btn" onClick={handleTakeQuizAgain} type="button">
          Take Quiz Again
        </button>
        <button
        className="quiz-again-btn"
        onClick={() => navigate("/profile")}
        type="button">
        📊 My Profile
        </button>
      </p>

      <div className="task-box">
        <h3>Your Task</h3>
        <p className="task-text">{generatedTask}</p>
      </div>

      <h3 className="solution-title">Your Solution</h3>

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
              // If user edits after correct, reset so they can retry
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

        <div className="hint-panel">
          <h4>Live Hints</h4>

          {loadingHints && <p className="hint-loading">Analyzing…</p>}

          {!loadingHints && hints.length === 0 && (
            <p className="hint-ok">✔ No issues detected</p>
          )}

          {!loadingHints &&
            hints.map((hint, index) => (
              <p key={index} className={hint.includes("correct") ? "hint-correct" : "hint-item"}>
                {hint.includes("correct") ? "" : "⚠ "}{hint}
              </p>
            ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <div className="editor-actions">
          <button className="submit-btn" onClick={handleSubmit}>
            Submit Code
          </button>
          <button
            className="submit-btn"
            onClick={handleAnotherTask}
            type="button"
            style={{ background: "linear-gradient(90deg, #0ea5e9, #6366f1)" }}
          >
            🔁 Take New Task
          </button>
        </div>
      </div>
    </div>
  );
}
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { useState, useEffect, useRef } from "react";
import { analyzeWeakness } from "./weaknessApi";
//import DemoRunner from "./DemoRunner";

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

  //const [showDemo, setShowDemo] = useState(false);

  const [learningMode, setLearningMode] = useState(
    sessionStorage.getItem("learningMode") || "level_up"
  );
  const [currentConcept, setCurrentConcept] = useState(
    sessionStorage.getItem("currentConcept") || null
  );

  const userId = localStorage.getItem("userId");
  const [currentTaskLevel, setCurrentTaskLevel] = useState("Beginner");
  const currentTaskLevelRef = useRef("Beginner");

  // ── Time tracking ──────────────────────────────────────────────────────
  const taskStartTimeRef = useRef(Date.now());

  // ── Refs ───────────────────────────────────────────────────────────────
  const isCorrectRef = useRef(false);
  const primaryWeaknessRef = useRef(null);
  const skillLevelRef = useRef("Beginner");
  const generatedTaskRef = useRef("");
  const progressSavedRef = useRef(false);
  const lastTaskRef = useRef("");
  const currentConceptRef = useRef(null);
  const learningModeRef = useRef(sessionStorage.getItem("learningMode") || "level_up");
  const alreadyConsumedState =
    sessionStorage.getItem("locationStateConsumed") === "true";

  const requiresFunction =
    generatedTask.toLowerCase().includes("function") ||
    generatedTask.toLowerCase().includes("def ");

  // ── Infer concept from task text ───────────────────────────────────────
  const inferConceptFromTask = (taskText = "") => {
    const text = taskText.toLowerCase();

    if (text.includes("recursion") || text.includes("recursive")) return "recursion";
    if (text.includes("class") || text.includes("object") || text.includes("inherit")) return "oop";
    if (text.includes("dictionary")) return "dictionaries";
    if (text.includes("tuple")) return "tuples";
    if (text.includes("list")) return "lists";
    if (text.includes("string")) return "strings";
    if (text.includes("loop") || text.includes("for ") || text.includes("while ")) return "loops";
    if (text.includes("function") || text.includes("def ")) return "functions";
    if (text.includes("print") || text.includes("output") || text.includes("display")) return "print";
    if (
      text.includes("if ") ||
      text.includes("if/else") ||
      text.includes("else") ||
      text.includes("condition")
    ) {
      return "conditionals";
    }
    if (
      text.includes("sum") ||
      text.includes("multiply") ||
      text.includes("divide") ||
      text.includes("subtract") ||
      text.includes("factorial") ||
      text.includes("power") ||
      text.includes("math")
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
    if (text.includes("try") || text.includes("except") || text.includes("finally")) return "exception_handling";
    if (text.includes("yield") || text.includes("generator")) return "generators";
    if (text.includes("decorator") || text.includes("@")) return "decorators";
    if (text.includes("lambda")) return "lambda";
    if (text.includes("inherits") || text.includes("inherit") || text.includes("override")) return "inheritance";
    if (text.includes("set") && (text.includes("union") || text.includes("intersection"))) return "sets";
    if (text.includes("tuple") || text.includes("unpack")) return "tuples";
    if (text.includes("dictionary") || text.includes("dict") || text.includes("key") && text.includes("value")) return "dictionaries";
    if (text.includes("filter(") || text.includes("map(") || text.includes("reduce(")) return "functional";


    return "general";
  };

  // Keep refs in sync
  useEffect(() => {
    isCorrectRef.current = isCorrect;
  }, [isCorrect]);

  useEffect(() => {
    primaryWeaknessRef.current = primaryWeakness;
  }, [primaryWeakness]);

  useEffect(() => {
    skillLevelRef.current = skillLevel;
  }, [skillLevel]);

  useEffect(() => {
    generatedTaskRef.current = generatedTask;
  }, [generatedTask]);

  useEffect(() => {
    currentConceptRef.current = currentConcept;
  }, [currentConcept]);

  useEffect(() => {
    learningModeRef.current = learningMode;
  }, [learningMode]);

  // ── Sync real skill level from MongoDB ────────────────────────────────
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;

    fetch(`http://localhost:5000/api/progress/${uid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.skillLevel) {
          setSkillLevel(data.skillLevel);
          skillLevelRef.current = data.skillLevel;
          localStorage.setItem("userSkill", data.skillLevel);

          const savedTaskLevel = sessionStorage.getItem("taskSkillLevel");
          if (savedTaskLevel && savedTaskLevel !== data.skillLevel) {
            console.log(
              `Level mismatch: clearing stale ${savedTaskLevel} task for ${data.skillLevel} student`
            );
            sessionStorage.removeItem("generatedTask");
            sessionStorage.removeItem("expectedOutput");
            sessionStorage.removeItem("testInput");
            sessionStorage.removeItem("currentCode");
            sessionStorage.removeItem("taskSkillLevel");
            sessionStorage.removeItem("locationStateConsumed");
            sessionStorage.removeItem("currentConcept");
          }
        }

        if (data.preferredLearningMode) {
          setLearningMode(data.preferredLearningMode);
          learningModeRef.current = data.preferredLearningMode;
          sessionStorage.setItem("learningMode", data.preferredLearningMode);
        }

        if (data.targetConcept) {
          setCurrentConcept(data.targetConcept);
          currentConceptRef.current = data.targetConcept;
          sessionStorage.setItem("currentConcept", data.targetConcept);
        }
      })
      .catch(() => {});
  }, []);

  // ── Load task ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.generatedTask && !alreadyConsumedState) {
      sessionStorage.setItem("locationStateConsumed", "true");

      setGeneratedTask(location.state.generatedTask);
      if (location.state?.expected_output) setExpectedOutput(location.state.expected_output);
      if (location.state?.test_input) setTestInput(location.state.test_input);

      if (location.state?.skillLevel && !localStorage.getItem("userSkill")) {
        setSkillLevel(location.state.skillLevel);
      }

      const concept =
        location.state?.concept || inferConceptFromTask(location.state.generatedTask);

      setCurrentConcept(concept);
      currentConceptRef.current = concept;

      sessionStorage.setItem("generatedTask", location.state.generatedTask);
      sessionStorage.setItem("expectedOutput", location.state.expected_output || "");
      sessionStorage.setItem("testInput", location.state.test_input || "");
      sessionStorage.setItem(
        "taskSkillLevel",
        localStorage.getItem("userSkill") || location.state.skillLevel || "Beginner"
      );
      sessionStorage.setItem("currentConcept", concept);

      lastTaskRef.current = location.state.generatedTask;
      taskStartTimeRef.current = Date.now();
    } else {
      const savedTask = sessionStorage.getItem("generatedTask");
      const savedCode = sessionStorage.getItem("currentCode");
      const savedConcept = sessionStorage.getItem("currentConcept");

      if (savedTask) {
        setGeneratedTask(savedTask);
        setExpectedOutput(sessionStorage.getItem("expectedOutput") || "");
        setTestInput(sessionStorage.getItem("testInput") || "");
        if (savedCode) setCode(savedCode);
        if (savedConcept) {
          setCurrentConcept(savedConcept);
          currentConceptRef.current = savedConcept;
        } else {
          const inferred = inferConceptFromTask(savedTask);
          setCurrentConcept(inferred);
          currentConceptRef.current = inferred;
          sessionStorage.setItem("currentConcept", inferred);
        }
        lastTaskRef.current = savedTask;
      } else {
        const level = localStorage.getItem("userSkill") || "Beginner";
        const skillMap = { Beginner: 1, Intermediate: 3, Advanced: 5 };
        const numericSkill = skillMap[level] || 1;

        fetch("http://localhost:5000/api/tasks/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_skill: numericSkill,
            weakness: null,
            userId: localStorage.getItem("userId"),
            learning_mode: learningModeRef.current,
            concept:
              learningModeRef.current === "improve_concept"
              ? currentConceptRef.current
              : null
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            setGeneratedTask(data.generated_task);
            setExpectedOutput(data.expected_output);
            setTestInput(data.test_input);

            const concept = data.concept || inferConceptFromTask(data.generated_task);
            setCurrentConcept(concept);
            currentConceptRef.current = concept;

            sessionStorage.setItem("generatedTask", data.generated_task);
            sessionStorage.setItem("expectedOutput", data.expected_output);
            sessionStorage.setItem("testInput", data.test_input);
            sessionStorage.setItem("taskSkillLevel", level);
            // Save function call for weakness detection
            if (data.function_call) {
            sessionStorage.setItem("functionCall", data.function_call);
            } else {
            sessionStorage.removeItem("functionCall");
            }
            sessionStorage.setItem("currentConcept", concept);

            lastTaskRef.current = data.generated_task;
            taskStartTimeRef.current = Date.now();
          })
          .catch(() => {});
      }
    }
  }, [location.state]);

  // ── Generate next task ─────────────────────────────────────────────────
  const handleAnotherTask = async () => {
    try {
      const skillMap = { Beginner: 1, Intermediate: 3, Advanced: 5 };
      const numericSkill = skillMap[skillLevelRef.current];

      const fetchTask = async () => {
        const res = await fetch("http://localhost:5000/api/tasks/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
           student_skill: numericSkill,
           weakness: primaryWeaknessRef.current,
           userId: localStorage.getItem("userId"),
           exclude_task: lastTaskRef.current,
           learning_mode: learningModeRef.current,
           concept:
             learningModeRef.current === "improve_concept"
             ? currentConceptRef.current
             : null
           }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return await res.json();
      };

      let data = await fetchTask();

      if (data.generated_task === lastTaskRef.current) {
        console.log("Duplicate task detected — retrying...");
        const retry = await fetchTask();
        if (retry.generated_task !== lastTaskRef.current) data = retry;
      }

      setCurrentTaskLevel(data.task_level || skillLevelRef.current);
      currentTaskLevelRef.current = data.task_level || skillLevelRef.current;

      lastTaskRef.current = data.generated_task;

      setGeneratedTask(data.generated_task);
      setExpectedOutput(data.expected_output);
      setTestInput(data.test_input);

      const concept = data.concept || inferConceptFromTask(data.generated_task);
      setCurrentConcept(concept);
      currentConceptRef.current = concept;

      sessionStorage.setItem("generatedTask", data.generated_task);
      sessionStorage.setItem("expectedOutput", data.expected_output);
      sessionStorage.setItem("testInput", data.test_input);
      //Save function call so weaknessApi can append it to student code
      if (data.function_call) {
      sessionStorage.setItem("functionCall", data.function_call);
      } else {
      sessionStorage.removeItem("functionCall");
      }
      sessionStorage.setItem("taskSkillLevel", skillLevelRef.current);
      sessionStorage.setItem("currentConcept", concept);
      sessionStorage.removeItem("currentCode");

      setCode("# Write your Python solution here\n");
      setHints([]);
      setIsCorrect(false);
      setPrimaryWeakness(null);
      isCorrectRef.current = false;
      progressSavedRef.current = false;
      taskStartTimeRef.current = Date.now();
    } catch (err) {
      console.error("Failed to fetch another task:", err);
      alert(`Could not generate a new task: ${err.message}`);
    }
  };

  const handleTakeQuizAgain = () => {
    sessionStorage.clear();
    localStorage.removeItem("userSkill");
    navigate("/assessment");
  };

  // ── Save progress ──────────────────────────────────────────────────────
  const saveProgress = async (solved) => {
    if (!userId) return;
    if (progressSavedRef.current) {
      console.log("Progress already saved — skipping.");
      return;
    }
    progressSavedRef.current = true;

    try {
      const timeTakenSeconds = Math.floor(
        (Date.now() - taskStartTimeRef.current) / 1000
      );

      const res = await fetch("http://localhost:5000/api/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          task: generatedTaskRef.current,
          weakness: primaryWeaknessRef.current,
          concept: currentConceptRef.current,
          learningMode: learningModeRef.current,
          skillLevel: skillLevelRef.current,
          solved,
          timeTakenSeconds,
          taskLevel: currentTaskLevelRef.current,
          codeSubmission: code
        }),
      });

      const data = await res.json();
      console.log("Progress saved:", data);

      if (data.leveledUp) {
        setSkillLevel(data.skillLevel);
        skillLevelRef.current = data.skillLevel;
        localStorage.setItem("userSkill", data.skillLevel);

        sessionStorage.removeItem("generatedTask");
        sessionStorage.removeItem("currentCode");
        sessionStorage.removeItem("taskSkillLevel");
        sessionStorage.removeItem("currentConcept");

        alert(
          `🎉 Level Up! You are now ${data.skillLevel}!\n\nYou solved ${data.totalSolved} tasks with great performance!`
        );
      }

      if (data.levelUpProgress && !data.levelUpProgress.atMaxLevel) {
        console.log(`Progress to ${data.levelUpProgress.nextLevel}:`, {
          bktMastery: `${(data.levelUpProgress.bktMastery * 100).toFixed(1)}%`,
          avgTime: `${data.levelUpProgress.avgSolveTime}s`,
          cleanSolves: data.levelUpProgress.consecutiveCleanSolves,
          accuracy: `${(data.levelUpProgress.accuracy * 100).toFixed(0)}%`,
        });
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  // ── Run code ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8002/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_text: code,
          time_since_last_keystroke_s: 0,
          skill_level: skillLevel,
        }),
      });
      const data = await res.json();
      alert(data[0] || data[1]);
    } catch (err) {
      alert("Execution failed");
    }
  };

  // ── Live weakness detection ────────────────────────────────────────────
  useEffect(() => {
    if (!code || code.trim().length < 3) {
      setHints([]);
      return;
    }
    if (isCorrectRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setLoadingHints(true);
        const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);
        const result = await analyzeWeakness(
          code,
          skillLevel,
          idleSeconds,
          expectedOutput,
          testInput,
          requiresFunction
        );
        const correct = result.hints?.some((h) => h.includes("correct"));

        if (correct) {
          setIsCorrect(true);
          isCorrectRef.current = true;
          setHints([" Your answer is correct!"]);
          setPrimaryWeakness(result.primary);
          primaryWeaknessRef.current = result.primary;
          saveProgress(true);
        } else {
          setHints(result.hints || []);
          setPrimaryWeakness(result.primary);
          primaryWeaknessRef.current = result.primary;

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
                  concept: currentConceptRef.current,
                  learningMode: learningModeRef.current
                }),
              });
              const tutorData = await tutor.json();
              setHints([tutorData.hint]);
            } catch (e) {}
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

  // ── Idle watcher ───────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isCorrectRef.current) return;
      const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);

      if (idleSeconds >= 6 && code.trim().length >= 3) {
        try {
          const result = await analyzeWeakness(
            code,
            skillLevel,
            idleSeconds,
            expectedOutput,
            testInput,
            requiresFunction
          );
          const correct = result.hints?.some((h) => h.includes("correct"));

          if (correct) {
            setIsCorrect(true);
            isCorrectRef.current = true;
            setHints([" Your answer is correct!"]);
            setPrimaryWeakness(result.primary);
            primaryWeaknessRef.current = result.primary;
            saveProgress(true);
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

  // ── Auto load next task when correct ──────────────────────────────────
  //useEffect(() => {
    //if (!isCorrect) return;
    //const timer = setTimeout(() => {
      //handleAnotherTask();
    //}, 2000);
    //return () => clearTimeout(timer);
  //}, [isCorrect]);

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
          onClick={() => {
            sessionStorage.setItem("generatedTask", generatedTask);
            sessionStorage.setItem("expectedOutput", expectedOutput);
            sessionStorage.setItem("testInput", testInput);
            sessionStorage.setItem("currentCode", code);
            sessionStorage.setItem("learningMode", learningMode);
            sessionStorage.setItem("currentConcept", currentConcept || "");
            navigate("/profile");
          }}
          type="button"
        >
          📊 My Profile
        </button>
        
        <button
          type="button"
          onClick={() => {
            setLearningMode("level_up");
            learningModeRef.current = "level_up";
            sessionStorage.setItem("learningMode", "level_up");
          }}
          className="quiz-again-btn"
          style={{
            background:
              learningMode === "level_up"
                ? "linear-gradient(90deg, #2563eb, #7c3aed)"
                : undefined,
            color: learningMode === "level_up" ? "#fff" : undefined,
          }}
        >
          🚀 Level Up
        </button>

        <button
          type="button"
          onClick={() => {
          sessionStorage.setItem("generatedTask", generatedTask);
          sessionStorage.setItem("expectedOutput", expectedOutput);
          sessionStorage.setItem("testInput", testInput);
          sessionStorage.setItem("currentCode", code);
          navigate("/concept-tutor");
        }}
        className="quiz-again-btn"
        >
        🧠 Concept Tutor
       </button>
       <button
        type="button"
        onClick={() => navigate("/demo")}
        className="quiz-again-btn"
        style={{
         background: "rgba(30, 58, 95, 0.9)",
         border: "1px solid #3b82f644",
         color: "#60a5fa",
         fontWeight: "700"
        }}
        >
      🎬 Demo
      </button>
      
      </p>

      <div style={{ textAlign: "center", marginBottom: "12px", color: "#a5b4fc" }}>
        <small>
          Current Mode:{" "}
          <strong>
            {learningMode === "level_up" ? "Level Up" : "Improve Weak Concept"}
          </strong>
          {currentConcept ? ` • Concept: ${currentConcept}` : ""}
        </small>
      </div>

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
              sessionStorage.setItem("currentCode", value || "");
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

    {!loadingHints &&
      hints.map((hint, index) => (
        <p
          key={index}
          className={hint.includes("correct") ? "hint-correct" : "hint-item"}
        >
          {hint.includes("correct") ? "" : "⚠ "}
          {hint}
        </p>
      ))}

    {/* ✅ Button sits inside hint panel — no overlap */}
    {isCorrect && (
      <button
        onClick={handleAnotherTask}
        type="button"
        style={{
          marginTop: "12px",
          width: "100%",
          padding: "10px",
          background: "linear-gradient(90deg, #16a34a, #22c55e)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
          letterSpacing: "0.5px"
        }}
      >
        Next Task →
      </button>
    )}
  </div>

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
import { useLocation,useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../../styles/TaskEditor.css";
import { useState, useEffect } from "react";
import { analyzeWeakness } from "./weaknessApi";

export default function TaskEditor() {
  const location = useLocation();

  const [generatedTask, setGeneratedTask] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [code, setCode] = useState("# Write your Python solution here\n");

  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [lastTypedAt, setLastTypedAt] = useState(Date.now());
  const navigate = useNavigate();

  
  


  // Load task safely
  //useEffect(() => {
    //if (location.state?.generatedTask) {
      //setGeneratedTask(location.state.generatedTask);
      //setSkillLevel(location.state.skillLevel);
      //sessionStorage.setItem("generatedTask", location.state.generatedTask);
    //} else {
      //const storedTask = sessionStorage.getItem("generatedTask");
      //if (storedTask) setGeneratedTask(storedTask);
    //}
  //}, [location.state]);
  useEffect(() => {
  if (location.state?.generatedTask) {
    if (location.state?.skillLevel) {
    setSkillLevel(location.state.skillLevel); // show predicted skill level
  }
    // Always prefer NEW task from navigation
    setGeneratedTask(location.state.generatedTask);
    sessionStorage.setItem("generatedTask", location.state.generatedTask);
  } else {
    const storedTask = sessionStorage.getItem("generatedTask");
    if (storedTask) {
      setGeneratedTask(storedTask);
    }
  }
}, [location.state]);
const handleAnotherTask = async () => {
  try {
    // map skill string to numeric value
    const skillMap = {
      Beginner: 1,
      Intermediate: 3,
      Advanced: 5,
    };

    const numericSkill = skillMap[skillLevel];

    const response = await fetch("http://localhost:5000/api/tasks/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_skill: numericSkill }),
    });

    const data = await response.json();

    setGeneratedTask(data.generated_task);
    sessionStorage.setItem("generatedTask", data.generated_task);

    // optional: clear editor for new task
    setCode("# Write your Python solution here\n");
    setHints([]);

  } catch (err) {
    console.error("Failed to fetch another task:", err);
    alert("Could not generate a new task");
  }
};
const handleTakeQuizAgain = () => {
  // Clear stored data
  sessionStorage.removeItem("generatedTask");

  // Navigate back to quiz page
  navigate("/assessment");
};
//code execution handler
const handleSubmit = async () => {

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

  // because backend returns ARRAY
  alert(data[0] || data[1]);
};





  // Live weakness detection (debounced)
  useEffect(() => {
    if (!code || code.trim().length < 3) {
      setHints([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingHints(true);
        const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);

        const result = await analyzeWeakness(
                      code,
                      skillLevel,
                      idleSeconds
           );

        setHints(result.hints || []);
      } catch (err) {
        console.error("Weakness analysis failed:", err);
      } finally {
        setLoadingHints(false);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [code, skillLevel]);

  // IDLE WATCHER (runs even when user stops typing)
useEffect(() => {
  const interval = setInterval(async () => {
    const idleSeconds = Math.floor((Date.now() - lastTypedAt) / 1000);

    if (idleSeconds >= 6 && code.trim().length >= 3) {
      try {
        const result = await analyzeWeakness(
          code,
          skillLevel,
          idleSeconds
        );

        setHints(result.hints || []);
      } catch (err) {
        console.error("Idle weakness check failed:", err);
      }
    }
  }, 1000); // check every 1 second

  return () => clearInterval(interval);
}, [lastTypedAt, code, skillLevel]);

//Auto Load Next Task When Correct
useEffect(() => {
  if (hints.some(h => h.includes("Your answer is correct"))) {
    setTimeout(() => {
      handleAnotherTask();
    }, 2000);
  }
}, [hints]);



  return (
    <div className="task-container">
      
      <h1 className="title">🧠Adaptive Coding Task</h1>
      
      <p className="skill">
  Predicted Skill:
  <span className="skill-pill">{skillLevel}</span>

  <button
    className="quiz-again-btn"
    onClick={handleTakeQuizAgain}
    type="button"
  >
    Take Quiz Again
  </button>
</p>



      <div className="task-box">
        <h3>Your Task</h3>
        <p className="task-text">{generatedTask}</p>
      </div>
      
      <h3 className="solution-title">Your Solution</h3>

      {/* EDITOR + HINT PANEL */}
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
    }}
    options={{
      fontSize: 16,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    }}
  />
  </div>

        {/* FLOATING LIVE HINTS */}
        <div className="hint-panel">
          <h4>Live Hints</h4>

          {loadingHints && <p className="hint-loading">Analyzing…</p>}

          {!loadingHints && hints.length === 0 && (
            <p className="hint-ok">✔ No issues detected</p>
          )}

          {!loadingHints &&
            hints.map((hint, index) => (
              <p key={index} className="hint-item">
                ⚠ {hint}
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

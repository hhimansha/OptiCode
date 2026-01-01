import { useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "./TaskEditor.css";
import { useState, useEffect } from "react";

export default function TaskEditor() {
  const location = useLocation();

  const [generatedTask, setGeneratedTask] = useState("");
  const [skillLevel, setSkillLevel] = useState("Unknown");
  const [code, setCode] = useState("# Write your Python solution here\n");

  //  LOAD TASK SAFELY AFTER RENDER
  useEffect(() => {
    if (location.state?.generatedTask) {
      setGeneratedTask(location.state.generatedTask);
      setSkillLevel(location.state.skillLevel);

      // persist backup
      sessionStorage.setItem(
        "generatedTask",
        location.state.generatedTask
      );
    } else {
      const storedTask = sessionStorage.getItem("generatedTask");
      if (storedTask) {
        setGeneratedTask(storedTask);
      }
    }
  }, [location.state]);

  return (
    <div className="task-container">
      <h1 className="title">Adaptive Coding Task</h1>

      <p className="skill">
        Predicted Skill: <span>{skillLevel}</span>
      </p>

      <div className="task-box">
        <h3>Your Task</h3>
        <p className="task-text">
          {generatedTask || "Task generation failed"}
        </p>
      </div>

      <h3 className="solution-title">Your Solution</h3>

      <div className="editor-wrapper">
        <Editor
          height="400px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <button className="submit-btn">
        Submit Code
      </button>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

// Call FastAPI backend to generate task
async function fetchTask(skillLevel) {
  const res = await fetch("http://localhost:8000/generate-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill_level: skillLevel })
  });
  const data = await res.json();
  return data.task;
}

export default function CodingExerciseAdaptive({ studentSkill = "Beginner" }) {
  const [task, setTask] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const taskIdRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchTask(studentSkill)
      .then((task) => {
        setTask(task);
        setCode(task.starter_code || "");
        taskIdRef.current = task.title || "task-1";
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch task");
        setLoading(false);
      });
  }, [studentSkill]);

  function handleEditorChange(value) {
    setCode(value);
  }

  function handleSubmit() {
    console.log("Submitting code for task:", taskIdRef.current);
    console.log(code);
  }

  if (loading) return <div>Loading adaptive task...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <Editor
        height="360px"
        defaultLanguage="python"
        value={code}
        onChange={handleEditorChange}
        options={{ minimap: { enabled: false }, fontSize: 14 }}
      />

      <div style={{ marginTop: 8 }}>
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {task.testcases && task.testcases.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Test Cases:</strong>
          <ul>
            {task.testcases.map((t, i) => (
              <li key={i}>
                <code>Input: {t.input} → Output: {t.output}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

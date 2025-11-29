import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useLocation } from 'react-router-dom';

const TaskEditor = () => {
  const location = useLocation();
  const {
    generatedTask,
    referenceTask,
    referenceConcept,
    skillLevel
  } = location.state || {};

  const [task, setTask] = useState(generatedTask || "");
  const [reference, setReference] = useState(referenceTask || "");
  const [studentCode, setStudentCode] = useState("# Write your Python solution here\n");

  useEffect(() => {
    // ✅ If task already passed from AssessmentPage, do NOT call API again
    if (generatedTask) {
      console.log("✅ Using task from navigation state");
      return;
    }
  }, [generatedTask]);

  const handleEditorChange = (value) => {
    setStudentCode(value);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Adaptive Coding Task</h1>
      {skillLevel && <p><b>Predicted Skill:</b> {skillLevel}</p>}
      {referenceConcept && <p><b>Concept:</b> {referenceConcept}</p>}

      {reference && (
        <>
          <h3>Reference Example</h3>
          <div
            style={{
              background: "#222",
              color: "#ccc",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap"
            }}
          >
            {reference}
          </div>
        </>
      )}

      <h2>Your Task</h2>
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "18px",
          fontWeight: "bold",
          whiteSpace: "pre-wrap"
        }}
      >
        {task || "⚠️ No task generated"}
      </div>

      <h2>Your Solution</h2>
      <MonacoEditor
        height="500px"
        width="100%"
        defaultLanguage="python"
        value={studentCode}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          fontSize: 16,
          minimap: { enabled: false }
        }}
      />

      <button
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          fontSize: "18px",
          borderRadius: "6px",
          cursor: "pointer"
        }}
        onClick={() => alert("Submit evaluation coming next")}
      >
        Submit Code
      </button>
    </div>
  );
};

export default TaskEditor;

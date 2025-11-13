// client/src/components/CodingExerciseRealtime.jsx
import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import debounce from "lodash.debounce";

const socket = io("http://localhost:4000"); // adjust URL/port if needed

export default function CodingExerciseRealtime({ studentId = "demo-student", 
  question = { 
    id: "demo-q", 
    text: "Write a function to add two numbers", 
    language: "javascript", 
    starter: "function add(a, b) {\n  return a + b;\n}" 
  } }) {
  const [code, setCode] = useState(question.starter || "");
  const [analysis, setAnalysis] = useState({ issues: [], weaknesses: [], hints: [], skill: null });
  const questionId = question._id || question.id;
  const skillRef = useRef("Beginner"); // you can keep student's skill here (update from server)

  useEffect(() => {
    // join room
    if (studentId) socket.emit("join", { studentId });

    socket.on("analysisResult", (data) => {
      setAnalysis(data);
      if (data.skill) skillRef.current = data.skill;
    });

    socket.on("analysisError", (err) => {
      console.error("analysisError", err);
    });

    return () => {
      socket.off("analysisResult");
      socket.off("analysisError");
    };
  }, [studentId]);

  // Debounced emit (700ms) — adjust if you want faster/slower
  const debouncedEmit = useRef(
    debounce((c) => {
      socket.emit("analyze", {
        studentId,
        questionId,
        code: c,
        language: question.language || "javascript",
        // optionally send last known skill for tailored hints
        skill: skillRef.current
      });
    }, 700)
  ).current;

  function handleEditorChange(value) {
    setCode(value);
    debouncedEmit(value);
  }

  function handleSubmit() {
    // final submission should be implemented via separate REST or socket 'submit' event
    socket.emit("submit", { studentId, questionId, code, language: question.language || "javascript" });
  }

  return (
    <div>
      <h3>{question.text || question.title}</h3>
      <Editor
        height="360px"
        defaultLanguage={question.language || "javascript"}
        value={code}
        onChange={handleEditorChange}
        options={{ minimap: { enabled: false }, fontSize: 14 }}
      />

      <div style={{ marginTop: 8 }}>
        <button onClick={handleSubmit}>Submit</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Real-time hints (skill: {analysis.skill || skillRef.current})</strong>
        <div style={{ marginTop: 8 }}>
          {analysis.hints.map((h, i) => (
            <div key={i} style={{ background: "#f6f8fa", padding: "8px", marginBottom: "6px", borderRadius: 6 }}>
              {h}
            </div>
          ))}
        </div>

        <details style={{ marginTop: 8 }}>
          <summary>Issues (raw)</summary>
          <ul>
            {analysis.issues.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </details>
      </div>
    </div>
  );
}

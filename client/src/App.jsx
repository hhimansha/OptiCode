import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from 'react';
import './App.css';
import AssessmentUI from "./components/AssessmentUI";
import CodingExerciseRealtime from "./components/CodingExerciseRealtime";

function AssessmentPage() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handlePredict = async (quizAnswers) => {
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_answers: quizAnswers }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error calling API:", err);
      alert("Failed to predict");
    }
  };

  return (
    <div>
      <h1>OptiCode Skill Predictor</h1>

      {!result && <AssessmentUI onSubmit={handlePredict} />}

      {result && (
        <div className="result">
          <h3>Predicted Skill: {result.skill_level}</h3>
          <p>Confidence: {result.confidence}</p>

          <button onClick={() => navigate("/exercise")}>
            Start Coding Exercise →
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AssessmentPage />} />
        <Route path="/exercise" element={<CodingExerciseRealtime />} />
      </Routes>
    </BrowserRouter>
  );
}

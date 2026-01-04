import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from 'react';
import './App.css';
import AssessmentUI from "./component/IT22604194/AssessmentUI";
import Form from "./Login_signup/Form";
import TaskEditor from "./component/IT22604194/TaskEditor";
import Chatbot from './AI Interview/Chatbot';
import LiveInterview from './component/IT22639226/LiveKitRoom';
import Face from './modules/AI Interview/Face';

function AssessmentPage() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handlePredict = async (quizAnswers) => {
    try {
      console.log('Sending quiz answers to proxy:', quizAnswers);

      //  USING PROXY ROUTE (not direct Flask)
      const response = await fetch("http://localhost:5000/api/predict-skill", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_answers: quizAnswers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received prediction:', data);
      setResult(data);
    } catch (err) {
      console.error("Error calling API:", err);
      alert("Failed to predict - check if Node.js server is running on port 5000");
    }
  };

  const mapSkillToLevel = (skillLabel) => {
    switch (skillLabel) {
      case "Beginner": return 1;
      case "Intermediate": return 3;
      case "Advanced": return 5;
      default: return 3;
    }
  };

  const handleStartExercise = async () => {
    try {
      const numericSkill = mapSkillToLevel(result.skill_level);

      console.log(" Requesting task for skill:", numericSkill);

      const response = await fetch("http://localhost:5000/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_skill: numericSkill }),
      });

      const taskData = await response.json();
      console.log(" Generated Task:", taskData);

      sessionStorage.setItem(
        "generatedTask",
        taskData.generated_task
      );

      navigate("/exercise", {
        state: {
          skillLevel: result.skill_level,
          numericSkill,
          //generatedTask: taskData.generated_task,
          //referenceTask: taskData.reference_task,
          //referenceConcept: taskData.reference_concept,
          confidence: result.confidence,
          categoryScores: result.category_scores,
        },
      });

    } catch (err) {
      console.error(" Error starting exercise:", err);
      alert("Failed to generate task. Check Node + FastAPI + Gemini.");
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

          <h4>Category Scores:</h4>
          <ul>
            {Object.entries(result.category_scores).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>

          <h4>Probabilities:</h4>
          <ul>
            {Object.entries(result.probabilities).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>

          <h4>Research Recommendations:</h4>
          <ul>
            {result.research_analysis.research_recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>


          <button onClick={handleStartExercise}>
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
        <Route path="/" element={<Form />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/exercise" element={<TaskEditor />} />
        <Route path="/face" element={<Face />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/livekit" element={<LiveInterview />} />
      </Routes>
    </BrowserRouter>
  );
}

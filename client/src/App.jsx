import { useState } from 'react';
import './App.css';
import AssessmentUI from "./components/AssessmentUI";

function App() {
  const [result, setResult] = useState(null);

  // Function to handle submission from AssessmentUI
  const handlePredict = async (quizAnswers) => {
    try {
      const response = await fetch('http://localhost:5000/api/predict-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_answers: quizAnswers }),
      });

      const data = await response.json();
      setResult(data); // Set prediction result to display
    } catch (err) {
      console.error("Error calling API:", err);
      alert("Failed to get prediction. Check console for details.");
    }
  };

  return (
    <div>
      <h1>OptiCode Skill Predictor</h1>

      {result && (
        <div className="result">
          <h3>Predicted Skill: {result.skill_level}</h3>
          <p>Confidence: {result.confidence}</p>
        </div>
      )}

      {/* Pass handlePredict to AssessmentUI */}
      <AssessmentUI onSubmit={handlePredict} />
    </div>
  );
}

export default App;

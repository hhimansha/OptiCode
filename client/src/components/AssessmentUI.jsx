// AssessmentUI.jsx
import { useState } from "react";
import questions from "./questions";

export default function AssessmentUI({ onSubmit }) {
  // Store selected answers; initialize with null
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  // Handle radio button change
  const handleChange = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Optional: check if all questions are answered
    const unanswered = answers.findIndex((a) => a === null);
    if (unanswered !== -1) {
      alert(`Please answer question ${unanswered + 1}`);
      return;
    }

    // Send answers to parent component or API
    if (onSubmit) {
      onSubmit(answers);
    }
  };

  return (
    <div>
      <h2>Coding Skill Assessment</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <p>
              {q.id}. {q.question}
            </p>
            {q.options.map((opt, i) => (
              <label key={i} style={{ display: "block", marginBottom: "5px" }}>
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={i}
                  checked={answers[index] === i}
                  onChange={() => handleChange(index, i)}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Submit Answers</button>
      </form>
    </div>
  );
}

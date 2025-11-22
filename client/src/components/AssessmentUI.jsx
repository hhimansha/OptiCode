// AssessmentUI.jsx for Option 2
import { useState } from "react";
import questions from "./questions";

export default function AssessmentUI({ onSubmit }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);

  const handleChange = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unanswered = answers.findIndex(a => a === null);
    if (unanswered !== -1) {
      alert(`Please answer question ${unanswered + 1}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      // The parent component (App.jsx) already handles the error, but we can log here too.
      console.error('Error in AssessmentUI:', error);
    } finally {
      setLoading(false);
    }
  };

  // This component only shows the form, never the result.
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
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

        <button type="submit" disabled={loading}>
          {loading ? "Evaluating..." : "Submit Answers"}
        </button>
      </form>
    </div>
  );
}
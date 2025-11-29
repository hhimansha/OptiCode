import { useState } from "react";
import questions from "./questions";

export default function AssessmentUI({ onSubmit }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const QUESTIONS_PER_PAGE = 15;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  const handleChange = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    const unanswered = answers
      .slice(startIndex, startIndex + QUESTIONS_PER_PAGE)
      .findIndex(a => a === null);

    if (unanswered !== -1) {
      alert(`Please answer all questions before proceeding.`);
      return;
    }

    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (answers.includes(null)) {
      alert("Please answer all 30 questions before submitting.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(answers);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h2>Coding Skill Assessment</h2>
      <h4>Page {currentPage} of {totalPages}</h4>

      <form onSubmit={handleSubmit}>
        {currentQuestions.map((q, index) => {
          const realIndex = startIndex + index;
          return (
            <div key={q.id} style={{ marginBottom: "20px" }}>
              <p>{q.id}. {q.question}</p>

              {q.options.map((opt, i) => (
                <label key={i} style={{ display: "block", marginBottom: "5px" }}>
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    value={i}
                    checked={answers[realIndex] === i}
                    onChange={() => handleChange(realIndex, i)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          );
        })}

        <div style={{ marginTop: "20px" }}>
          {currentPage > 1 && (
            <button type="button" onClick={handlePrevious}>
              ← Previous
            </button>
          )}

          {currentPage < totalPages && (
            <button type="button" onClick={handleNext} style={{ marginLeft: "10px" }}>
              Next →
            </button>
          )}

          {currentPage === totalPages && (
            <button type="submit" disabled={loading} style={{ marginLeft: "10px" }}>
              {loading ? "Evaluating..." : "Submit Answers"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

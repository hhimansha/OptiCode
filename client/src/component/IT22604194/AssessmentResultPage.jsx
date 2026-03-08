import { useLocation, useNavigate, Navigate } from "react-router-dom";

export default function AssessmentResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <Navigate to="/assessment" replace />;
  }

  const { result } = state;

  const handleStartExercise = async () => {
  const userId = localStorage.getItem("userId");

  localStorage.setItem("userSkill", result.skill_level);
  sessionStorage.clear();

  // Reset MongoDB to new quiz result BEFORE navigating
  // This prevents TaskEditor's MongoDB sync from overwriting with old level
  if (userId) {
    try {
      await fetch("http://localhost:5000/api/progress/reset-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skillLevel: result.skill_level })
      });
      console.log("✅ Level reset to:", result.skill_level);
    } catch (err) {
      console.error("Failed to reset level:", err);
      // Non-fatal — continue anyway
    }
  }

  navigate("/exercise", {
    state: { skillLevel: result.skill_level }
  });
};

  const cardStyle = {
    background: "rgba(2, 6, 23, 0.85)",
    border: "1px solid #1e40af",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 0 18px rgba(96, 165, 250, 0.15)",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "32px", color: "#e5e7eb", fontFamily: "Inter, system-ui, sans-serif" }}>

      <h2 style={{ textAlign: "center", fontSize: "34px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Skill Prediction Result
      </h2>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h3 style={{ color: "#93c5fd" }}>Predicted Skill: {result.skill_level}</h3>
        <p style={{ color: "#c7d2fe", fontSize: "16px" }}>Confidence: {result.confidence}</p>
      </div>

      <div style={cardStyle}>
        <h4 style={{ color: "#93c5fd", marginBottom: "12px" }}>Category Scores</h4>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {Object.entries(result.category_scores).map(([key, value]) => (
            <li key={key}><strong>{key}</strong>: {value}</li>
          ))}
        </ul>
      </div>

      <div style={cardStyle}>
        <h4 style={{ color: "#93c5fd", marginBottom: "12px" }}>Probabilities</h4>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {Object.entries(result.probabilities).map(([key, value]) => (
            <li key={key}><strong>{key}</strong>: {value}</li>
          ))}
        </ul>
      </div>

      <div style={cardStyle}>
        <h4 style={{ color: "#93c5fd", marginBottom: "12px" }}>Research Recommendations</h4>
        <ul>
          {result.research_analysis.research_recommendations.map((rec, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>{rec}</li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "36px" }}>
        <button
          onClick={handleStartExercise}
          style={{ padding: "14px 36px", fontSize: "16px", fontWeight: "600", borderRadius: "14px", border: "none", cursor: "pointer", background: "linear-gradient(90deg, #2563eb, #7c3aed)", color: "#fff", boxShadow: "0 0 22px rgba(124, 58, 237, 0.55)" }}
        >
          Start Coding Exercise →
        </button>
      </div>

    </div>
  );
}
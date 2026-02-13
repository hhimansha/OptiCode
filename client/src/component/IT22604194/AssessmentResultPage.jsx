import { useLocation, useNavigate } from "react-router-dom";

export default function AssessmentResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mapSkillToLevel = (skillLabel) => {
  switch (skillLabel) {
    case "Beginner": return 1;
    case "Intermediate": return 3;
    case "Advanced": return 5;
    default: return 3;
  }
};


  if (!state) {
    return <p style={{ color: "white", textAlign: "center" }}>No result data</p>;
  }

  const {
    result,
    onStartExerciseData
  } = state;

  const handleStartExercise = async () => {
  try {
    const numericSkill = mapSkillToLevel(result.skill_level);

    console.log("Requesting task for skill:", numericSkill);

    const response = await fetch("http://localhost:5000/api/tasks/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_skill: numericSkill }),
    });

    const taskData = await response.json();
    console.log("Generated Task:", taskData);

    //  VERY IMPORTANT
    sessionStorage.removeItem("generatedTask");

    /*navigate("/exercise", {
      state: {
        generatedTask: taskData.generated_task,
        skillLevel: result.skill_level,
        numericSkill,
      },
    });*/
    /*navigate("/exercise", {
  state: {
    generatedTask: taskData.generated_task,
    expectedOutput: taskData.expected_output,
    weaknessTarget: taskData.weakness_target,
    skillLevel: result.skill_level
  },
});*/
navigate("/exercise", {
  state: {
    generatedTask: taskData.generated_task,
    expected_output: taskData.expected_output,
    test_input: taskData.test_input,
    skillLevel: result.skill_level
  }
});




  } catch (err) {
    console.error("Error starting exercise:", err);
    alert("Failed to generate task");
  }
};

const cardStyle = {
  background: "rgba(2, 6, 23, 0.85)",
  border: "1px solid #1e40af",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "24px",
  boxShadow: "0 0 18px rgba(96, 165, 250, 0.15)",
};

const cardTitle = {
  color: "#93c5fd",
  marginBottom: "12px",
};

const listStyle = {
  listStyle: "none",
  paddingLeft: 0,
};

  
    return (
  <div
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "32px",
      color: "#e5e7eb",
      fontFamily: "Inter, system-ui, sans-serif",
    }}
  >
    {/* Title */}
    <h2
      style={{
        textAlign: "center",
        fontSize: "34px",
        fontWeight: "700",
        marginBottom: "8px",
        background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Skill Prediction Result
    </h2>

    {/* Main Result */}
    <div
      style={{
        textAlign: "center",
        marginBottom: "32px",
      }}
    >
      <h3 style={{ color: "#93c5fd" }}>
        Predicted Skill: {result.skill_level}
      </h3>
      <p style={{ color: "#c7d2fe", fontSize: "16px" }}>
        Confidence: {result.confidence}
      </p>
    </div>

    {/* Category Scores */}
    <div style={cardStyle}>
      <h4 style={cardTitle}>Category Scores</h4>
      <ul style={listStyle}>
        {Object.entries(result.category_scores).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value}
          </li>
        ))}
      </ul>
    </div>

    {/* Probabilities */}
    <div style={cardStyle}>
      <h4 style={cardTitle}>Probabilities</h4>
      <ul style={listStyle}>
        {Object.entries(result.probabilities).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value}
          </li>
        ))}
      </ul>
    </div>

    {/* Recommendations */}
    <div style={cardStyle}>
      <h4 style={cardTitle}>Research Recommendations</h4>
      <ul>
        {result.research_analysis.research_recommendations.map((rec, i) => (
          <li key={i} style={{ marginBottom: "6px" }}>
            {rec}
          </li>
        ))}
      </ul>
    </div>

    {/* CTA Button */}
    <div style={{ textAlign: "center", marginTop: "36px" }}>
      <button
        onClick={handleStartExercise}
        style={{
          padding: "14px 36px",
          fontSize: "16px",
          fontWeight: "600",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(90deg, #2563eb, #7c3aed)",
          color: "#fff",
          boxShadow: "0 0 22px rgba(124, 58, 237, 0.55)",
        }}
      >
        Start Coding Exercise →
      </button>
    </div>
  </div>
);

}

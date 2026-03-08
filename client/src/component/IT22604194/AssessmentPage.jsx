import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssessmentUI from "./AssessmentUI";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [checkingProgress, setCheckingProgress] = useState(true);

  useEffect(() => {
    const checkExistingProgress = async () => {
      const userId = localStorage.getItem("userId");

      // No user -> allow assessment
      if (!userId) {
        setCheckingProgress(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/progress/${userId}`);
        const data = await res.json();

        const hasCompletedQuizBefore =
          data &&
          Array.isArray(data.sessions) &&
          data.sessions.length > 0;

        if (hasCompletedQuizBefore) {
          localStorage.setItem("userSkill", data.skillLevel || "Beginner");
          navigate("/exercise", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Failed to check existing progress:", err);
      }

      setCheckingProgress(false);
    };

    checkExistingProgress();
  }, [navigate]);

  const handlePredict = async (quizAnswers) => {
    try {
      const response = await fetch("http://localhost:5000/api/predict-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_answers: quizAnswers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      navigate("/assessment/result", {
        state: { result: data },
      });
    } catch (err) {
      alert("Failed to predict - check Node server");
    }
  };

  if (checkingProgress) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          background: "#0f172a",
          fontSize: "18px"
        }}
      >
        Checking your previous progress...
      </div>
    );
  }

  return <AssessmentUI onSubmit={handlePredict} />;
}
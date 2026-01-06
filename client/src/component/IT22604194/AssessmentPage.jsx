import { useNavigate } from "react-router-dom";
import AssessmentUI from "./AssessmentUI";

export default function AssessmentPage() {
  const navigate = useNavigate();

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

  return <AssessmentUI onSubmit={handlePredict} />;
}

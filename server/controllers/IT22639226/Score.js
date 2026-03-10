// controllers/analyzeAndSaveScore.js
import { OpenRouter } from "@openrouter/sdk";
import InterviewHistory from "../../models/IT22639226/InterviewHistory.js";
import InterviewScore from "../../models/IT22639226/InterviewScore.js";
import 'dotenv/config';

// Initialize OpenRouter
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

export const analyzeLatestInterview = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    // 1️⃣ Fetch the latest interview
    const interview = await InterviewHistory.findOne({ userId }).sort({ createdAt: -1 });
    if (!interview) {
      return res.status(404).json({ success: false, message: "No interview found for this user" });
    }

    // 2️⃣ Prepare transcript
    const transcript = interview.conversation?.map(c =>
      `[${c.timestamp}] ${c.speaker} (Emotion: ${c.emotion}): ${c.text}`
    ).join("\n") || "No conversation available.";

    // 3️⃣ AI prompt
    const prompt = `
You are a strict technical interviewer evaluating a coding interview.

Task Given:
${interview.task}

Code Submitted:
${interview.code}

Interview Transcript:
${transcript}

Rules:
- Fully correct → 9-10 marks
- Mostly correct → 7-8 marks
- Partial understanding → 4-6 marks
- Major misunderstanding → 1-3 marks
- Completely wrong / contradicts fundamentals / unrelated → 0 marks

Return ONLY valid JSON in this format:

{
  "overallScore": "85%",
  "questionsAnalysis": [
    {
      "question": "AI asked question",
      "userAnswer": "User answer",
      "feedback": "Evaluation feedback",
      "marksOutOf10": 0
    }
  ]
}
`;

    // 4️⃣ Call AI
    const stream = await openrouter.chat.send({
      model: "openai/gpt-oss-120b:free",
      messages: [
        { role: "system", content: "You are a strict technical interviewer. Output raw JSON only." },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    let rawResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) rawResponse += content;
    }

    // 5️⃣ Parse AI JSON
    const cleanedJson = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(cleanedJson);
    } catch (err) {
      console.error("AI JSON Parse Error:", cleanedJson);
      return res.status(500).json({ success: false, message: "AI returned invalid JSON" });
    }

    // 6️⃣ Enforce 0 marks for incorrect or unrelated answers
    parsedAnalysis.questionsAnalysis = parsedAnalysis.questionsAnalysis.map(q => {
      const feedback = (q.feedback || "").toLowerCase();
      if (
        feedback.includes("completely incorrect") ||
        feedback.includes("fundamental misconception") ||
        feedback.includes("multiple misconceptions") ||
        feedback.includes("contradict") ||
        feedback.includes("unrelated") ||
        feedback.includes("does not address")
      ) q.marksOutOf10 = 0;
      return q;
    });

    // 7️⃣ Recalculate overall score
    if (parsedAnalysis.questionsAnalysis?.length > 0) {
      const total = parsedAnalysis.questionsAnalysis.reduce((sum, q) => sum + (q.marksOutOf10 || 0), 0);
      const avg = total / parsedAnalysis.questionsAnalysis.length;
      parsedAnalysis.overallScore = Math.round(avg * 10) + "%";
    }

    // 8️⃣ Save to InterviewScore without StudentProgress
    const newScore = new InterviewScore({
      userId,
      task: interview.task,
      code: interview.code,
      skillLevel: "Beginner", // Default or you can let client pass it
      duration: interview.duration,
      conversation: interview.conversation,
      questionsAnalysis: parsedAnalysis.questionsAnalysis,
      overallScore: parsedAnalysis.overallScore
    });

    await newScore.save();

    return res.status(200).json({ success: true, data: newScore });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze and save interview score",
      error: error.message
    });
  }
};
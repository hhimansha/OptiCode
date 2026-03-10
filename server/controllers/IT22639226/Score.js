// controllers/analyzeAndSaveScore.js

import { OpenRouter } from "@openrouter/sdk";
import InterviewHistory from "../../models/IT22639226/InterviewHistory.js";
import InterviewScore from "../../models/IT22639226/InterviewScore.js";
import "dotenv/config";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

// Convert "02:40 PM" → seconds
const convertTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;

  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 3600 + minutes * 60;
};

export const analyzeLatestInterview = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Get latest interview
    const interview = await InterviewHistory
      .findOne({ userId })
      .sort({ createdAt: -1 });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview found"
      });
    }

    // 2️⃣ Build transcript
    const transcript =
      interview.conversation
        ?.map(
          (c) =>
            `[${c.timestamp}] ${c.speaker} (Emotion: ${c.emotion}): ${c.text}`
        )
        .join("\n") || "No conversation available.";

    // 3️⃣ Generate Emotion Timeline
    const conversation = interview.conversation || [];
    const emotionTimeline = [];

    for (let i = 0; i < conversation.length; i++) {
      const current = conversation[i];
      const next = conversation[i + 1];

      const startSec = convertTimeToSeconds(current.timestamp);
      const endSec = next
        ? convertTimeToSeconds(next.timestamp)
        : startSec + 60;

      let durationSec = endSec - startSec;

      // safety fix
      if (durationSec <= 0 || isNaN(durationSec)) {
        durationSec = 60;
      }

      emotionTimeline.push({
        timestamp: current.timestamp,
        emotion: current.emotion || "Neutral",
        durationSec
      });
    }

    // 4️⃣ AI Prompt
    const prompt = `
You are a strict technical interviewer evaluating a coding interview.

Task Given:
${interview.task}

Code Submitted:
${interview.code}

Interview Transcript:
${transcript}

Emotion Timeline:
${JSON.stringify(emotionTimeline, null, 2)}

Rules:
- Fully correct → 9-10 marks
- Mostly correct → 7-8 marks
- Partial understanding → 4-6 marks
- Major misunderstanding → 1-3 marks
- Completely wrong → 0 marks

Return ONLY JSON:

{
 "overallScore":"85%",
 "questionsAnalysis":[
  {
   "question":"AI asked question",
   "userAnswer":"User answer",
   "feedback":"Evaluation feedback",
   "marksOutOf10":0
  }
 ]
}
`;

    // 5️⃣ Call AI
    const stream = await openrouter.chat.send({
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "system",
          content: "Return only raw JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    });

    let rawResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) rawResponse += content;
    }

    // 6️⃣ Clean AI JSON
    const cleaned = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    let parsedAnalysis;

    try {
      parsedAnalysis = JSON.parse(cleaned);
    } catch (err) {
      console.error("AI JSON Parse Error:", cleaned);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON"
      });
    }

    // 7️⃣ Enforce 0 marks for incorrect answers
    parsedAnalysis.questionsAnalysis =
      parsedAnalysis.questionsAnalysis.map((q) => {
        const feedback = (q.feedback || "").toLowerCase();

        if (
          feedback.includes("incorrect") ||
          feedback.includes("misconception") ||
          feedback.includes("unrelated") ||
          feedback.includes("does not address")
        ) {
          q.marksOutOf10 = 0;
        }

        return q;
      });

    // 8️⃣ Recalculate overall score
    if (parsedAnalysis.questionsAnalysis?.length > 0) {
      const total = parsedAnalysis.questionsAnalysis.reduce(
        (sum, q) => sum + (q.marksOutOf10 || 0),
        0
      );

      const avg = total / parsedAnalysis.questionsAnalysis.length;

      parsedAnalysis.overallScore = Math.round(avg * 10) + "%";
    }

    // 9️⃣ Save result
    const newScore = new InterviewScore({
      userId,
      task: interview.task,
      code: interview.code,
      skillLevel: "Beginner",
      duration: interview.duration,
      conversation: interview.conversation,
      emotionTimeline: emotionTimeline,
      questionsAnalysis: parsedAnalysis.questionsAnalysis,
      overallScore: parsedAnalysis.overallScore
    });

    await newScore.save();

    return res.status(200).json({
      success: true,
      data: newScore
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze interview",
      error: error.message
    });
  }
};
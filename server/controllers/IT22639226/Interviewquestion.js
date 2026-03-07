import axios from "axios";
import JSON5 from "json5";
import { jsonrepair } from "jsonrepair";
// Ensure these paths perfectly match your folder structure!
import InterviewQuestion from "../../models/IT22639226/InterviewQuestion.js";
import StudentProgress from "../../models/StudentProgress.js"; 

export const generateInterviewQuestions = async (req, res) => {
  try {
    // 1. Ensure the user is authenticated (comes from userAuth middleware)
    const userId = req.userId; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing" });
    }

    // 2. Fetch the logged-in user's progress
    const studentProgress = await StudentProgress.findOne({ userId: userId });
    
    if (!studentProgress || !studentProgress.sessions || studentProgress.sessions.length === 0) {
      return res.status(404).json({ message: "No coding sessions found for this user." });
    }

    // Get the most recent session (last item in the array)
    const latestSession = studentProgress.sessions[studentProgress.sessions.length - 1];
    const task = latestSession.task;
    const code = latestSession.codeSubmission;

    // Safety check: Ensure the session actually contains code before asking AI
    if (!task || !code) {
        return res.status(400).json({ message: "Task or code is missing from the user's latest session." });
    }

    // 3. Construct the dynamic prompt for the AI
    const prompt = `
You are a programming instructor.

Analyze the following Task and Python code and generate interview questions ONLY about this code.

TASK:
${task}

CODE:
${code}

Rules:
- Generate exactly 5 questions
- Questions must be about the concepts used in the code (e.g., loops, conditions, modulus, data structures, etc.)
- Do NOT generate general knowledge questions
- Return STRICT JSON
- Escape quotes inside strings

Return ONLY this format:

[
 {"question":"...","answer":"..."},
 {"question":"...","answer":"..."},
 {"question":"...","answer":"..."},
 {"question":"...","answer":"..."},
 {"question":"...","answer":"..."}
]
`;

    // 4. Send request to Local Ollama (gemma3:4b)
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "gemma3:4b",
      prompt,
      stream: false,
      options: { temperature: 0.2 }
    });

    let aiText = response.data.response;
    console.log("Raw AI Response:", aiText);

    // 5. Clean and parse the JSON response robustly
    aiText = aiText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = aiText.match(/\[[\s\S]*\]/);

    if (!match) {
      return res.status(500).json({
        message: "AI did not return a JSON array",
        raw: aiText
      });
    }

    let cleanedJson = match[0];
    cleanedJson = cleanedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    cleanedJson = cleanedJson.replace(/`([^`]*)`/g, (m) => m.replace(/"/g, '\\"'));
    cleanedJson = cleanedJson.replace(/",\.join/g, '\",.join');

    let questionsArray;

    try {
      questionsArray = JSON5.parse(cleanedJson);
      console.log("Parsed with JSON5");
    } catch (e1) {
      console.warn("JSON5 failed, trying jsonrepair");
      try {
        const repaired = jsonrepair(cleanedJson);
        questionsArray = JSON5.parse(repaired);
        console.log("Parsed with jsonrepair");
      } catch (e2) {
        console.warn("jsonrepair failed, using fallback regex");
        const regex = /"question"\s*:\s*"([\s\S]*?)"\s*,\s*"answer"\s*:\s*"([\s\S]*?)"/g;
        const matches = [...cleanedJson.matchAll(regex)];

        if (matches.length === 5) {
          questionsArray = matches.map((m) => ({
            question: m[1],
            answer: m[2]
          }));
        } else {
          return res.status(500).json({
            message: "Parsing failed completely",
            raw: cleanedJson
          });
        }
      }
    }

    // Ensure we got exactly 5 questions back
    if (!Array.isArray(questionsArray) || questionsArray.length !== 5) {
      return res.status(500).json({
        message: "AI did not return exactly 5 questions",
        data: questionsArray
      });
    }

    // 6. Store the generated questions, task, and code in MongoDB
    const savedQuestions = await InterviewQuestion.create({
      user: userId,
      task: task,
      code: code,
      questions: questionsArray
    });

    res.status(200).json({
      message: "Questions generated and saved successfully",
      data: savedQuestions
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message
    });
  }
};
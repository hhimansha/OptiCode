import axios from "axios";
import InterviewQuestion from "../../models/IT22639226/InterviewQuestion.js";
import JSON5 from "json5";
import { jsonrepair } from "jsonrepair";

export const generateInterviewQuestions = async (req, res) => {
  try {
    const prompt = `
You are a programming instructor.

Analyze the following Python code and generate interview questions ONLY about this code.

CODE:
import requests
from bs4 import BeautifulSoup

def get_headlines(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # This searches for all <h2> tags; common for headlines
    headlines = soup.find_all('h2')
    
    for i, title in enumerate(headlines, 1):
        print(f"{i}. {title.text.strip()}")





Rules:
- Generate exactly 5 questions
- Questions must be about loops, conditions, modulus, or list usage in this code
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

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "gemma3:4b",
      prompt,
      stream: false,
      options: { temperature: 0.2 }
    });

    let aiText = response.data.response;

    console.log("Raw AI Response:", aiText);

    // Remove markdown
    aiText = aiText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Extract JSON array
    const match = aiText.match(/\[[\s\S]*\]/);

    if (!match) {
      return res.status(500).json({
        message: "AI did not return JSON array",
        raw: aiText
      });
    }

    let cleanedJson = match[0];

    // Remove control characters
    cleanedJson = cleanedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    // 🔥 FIX quotes inside backticks
    cleanedJson = cleanedJson.replace(/`([^`]*)`/g, (m) =>
      m.replace(/"/g, '\\"')
    );

    // 🔥 Fix broken ",.join
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
        console.warn("jsonrepair failed, using fallback");

        const regex =
          /"question"\s*:\s*"([\s\S]*?)"\s*,\s*"answer"\s*:\s*"([\s\S]*?)"/g;

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

    if (!Array.isArray(questionsArray) || questionsArray.length !== 5) {
      return res.status(500).json({
        message: "AI did not return exactly 5 questions",
        data: questionsArray
      });
    }

    console.log("Parsed Questions:", questionsArray);

    const savedQuestions = await InterviewQuestion.create({
      user: req.userId || "test-user",
      questions: questionsArray
    });

    res.status(200).json({
      message: "Questions generated successfully",
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
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory store for multiple sessions (replace with Redis in production)
const conversationSessions = new Map();

/**
 * Get or create conversation session
 */
const getSession = (sessionId) => {
  if (!conversationSessions.has(sessionId)) {
    conversationSessions.set(sessionId, [
      {
        role: "system",
        content: `You are a friendly React.js technical interviewer. 
        Ask one question at a time in a natural, conversational style.
        Start with introductory questions, then move to technical React concepts.
        Keep responses concise and wait for the candidate's answer before proceeding.
        Be supportive and provide feedback when appropriate.`
      }
    ]);
  }
  return conversationSessions.get(sessionId);
};

/**
 * Clean up old sessions (optional)
 */
const cleanupSession = (sessionId) => {
  setTimeout(() => {
    conversationSessions.delete(sessionId);
  }, 30 * 60 * 1000); // 30 minutes
};

export const startAiInterview = async (req, res) => {
  try {
    const { prompt, sessionId = `session_${Date.now()}` } = req.body;

    if (!prompt && !conversationSessions.has(sessionId)) {
      // First message - start the interview
      const initialPrompt = "Hello! I'm ready for my React.js interview. Please start with the first question.";
      req.body.prompt = initialPrompt;
    }

    const conversationHistory = getSession(sessionId);
    
    // Add user message
    if (prompt) {
      conversationHistory.push({ role: "user", content: prompt });
    }

    // Prepare conversation context
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
    });

    const aiResponse = response.text;

    // Add AI response to history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Cleanup session
    cleanupSession(sessionId);

    res.json({ 
      text: aiResponse,
      sessionId,
      isComplete: aiResponse.includes("Thank you") || aiResponse.includes("end of interview")
    });

  } catch (error) {
    console.error("AI Interview Error:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response",
      message: error.message 
    });
  }
};

export const endInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && conversationSessions.has(sessionId)) {
      conversationSessions.delete(sessionId);
    }
    
    res.json({ message: "Interview session ended" });
  } catch (error) {
    console.error("Error ending interview:", error);
    res.status(500).json({ error: "Failed to end interview session" });
  }
};
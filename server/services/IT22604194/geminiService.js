import fetch from "node-fetch";

export async function askGemini({ weakness, skill, code, task }) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI coding tutor.

Student skill: ${skill}
Task: ${task}
Weakness: ${weakness}

Student code:
${code}

Explain the mistake and give a short hint.
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();

    console.log("Gemini raw:", JSON.stringify(data));

    // SAFETY CHECK
    if (!data.candidates || !data.candidates.length) {
      return "Try reviewing your logic carefully.";
    }

    return (
      data.candidates[0]?.content?.parts?.[0]?.text ||
      "Try reviewing your logic carefully."
    );

  } catch (err) {
    console.error("Gemini failed:", err);
    return "AI tutor temporarily unavailable.";
  }
}

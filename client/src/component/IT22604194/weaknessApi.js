export async function analyzeWeakness(code, skillLevel,idleSeconds) {
  const response = await fetch("http://localhost:8002/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code_text: code,
      time_since_last_keystroke_s: idleSeconds,
      skill_level: skillLevel,
    }),
  });

  if (!response.ok) {
    throw new Error("Weakness API failed");
  }

  return await response.json();
}

export async function analyzeWeakness(code, skillLevel, idleSeconds, expectedOutput, testInput)
 {
  const response = await fetch("http://localhost:8002/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
     code_text: code,
     time_since_last_keystroke_s: idleSeconds,
     skill_level: skillLevel,
     expected_output: expectedOutput,
     test_input: testInput

  })
,
  });

  if (!response.ok) {
    throw new Error("Weakness API failed");
  }

  return await response.json();
}

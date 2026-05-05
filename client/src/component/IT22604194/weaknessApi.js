export async function analyzeWeakness(
  code,
  skillLevel,
  idleSeconds,
  expectedOutput,
  testInput,
  requiresFunction = false
) {
  // Append function call if student wrote a function but didn't call it
  let codeToAnalyze = code;
  const functionCall = sessionStorage.getItem("functionCall");

  if (
    functionCall &&
    code.includes("def ") &&
    !code.includes(functionCall.replace("print(", "").split("(")[0].trim())
  ) {
    codeToAnalyze = code + "\n" + functionCall;
    console.log("📎 Appended function call:", functionCall);
  }

  const response = await fetch("http://localhost:8002/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code_text:                  codeToAnalyze, // ✅ uses code + function call
      time_since_last_keystroke_s: idleSeconds,
      skill_level:                skillLevel,
      expected_output:            expectedOutput,
      test_input:                 testInput,
      requires_function:          requiresFunction
    }),
  });

  if (!response.ok) {
    throw new Error("Weakness API failed");
  }

  return await response.json();
}

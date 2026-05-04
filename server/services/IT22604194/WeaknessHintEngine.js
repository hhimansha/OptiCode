/**
 * WEAKNESS-AWARE HINT ENGINE
 * Research Feature 1 — Personalized Scaffolding
 *
 * Generates hints specific to weakness type + concept + skill level.
 * This sits ON TOP of existing local hints in tutorRoutes.js.
 * If no specific hint found → falls back to existing system (no change).
 */

export class WeaknessHintEngine {

  /**
   * Main entry point
   * @param {string} weakness   - logic_error, syntax_error, etc.
   * @param {string} concept    - loops, functions, recursion, etc.
   * @param {string} skillLevel - Beginner, Intermediate, Advanced
   * @param {string} code       - student's actual code
   * @param {string} task       - the task description
   * @returns {string|null}     - specific hint or null (fall back to existing)
   */
  /**
   * Analyze code to detect actual weaknesses (if model prediction is wrong)
   * @param {string} code - student code
   * @param {string} task - task description
   * @returns {string|null} - detected weakness or null
   */
  static analyzeCodeForWeaknesses(code, task) {
    // Check for syntax errors
    try {
      new Function(code); // Basic JS syntax check (not perfect for Python but helps)
    } catch (e) {
      if (e.message.includes("Unexpected")) return "syntax_error";
    }

    const hasDef = /def\s+\w+\s*\(/.test(code);
    const hasReturn = /return\s+/.test(code);
    const hasPrint = /print\s*\(/.test(code);
    const hasLoop = /for\s+|while\s+/.test(code);
    const hasIf = /if\s+/.test(code);
    const requiresFunction = task.toLowerCase().includes("function") || task.toLowerCase().includes("def");

    // No function when required
    if (requiresFunction && !hasDef) return "no_function";

    // Function without return (when return is expected)
    if (hasDef && !hasReturn && task.toLowerCase().includes("return")) {
      return "logic_error"; // Function defined but no return
    }

    // Loop without print (when output is expected)
    if (hasLoop && !hasPrint && !task.toLowerCase().includes("store")) {
      return "missing_print";
    }

    // Recursive function without base case
    if (hasDef && code.match(/\w+\s*\(\s*\w+\s*-\s*1/)) {
      if (!hasIf) return "missing_base_case";
    }

    // While loop without variable modification (infinite loop risk)
    const whileMatches = code.match(/while\s+(\w+)\s*[<>=!]+/g);
    if (whileMatches) {
      for (const whileMatch of whileMatches) {
        const varName = whileMatch.match(/while\s+(\w+)/)[1];
        if (!code.includes(`${varName}++`) && !code.includes(`${varName}--`) && 
            !code.includes(`${varName} +=`) && !code.includes(`${varName} -=`)) {
          return "infinite_loop";
        }
      }
    }

    return null;
  }

  static generateHint(weakness, concept, skillLevel, code, task) {

    const safeSkill =
      skillLevel === "Beginner" ||
      skillLevel === "Intermediate" ||
      skillLevel === "Advanced"
        ? skillLevel
        : "Beginner";

    // ── SMART INFINITE LOOP DETECTION ──────────────────────────────────
    // Distinguish between real infinite loops vs wrong range values
    if (weakness === "infinite_loop") {
      const isRealInfiniteLoop = this.isRealInfiniteLoop(code);
      if (!isRealInfiniteLoop && concept === "loops") {
        // Not a real infinite loop, convert to logic_error
        weakness = "logic_error";
        console.log("🔄 Corrected: infinite_loop → logic_error (range issue)");
      }
    }

    // ── FALLBACK: If model prediction seems wrong, detect actual issue ────
    if (!weakness && code.trim()) {
      const detectedWeakness = this.analyzeCodeForWeaknesses(code, task);
      if (detectedWeakness) {
        weakness = detectedWeakness;
        console.log(`🔍 Detected weakness from code analysis: ${weakness}`);
      }
    }

    // Try weakness + concept specific hint first
    const specificHint = this.getSpecificHint(weakness, concept, safeSkill, code, task);
    if (specificHint) return specificHint;

    // Return null → tutorRoutes.js will use its existing local hint system
    return null;
  }

  /**
   * Detect if code has a real infinite loop vs just wrong range
   * @param {string} code - student code
   * @returns {boolean} - true if real infinite loop, false if just wrong range
   */
  static isRealInfiniteLoop(code) {
    // Check for while True / while 1 (real infinite loop)
    if (/while\s+(True|1)\s*:/.test(code)) return true;
    
    // Check for while loops where the loop variable is never modified
    const whileMatch = code.match(/while\s+(\w+)\s*[<>=!]+/);
    if (whileMatch) {
      const loopVar = whileMatch[1];
      // If variable is used in condition but never modified in loop body, it's infinite
      const loopBody = code.split(/while\s+\w+/)[1];
      if (loopBody && !loopBody.match(new RegExp(`${loopVar}\\s*[+=\\-]`))) {
        return true;
      }
    }

    // range() with wrong values is NOT an infinite loop, it's a logic error
    if (code.includes("for") && code.includes("range(")) return false;

    return false;
  }

  // ── Specific hints: weakness + concept combinations ───────────────────
  static getSpecificHint(weakness, concept, skillLevel, code, task) {

    const key = `${weakness}__${concept}`;

    const hints = {

      // ══════════════════════════════════════════════════════════════════
      // LOGIC ERROR combinations
      // ══════════════════════════════════════════════════════════════════

      "logic_error__loops": {
        Beginner:
          "Your loop structure looks right. Check what values you pass to range() — make sure start, stop, and step match what you want to print.",
        Intermediate:
          "Check your loop condition carefully. Is it iterating the right number of times? Trace through it manually with a small example.",
        Advanced:
          "Your loop logic may have an off-by-one error or incorrect boundary. Trace through the first and last iterations manually."
      },

      "logic_error__functions": {
        Beginner:
          "Your function is defined but check what it returns. Make sure you use 'return' not just print() inside the function.",
        Intermediate:
          "Check your function logic step by step. Does it handle the input correctly? Try calling it with a simple value first.",
        Advanced:
          "Your function logic may be correct for simple cases but failing on edge cases. Check boundary values."
      },

      "logic_error__recursion": {
        Beginner:
          "Recursion needs two things — a base case to stop and a recursive call to continue. Check if you have both.",
        Intermediate:
          "Your recursive call might not be reducing the problem. Make sure each call gets closer to the base case.",
        Advanced:
          "Check your recursive logic — are you combining results correctly? Trace the call stack for a small input."
      },

      "logic_error__math": {
        Beginner:
          "Check the operator you are using. Python uses + for add, - for subtract, * for multiply, / for divide, ** for power.",
        Intermediate:
          "Check operator precedence. Python follows BODMAS — use brackets to make your calculation order clear.",
        Advanced:
          "Check for floating point precision issues. Consider using round() if you need exact decimal output."
      },

      "logic_error__variables": {
        Beginner:
          "Make sure you assigned the correct value to your variable. Print the variable right after assigning to check.",
        Intermediate:
          "Check if you are modifying the variable correctly. Is it being updated inside or outside the loop?",
        Advanced:
          "Check variable scope — is the variable accessible where you are using it?"
      },

      "logic_error__dictionaries": {
        Beginner:
          "Check your dictionary key name exactly — keys are case sensitive. Use dict['key'] to access values.",
        Intermediate:
          "Check if the key exists before accessing it. Use dict.get('key') to avoid KeyError.",
        Advanced:
          "Check how you are iterating the dictionary — .items(), .keys(), .values() give different results."
      },

      "logic_error__sets": {
        Beginner:
          "Sets remove duplicates automatically. Check if that is causing unexpected results in your output.",
        Intermediate:
          "Check which set operation you need — | for union, & for intersection, - for difference.",
        Advanced:
          "Remember set operations return a new set — make sure you are storing or printing the result correctly."
      },

      "logic_error__strings": {
        Beginner:
          "Check your string — Python strings are case sensitive. 'Hello' and 'hello' are different.",
        Intermediate:
          "Check the string method you are using — .upper(), .lower(), .strip() all do different things.",
        Advanced:
          "Check string slicing indices — remember Python uses zero-based indexing and the end index is exclusive."
      },

      "logic_error__lists": {
        Beginner:
          "Check your list — are you accessing the right index? Python lists start at index 0.",
        Intermediate:
          "Check if you are modifying the list correctly — .append() adds to end, .insert() adds at position.",
        Advanced:
          "Check for list mutation issues — sorting or modifying a list in place changes the original."
      },

      "logic_error__algorithm": {
        Beginner:
          "Break the problem into smaller steps. What is the first thing you need to check or calculate?",
        Intermediate:
          "Trace through your algorithm manually with the given input. At which step does the output diverge from expected?",
        Advanced:
          "Check your algorithm for edge cases — empty input, single element, already sorted, duplicates."
      },

      // ══════════════════════════════════════════════════════════════════
      // SYNTAX ERROR combinations
      // ══════════════════════════════════════════════════════════════════

      "syntax_error__loops": {
        Beginner:
          "Check your for loop — it needs a colon at the end and the body must be indented. Example: for i in range(5):",
        Intermediate:
          "Check your loop syntax — colon after the condition, consistent indentation inside the body.",
        Advanced:
          "Check for mixed indentation — Python is strict about spaces vs tabs."
      },

      "syntax_error__functions": {
        Beginner:
          "Function definition needs 'def', a name, brackets, and a colon. Example: def my_function():",
        Intermediate:
          "Check your function definition and all return statements. Make sure brackets are matched.",
        Advanced:
          "Check decorator syntax and function signature carefully."
      },

      "syntax_error__recursion": {
        Beginner:
          "Check your if statement syntax — it needs a colon at the end and an indented body below it.",
        Intermediate:
          "Check all colons, brackets, and indentation in the recursive function.",
        Advanced:
          "Check for subtle syntax issues in complex recursive conditions."
      },

      "syntax_error__variables": {
        Beginner:
          "Variable names cannot have spaces or start with a number. Use underscore: my_name not my name.",
        Intermediate:
          "Check your assignment syntax — use = for assignment, not == which is for comparison.",
        Advanced:
          "Check for unpacking syntax errors if assigning multiple variables at once."
      },

      "syntax_error__lists": {
        Beginner:
          "Check your list brackets — a list uses square brackets [ ] and items are separated by commas.",
        Intermediate:
          "Check for missing commas between list elements or unmatched brackets.",
        Advanced:
          "Check for subtle issues in list comprehension syntax — the 'for' and 'if' must be in the right order."
      },

      "syntax_error__dictionaries": {
        Beginner:
          "A dictionary uses curly brackets { } with key: value pairs separated by commas. Example: {'name': 'Alice'}",
        Intermediate:
          "Check for missing colons between keys and values, or missing commas between pairs.",
        Advanced:
          "Check for nested dictionary syntax — each level needs its own matching braces."
      },

      "syntax_error__strings": {
        Beginner:
          "Check your string quotes — they must match. If you open with ' you must close with '. Same for \".",
        Intermediate:
          "Check for unescaped quotes inside strings. Use \\' or \\\" to include quotes inside a string.",
        Advanced:
          "Check for f-string syntax — expressions inside f-strings must be in curly brackets {expression}."
      },

      // ══════════════════════════════════════════════════════════════════
      // MISSING PRINT combinations
      // ══════════════════════════════════════════════════════════════════

      "missing_print__loops": {
        Beginner:
          "You have the loop but make sure print() is inside the loop body — it needs to be indented under the for/while.",
        Intermediate:
          "Check if print is inside or outside the loop — this changes what gets displayed.",
        Advanced:
          "Decide whether to print inside the loop each iteration or collect results and print once after."
      },

      "missing_print__functions": {
  Beginner:
    "Your function is defined correctly! Now you need to call it and print the result. Add this at the end: print(function_name(arguments))",
  Intermediate:
    "Function is defined but not called. Add a print() statement that calls your function with the required arguments.",
  Advanced:
    "Defined but not invoked. Call the function and print the return value."
},

      "missing_print__math": {
        Beginner:
          "You calculated the result but did not print it. Add print() around your calculation to see the output.",
        Intermediate:
          "Store the result in a variable then print it, or wrap the whole calculation in print().",
        Advanced:
          "Make sure you are printing the final result — not an intermediate calculation step."
      },

      "missing_print__recursion": {
        Beginner:
          "Your recursive function is defined but you need to call it and print the result. Add print(function_name(value)) at the end.",
        Intermediate:
          "Call your recursive function and print the returned value — the function alone does not show output.",
        Advanced:
          "Check whether output should come from inside the recursion or from printing the final return value."
      },

      "missing_print__variables": {
        Beginner:
          "You stored a value in a variable but did not print it. Add print(variable_name) to show it.",
        Intermediate:
          "Make sure you are printing the variable — just assigning it does not produce output.",
        Advanced:
          "Check that you are printing the correct variable — the one with the final computed value."
      },

      // ══════════════════════════════════════════════════════════════════
      // HARDCODED VALUE combinations
      // ══════════════════════════════════════════════════════════════════

      "hardcoded_value__math": {
        Beginner:
          "Do not type the answer directly. Use the actual math operation — like print(10 - 4) instead of print(6).",
        Intermediate:
          "Use variables and operators to compute the answer — the system checks that you calculated it not typed it.",
        Advanced:
          "Your solution should compute the answer dynamically, not hardcode a specific value."
      },

      "hardcoded_value__loops": {
        Beginner:
          "Use a loop to generate the numbers — do not print each number manually on separate lines.",
        Intermediate:
          "Your solution should work for any range input, not just this specific case. Use a loop.",
        Advanced:
          "Avoid hardcoding — your solution should be generalized and work for different inputs."
      },

      "hardcoded_value__functions": {
        Beginner:
          "Your function should calculate the result, not return a hardcoded number. Use the parameter in the calculation.",
        Intermediate:
          "Make sure your function uses its parameters — returning a fixed value ignores the input.",
        Advanced:
          "Your function must derive its return value from the input parameters dynamically."
      },

      // ══════════════════════════════════════════════════════════════════
      // INFINITE LOOP combinations
      // ══════════════════════════════════════════════════════════════════

      "infinite_loop__loops": {
        Beginner:
          "Your loop might never stop. For a for loop use range() with a clear end. For while loop make sure the condition becomes False eventually.",
        Intermediate:
          "Check your while loop — is the variable being updated inside the loop? It must change each iteration to reach the end condition.",
        Advanced:
          "Check for subtle infinite loop conditions — trace through 2-3 iterations manually to verify termination."
      },

      "infinite_loop__recursion": {
        Beginner:
          "Your recursive function needs a stopping condition — an if statement that returns without calling itself again.",
        Intermediate:
          "Your base case might not be reached. Make sure every recursive call gets closer to the base case.",
        Advanced:
          "Check that your recursive calls always reduce the problem size and that the base case covers all termination paths."
      },

      // ══════════════════════════════════════════════════════════════════
      // MISSING BASE CASE combinations
      // ══════════════════════════════════════════════════════════════════

      "missing_base_case__recursion": {
        Beginner:
          "Every recursive function needs an if statement at the top to stop it. Example: if n == 0: return 1",
        Intermediate:
          "Your recursive function is missing or has an incorrect base case. Add an if statement that handles the simplest input without calling itself.",
        Advanced:
          "Check all your base cases — does your function handle n=0, n=1, and edge inputs correctly?"
      },

      "missing_base_case__functions": {
        Beginner:
          "Your recursive function needs a stopping point. Add an if statement that returns a value when n is 0 or 1.",
        Intermediate:
          "The base case should return a direct value — not call the function again. Check your if condition.",
        Advanced:
          "Verify your base case is reachable from all recursive paths."
      },

      // ══════════════════════════════════════════════════════════════════
      // NO FUNCTION combinations
      // ══════════════════════════════════════════════════════════════════

      "no_function__functions": {
        Beginner:
          "The task asks you to write a function. Start with 'def function_name():' then write the body indented below.",
        Intermediate:
          "Wrap your solution in a function definition. Use 'def' keyword and make sure to return the result.",
        Advanced:
          "Your solution needs a proper function definition matching the task requirements exactly."
      },

      "no_function__recursion": {
        Beginner:
          "Write a function that calls itself. Start with def, add a base case at the top, then call the function inside itself with a smaller value.",
        Intermediate:
          "Your recursive function should call itself with a smaller input each time until it hits the base case.",
        Advanced:
          "Structure your recursive function with clear base case and recursive case sections."
      },

      "no_function__math": {
        Beginner:
          "The task wants a function. Write def function_name(parameters): and put your calculation inside.",
        Intermediate:
          "Wrap your math logic in a function — use def, give it parameters, and return the result.",
        Advanced:
          "Encapsulate your mathematical logic in a properly defined function with correct parameters."
      },

      "no_function__algorithm": {
        Beginner:
          "Write the algorithm inside a function. Start with def, then write your logic inside.",
        Intermediate:
          "Define a function for this algorithm — use def, add the right parameters, and return the result.",
        Advanced:
          "Implement the algorithm as a well-structured function with clear input parameters and return value."
      },
    };

    const hintSet = hints[key];
    if (!hintSet) return null;

    return hintSet[skillLevel] || hintSet["Beginner"];
  }
}

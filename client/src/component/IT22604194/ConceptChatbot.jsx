import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONCEPT TASK PATHS ───────────────────────────────────────────────────
const CONCEPT_PATHS = {
  Beginner: {
    loops: [
      { task: "Print numbers from 1 to 5 using a for loop.", expected_output: "1\n2\n3\n4\n5", hint: "Use range(1, 6) inside a for loop." },
      { task: "Print even numbers from 2 to 8 using a for loop.", expected_output: "2\n4\n6\n8", hint: "Use range(2, 9, 2) to step by 2." },
      { task: "Print numbers from 5 down to 1 using a for loop.", expected_output: "5\n4\n3\n2\n1", hint: "Use range(5, 0, -1) to count down." },
      { task: "Print the letters in the word 'cat' each on a new line.", expected_output: "c\na\nt", hint: "You can loop over a string directly: for char in 'cat'." },
      { task: "Use a loop to print the multiplication table of 3 from 1 to 5.", expected_output: "3\n6\n9\n12\n15", hint: "Loop from 1 to 5 and print 3 * i each time." }
    ],
    functions: [
      { task: "Write a function add(a, b) that returns a+b. Print add(3, 4).", expected_output: "7", hint: "Use def add(a, b): return a + b" },
      { task: "Write a function double(n) that returns double of n. Print double(5).", expected_output: "10", hint: "Return n * 2 inside the function." },
      { task: "Write a function square(n) that returns n*n. Print square(6).", expected_output: "36", hint: "Return n ** 2 inside the function." },
      { task: "Write a function subtract(a, b) that returns a-b. Print subtract(10, 3).", expected_output: "7", hint: "Return a - b inside the function." },
      { task: "Write a function greet(name) that prints Hello name. Call greet('Sam').", expected_output: "Hello Sam", hint: "Use print('Hello', name) or f-strings inside the function." }
    ],
    math: [
      { task: "Print the sum of 5 and 10.", expected_output: "15", hint: "Use print(5 + 10)." },
      { task: "Print the result of 3 multiplied by 4.", expected_output: "12", hint: "Use the * operator." },
      { task: "Print the result of 2 raised to the power of 5.", expected_output: "32", hint: "Use ** for exponentiation: 2 ** 5." },
      { task: "Print the remainder of 17 divided by 5.", expected_output: "2", hint: "Use the % (modulo) operator." },
      { task: "Store 6 and 7 in variables a and b, then print their product.", expected_output: "42", hint: "Assign a = 6, b = 7, then print(a * b)." }
    ],
    conditionals: [
      { task: "Print True if 5 is greater than 3, otherwise print False.", expected_output: "True", hint: "Use print(5 > 3)." },
      { task: "Check if 10 is greater than 5. Print Yes or No.", expected_output: "Yes", hint: "Use an if/else statement." },
      { task: "Print Even if 8 is even, otherwise print Odd.", expected_output: "Even", hint: "Use 8 % 2 == 0 as the condition." },
      { task: "Check if 15 is divisible by 3. Print Yes or No.", expected_output: "Yes", hint: "Use 15 % 3 == 0 as the condition." },
      { task: "Print Positive if 7 is positive, Negative if it is negative, Zero if it is zero.", expected_output: "Positive", hint: "Use if/elif/else with comparisons to 0." }
    ],
    strings: [
      { task: "Store the word Python in a variable and print it.", expected_output: "Python", hint: "Assign name = 'Python' then print(name)." },
      { task: "Print the length of the word hello.", expected_output: "5", hint: "Use print(len('hello'))." },
      { task: "Print the first letter of the word 'apple'.", expected_output: "a", hint: "Use string indexing: 'apple'[0]." },
      { task: "Print the string 'hello' in uppercase.", expected_output: "HELLO", hint: "Use the .upper() method." },
      { task: "Print the string 'WORLD' in lowercase.", expected_output: "world", hint: "Use the .lower() method." }
    ],
    variables: [
      { task: "Create a variable x = 10 and print it.", expected_output: "10", hint: "Assign x = 10 then print(x)." },
      { task: "Create a variable name = 'Alice' and print it.", expected_output: "Alice", hint: "Assign name = 'Alice' then print(name)." },
      { task: "Create two variables x=5 and y=3 and print their sum.", expected_output: "8", hint: "print(x + y) after assigning both." },
      { task: "Create a variable pi = 3.14 and print it.", expected_output: "3.14", hint: "Assign pi = 3.14 then print(pi)." },
      { task: "Swap two variables a=5 and b=10 and print them in swapped order.", expected_output: "10\n5", hint: "Use a, b = b, a to swap, then print each." }
    ]
  },
  Intermediate: {
    loops: [
      { task: "Use a while loop to print numbers from 5 down to 1.", expected_output: "5\n4\n3\n2\n1", hint: "Start at 5, loop while i >= 1, decrement inside." },
      { task: "Print even numbers from 2 to 10 using a loop.", expected_output: "2\n4\n6\n8\n10", hint: "Use range(2, 11, 2) or check i % 2 == 0." },
      { task: "Print numbers from 1 to 10 that are not divisible by 3.", expected_output: "1\n2\n4\n5\n7\n8\n10", hint: "Use if i % 3 != 0 inside the loop." },
      { task: "Use a loop to compute and print the product of 1 to 5.", expected_output: "120", hint: "Start product = 1, multiply each i from 1 to 5." },
      { task: "Print the multiplication table of 7 from 1 to 10.", expected_output: "7\n14\n21\n28\n35\n42\n49\n56\n63\n70", hint: "Loop from 1 to 10 and print 7 * i each iteration." }
    ],
    functions: [
      { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", expected_output: "True", hint: "Return n % 2 == 0 inside the function." },
      { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(3, 7).", expected_output: "7", hint: "Use if/else or Python's built-in comparison." },
      { task: "Write a function multiply(a, b) that returns a*b. Print multiply(6, 7).", expected_output: "42", hint: "Return a * b inside the function." },
      { task: "Write a function sum_list(lst) that returns the sum. Print sum_list([1,2,3,4,5]).", expected_output: "15", hint: "Use Python's built-in sum() or a loop." },
      { task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').", expected_output: "True", hint: "Compare s == s[::-1]." }
    ],
    lists: [
      { task: "Compute the sum of [1,2,3,4,5] using sum() and print it.", expected_output: "15", hint: "print(sum([1,2,3,4,5]))" },
      { task: "Compute the maximum of [3,7,2,9,1] and print it.", expected_output: "9", hint: "print(max([3,7,2,9,1]))" },
      { task: "Sort the list [5,2,8,1,9] and print it.", expected_output: "[1, 2, 5, 8, 9]", hint: "Use sorted() or .sort() then print." },
      { task: "Reverse the list [1,2,3,4,5] and print it.", expected_output: "[5, 4, 3, 2, 1]", hint: "Use [::-1] slicing or .reverse()." },
      { task: "Write a list comprehension returning squares of 1 to 4 and print it.", expected_output: "[1, 4, 9, 16]", hint: "Use [x**2 for x in range(1, 5)]." }
    ],
    strings: [
      { task: "Compute the length of the string 'hello world' and print it.", expected_output: "11", hint: "Use len('hello world')." },
      { task: "Print the string 'Hello World' in uppercase.", expected_output: "HELLO WORLD", hint: "Use .upper() method." },
      { task: "Count the number of vowels in 'hello world' and print the count.", expected_output: "3", hint: "Loop through each char and check if it's in 'aeiou'." },
      { task: "Check if 'racecar' is a palindrome and print True or False.", expected_output: "True", hint: "Compare s == s[::-1]." },
      { task: "Replace all spaces in 'hello world' with underscores and print.", expected_output: "hello_world", hint: "Use .replace(' ', '_')." }
    ],
    recursion: [
      { task: "Write a recursive function to sum numbers from 1 to n. Print sum_to(4).", expected_output: "10", hint: "Base case: if n == 0 return 0. Else return n + sum_to(n-1)." },
      { task: "Write a recursive function count_down(n) that prints from n to 1. Call count_down(5).", expected_output: "5\n4\n3\n2\n1", hint: "Base case: if n < 1 return. Else print n then call count_down(n-1)." },
      { task: "Write a recursive function to compute factorial of 5. Print the result.", expected_output: "120", hint: "Base case: if n == 1 return 1. Else return n * factorial(n-1)." },
      { task: "Write a recursive function reverse(s). Print reverse('hello').", expected_output: "olleh", hint: "Base case: if len(s) == 0 return ''. Else return s[-1] + reverse(s[:-1])." },
      { task: "Write a recursive function to compute the 6th Fibonacci number. Print it.", expected_output: "8", hint: "fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)." }
    ]
  },
  Advanced: {
    recursion: [
      { task: "Write a recursive power function. Print power(2, 8).", expected_output: "256", hint: "Base case: power(base, 0) = 1. Else return base * power(base, exp-1)." },
      { task: "Write a recursive function to compute the nth Fibonacci. Print fib(10).", expected_output: "55", hint: "fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)." },
      { task: "Write a recursive function sum_digits(n). Print sum_digits(1234).", expected_output: "10", hint: "Base case: if n < 10 return n. Else return n%10 + sum_digits(n//10)." },
      { task: "Write a recursive function reverse(s). Print reverse('python').", expected_output: "nohtyp", hint: "Return the last char + reverse of remaining string." },
      { task: "Write a recursive function to compute factorial(7). Print the result.", expected_output: "5040", hint: "Base: factorial(1)=1. Recursive: n * factorial(n-1)." }
    ],
    algorithm: [
      { task: "Print all prime numbers between 1 and 20.", expected_output: "2\n3\n5\n7\n11\n13\n17\n19", hint: "For each number, check if any divisor from 2 to sqrt(n) divides it." },
      { task: "Binary search for 7 in [1,3,5,7,9]. Print the index.", expected_output: "3", hint: "Use low=0, high=len-1, mid=(low+high)//2 and compare." },
      { task: "Implement bubble sort and print the sorted version of [5,3,8,1,2].", expected_output: "[1, 2, 3, 5, 8]", hint: "Nested loops: compare adjacent pairs and swap if out of order." },
      { task: "Write a function second_largest(lst). Print second_largest([3,1,9,7,5]).", expected_output: "7", hint: "Sort descending and take index 1, or track top-2 in one pass." },
      { task: "Write a function prime_factors(n). Print prime_factors(60).", expected_output: "[2, 2, 3, 5]", hint: "Divide by 2 first, then odd numbers up to sqrt(n)." }
    ],
    oop: [
      { task: "Write a class Rectangle with width=4 and height=5. Print its area.", expected_output: "20", hint: "Define __init__(self, w, h) and an area() method returning w*h." },
      { task: "Write a class Circle with radius=7. Print its area rounded to 2 decimals.", expected_output: "153.94", hint: "Area = math.pi * r ** 2. Use round(..., 2)." },
      { task: "Write a class Animal with a speak method returning 'Roar'. Print Animal().speak().", expected_output: "Roar", hint: "Define speak(self) that returns 'Roar'." },
      { task: "Write a class Stack with push and pop methods. Push 1,2,3 then pop and print.", expected_output: "3", hint: "Use a list inside the class. push appends, pop removes from end." },
      { task: "Write a class Counter with increment and get_count methods. Increment 5 times and print the count.", expected_output: "5", hint: "Store count as self.count, increment adds 1, get_count returns it." }
    ],
    lists: [
      { task: "Compute and print the dot product of [1,2,3] and [4,5,6].", expected_output: "32", hint: "Sum of a[i]*b[i] for each index i." },
      { task: "Write a function rotate(lst, k) that rotates the list LEFT by k positions. Print rotate([1,2,3,4,5],2).", expected_output: "[3, 4, 5, 1, 2]", hint: "Left rotation means the first k elements move to the end. Return lst[k:] + lst[:k]." },
      { task: "Find and print all factors of 36, one per line.", expected_output: "1\n2\n3\n4\n6\n9\n12\n18\n36", hint: "Loop from 1 to 37 and print each number that divides 36 with no remainder. Print each factor directly, not in a list or sentence." },
      { task: "Write a function flatten(lst). Print flatten([[1,2],[3,4]]).", expected_output: "[1, 2, 3, 4]", hint: "Use a list comprehension or nested loop to combine sublists." },
      { task: "Write a function is_anagram(a,b). Print is_anagram('listen','silent').", expected_output: "True", hint: "Compare sorted(a) == sorted(b)." }
    ]
  }
};

const AVAILABLE_CONCEPTS = {
  Beginner: ["loops", "functions", "math", "conditionals", "strings", "variables"],
  Intermediate: ["loops", "functions", "lists", "strings", "recursion"],
  Advanced: ["recursion", "algorithm", "oop", "lists"]
};

// All concepts across all levels for chips
const ALL_CONCEPTS = [...new Set(Object.values(AVAILABLE_CONCEPTS).flat())];

const CONCEPT_EMOJIS = {
  loops: "🔁", functions: "⚙️", math: "🔢", conditionals: "🔀",
  strings: "📝", variables: "📦", lists: "📋", recursion: "🌀",
  algorithm: "🧮", oop: "🏗️", dictionaries: "🗂️"
};

// ─── SAVE PROGRESS ────────────────────────────────────────────────────────
async function saveConceptProgress({ userId, task, concept, skillLevel, solved, timeTakenSeconds }) {
  if (!userId) return;
  try {
    await fetch("http://localhost:5000/api/progress/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, task, weakness: null, concept,
        learningMode: "improve_concept", skillLevel, solved,
        timeTakenSeconds, taskLevel: skillLevel, codeSubmission: ""
      })
    });
  } catch (err) {
    console.error("Failed to save concept progress:", err);
  }
}

// ─── EXECUTE + EVALUATE ───────────────────────────────────────────────────
async function evaluateCode(code, expectedOutput, skillLevel) {
  try {
    const execRes = await fetch("http://localhost:8002/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code_text: code, time_since_last_keystroke_s: 0, skill_level: skillLevel })
    });

    const rawText = await execRes.text();
    console.log("🔍 Execute raw response:", rawText);

    let actualOutput = "", errorOutput = "";

    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        actualOutput = (parsed[0] || "").trim();
        errorOutput = (parsed[1] || "").trim();
      } else if (typeof parsed === "object" && parsed !== null) {
        actualOutput = (parsed.stdout || parsed.output || parsed.result || parsed.out || "").trim();
        errorOutput = (parsed.stderr || parsed.error || parsed.err || "").trim();
      } else if (typeof parsed === "string") {
        actualOutput = parsed.trim();
      }
    } catch {
      actualOutput = rawText.trim();
    }

    console.log("✅ Parsed output:", JSON.stringify(actualOutput));
    console.log("❌ Parsed error:", JSON.stringify(errorOutput));

    if (errorOutput && !actualOutput) {
      return { correct: false, hints: [`Error: ${errorOutput.split("\n").filter(Boolean).slice(-1)[0]}`] };
    }

    const expected = (expectedOutput || "").trim();
    const correct = actualOutput === expected;

    console.log("🎯 Expected:", JSON.stringify(expected), "| Match:", correct);

    if (correct) return { correct: true, hints: ["correct"] };
    return { correct: false, hints: [buildDiffHint(actualOutput, expected, errorOutput)] };

  } catch (err) {
    return { correct: false, hints: [`Connection error: ${err.message}. Make sure your server is running on port 8002.`] };
  }
}

function buildDiffHint(actual, expected, error) {
  if (error) return `Error: ${error.split("\n").filter(Boolean).slice(-1)[0] || error}`;
  if (!actual) return "Your code ran but produced no output. Did you forget print()?";

  const aLines = actual.split("\n");
  const eLines = expected.split("\n");

  if (aLines.length !== eLines.length) {
    return `Your output has ${aLines.length} line${aLines.length !== 1 ? "s" : ""} but ${eLines.length} ${eLines.length !== 1 ? "are" : "is"} expected. Check your loop or output structure.`;
  }

  for (let i = 0; i < eLines.length; i++) {
    if (aLines[i] !== eLines[i]) {
      return `Line ${i + 1}: got "${aLines[i]}" but expected "${eLines[i]}". Check your calculation logic.`;
    }
  }

  if (actual.toLowerCase() === expected.toLowerCase()) {
    return `Almost! Check capitalisation — your output doesn't exactly match the expected case.`;
  }

  return `Got: "${actual.substring(0, 60)}" — Expected: "${expected.substring(0, 60)}". Trace through your logic step by step.`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ConceptChatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("greeting");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [code, setCode] = useState("");
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [taskSolved, setTaskSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "there";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Fetch skill level + show greeting ──────────────────────────────────
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) {
      fetch(`http://localhost:5000/api/progress/${uid}`)
        .then(r => r.json())
        .then(data => { if (data.skillLevel) setSkillLevel(data.skillLevel); })
        .catch(() => {});
    }

    setTimeout(() => {
      const lastConcept = sessionStorage.getItem("lastConceptPracticed");
      const lastConceptNote = lastConcept
        ? `\n\nLast time you practiced **${lastConcept}**. Want to continue or try something new?`
        : "";

      addBotMessage(`Hey ${userName}! 👋 I'm your **Concept Tutor**.

I'll give you **5 focused tasks** on any concept you want to improve — ordered from easy to challenging.${lastConceptNote}

Which concept do you want to practice today?`);
      setPhase("selecting");
    }, 400);
  }, []);

  function addBotMessage(text, extra = {}) {
    setMessages(prev => [...prev, { role: "bot", text, ...extra }]);
  }

  function addUserMessage(text) {
    setMessages(prev => [...prev, { role: "user", text }]);
  }

  // ── Concept selection — tries current level first, falls back to others ─
  function selectConcept(concept) {
    const levelOrder = [skillLevel, "Beginner", "Intermediate", "Advanced"];
    let resolvedLevel = null;
    let path = null;

    for (const level of levelOrder) {
      if (CONCEPT_PATHS[level]?.[concept]) {
        resolvedLevel = level;
        path = CONCEPT_PATHS[level][concept];
        break;
      }
    }

    if (!path) {
      addBotMessage(`I don't have tasks for **${concept}** yet. Try one of: ${ALL_CONCEPTS.join(", ")}`);
      return;
    }

    setSelectedConcept(concept);
    setTasks(path);
    setTaskIndex(0);
    setCode("");
    setShowHint(false);
    setTaskSolved(false);
    setSolvedCount(0);
    setTaskStartTime(Date.now());
    sessionStorage.setItem("lastConceptPracticed", concept);

    addUserMessage(concept);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const levelNote = resolvedLevel !== skillLevel ? ` *(using ${resolvedLevel} level tasks)*` : "";
      addBotMessage(`Great choice! Let's work on **${CONCEPT_EMOJIS[concept] || "📘"} ${concept}**${levelNote}.

I've prepared **5 tasks** for you — they get progressively harder. Let's go!`);

      setTimeout(() => {
        setPhase("task_active");
        presentTask(path, 0);
      }, 600);
    }, 800);
  }

  function presentTask(taskList, index) {
    setCode("");
    setShowHint(false);
    setTaskSolved(false);
    setTaskStartTime(Date.now());
    addBotMessage(
      `**Task ${index + 1} of 5** ${"●".repeat(index + 1)}${"○".repeat(4 - index)}\n\n${taskList[index].task}`,
      { isTask: true, taskIndex: index }
    );
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    if (phase === "selecting") {
      selectConcept(trimmed.toLowerCase().replace(/[^a-z_]/g, ""));
    } else if (phase === "greeting") {
      addUserMessage(trimmed);
      addBotMessage("Type a concept name below or click one of the chips to get started!");
      setPhase("selecting");
    }
  }

  async function handleSubmitCode() {
    if (!code.trim() || isEvaluating || taskSolved) return;
    setIsEvaluating(true);

    const currentTask = tasks[taskIndex];
    const timeTaken = Math.floor((Date.now() - taskStartTime) / 1000);
    const { correct, hints } = await evaluateCode(code, currentTask.expected_output, skillLevel);

    setIsEvaluating(false);

    if (correct) {
      setTaskSolved(true);
      setSolvedCount(prev => prev + 1);

      await saveConceptProgress({
        userId, task: currentTask.task, concept: selectedConcept,
        skillLevel, solved: true, timeTakenSeconds: timeTaken
      });

      const isLast = taskIndex === tasks.length - 1;

      if (isLast) {
        // Fetch updated mastery to show the actual improvement
        let masteryMsg = "";
        if (userId) {
          try {
            const r = await fetch(`http://localhost:5000/api/progress/${userId}`);
            const d = await r.json();
            const conceptData = d.conceptProgress?.[selectedConcept];
            if (conceptData) {
              const pct = ((conceptData.mastery || 0) * 100).toFixed(1);
              const solved = conceptData.solved || 0;
              const attempts = conceptData.attempts || 0;
              masteryMsg = `\n\n📊 **${selectedConcept} mastery: ${pct}%** — ${solved}/${attempts} solved overall`;
            }
          } catch {}
        }

        addBotMessage(
          `✅ **Perfect!** You solved all 5 tasks on **${selectedConcept}**! 🎉${masteryMsg}\n\nCheck your profile to see the full breakdown.`,
          { isSuccess: true }
        );
        setPhase("all_done");
      } else {
        addBotMessage(
          `✅ **Correct!** Well done${timeTaken < 30 ? " — super fast too! ⚡" : ""}\n\nReady for the next one?`,
          { isSuccess: true }
        );
        setTimeout(() => {
          const nextIndex = taskIndex + 1;
          setTaskIndex(nextIndex);
          presentTask(tasks, nextIndex);
        }, 1500);
      }
    } else {
      await saveConceptProgress({
        userId, task: currentTask.task, concept: selectedConcept,
        skillLevel, solved: false, timeTakenSeconds: timeTaken
      });
      addBotMessage(
        `❌ Not quite. ${hints[0] || "Check your output and try again."}\n\nKeep going — you can do it!`,
        { isError: true }
      );
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (phase === "selecting" || phase === "greeting") handleSend();
    }
  }

  function handleNewConcept() {
    setPhase("selecting");
    setSelectedConcept(null);
    setTasks([]);
    setTaskIndex(0);
    setCode("");
    setSolvedCount(0);
    addBotMessage(`Nice work! 🙌 Which concept do you want to practice next?`);
  }

  const currentTask = phase === "task_active" ? tasks[taskIndex] : null;

  // ── Styles ──────────────────────────────────────────────────────────────
  const S = {
    container: {
      maxWidth: "780px", margin: "0 auto", height: "100vh",
      display: "flex", flexDirection: "column",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      background: "#080c18", color: "#e2e8f0"
    },
    header: {
      padding: "16px 24px", borderBottom: "1px solid #1e2d4a",
      background: "rgba(8,12,24,0.95)", display: "flex",
      alignItems: "center", gap: "12px", backdropFilter: "blur(8px)"
    },
    dot: (c) => ({ width: "10px", height: "10px", borderRadius: "50%", background: c }),
    messages: {
      flex: 1, overflowY: "auto", padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: "12px"
    },
    botBubble: (x = {}) => ({
      maxWidth: "82%", alignSelf: "flex-start",
      background: x.isTask ? "rgba(30,42,70,0.9)" : x.isSuccess ? "rgba(20,60,40,0.85)" : x.isError ? "rgba(60,20,20,0.85)" : "rgba(15,22,40,0.9)",
      border: `1px solid ${x.isTask ? "#2563eb" : x.isSuccess ? "#22c55e" : x.isError ? "#ef4444" : "#1e2d4a"}`,
      borderRadius: "4px 16px 16px 16px", padding: "14px 18px",
      fontSize: "13.5px", lineHeight: "1.7",
      color: x.isSuccess ? "#86efac" : x.isError ? "#fca5a5" : "#cbd5e1",
      boxShadow: x.isTask ? "0 0 20px rgba(37,99,235,0.15)" : "none"
    }),
    userBubble: {
      maxWidth: "60%", alignSelf: "flex-end",
      background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
      borderRadius: "16px 16px 4px 16px", padding: "10px 16px",
      fontSize: "13.5px", color: "#e0e7ff"
    },
    typingBubble: {
      alignSelf: "flex-start", background: "rgba(15,22,40,0.9)",
      border: "1px solid #1e2d4a", borderRadius: "4px 16px 16px 16px",
      padding: "14px 18px", display: "flex", gap: "6px", alignItems: "center"
    },
    tdot: (d) => ({
      width: "7px", height: "7px", borderRadius: "50%", background: "#475569",
      animation: "pulse 1.2s ease-in-out infinite", animationDelay: d
    }),
    chip: (active) => ({
      padding: "6px 14px", borderRadius: "20px",
      border: `1px solid ${active ? "#2563eb" : "#1e2d4a"}`,
      background: active ? "rgba(37,99,235,0.2)" : "rgba(15,22,40,0.6)",
      color: active ? "#93c5fd" : "#64748b", fontSize: "12px",
      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit"
    }),
    codeArea: {
      width: "100%", background: "#0d1117", border: "1px solid #1e2d4a",
      borderRadius: "8px", color: "#c9d1d9",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px",
      padding: "12px", resize: "vertical", minHeight: "120px",
      outline: "none", lineHeight: "1.6", boxSizing: "border-box"
    },
    btn: (v = "primary") => ({
      padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
      fontSize: "12px", fontFamily: "inherit", fontWeight: "600",
      border: v === "hint" ? "1px solid #92400e" : "1px solid transparent",
      background: v === "primary" ? "linear-gradient(135deg, #2563eb, #7c3aed)"
        : v === "hint" ? "rgba(245,158,11,0.15)" : "rgba(30,45,74,0.7)",
      color: v === "hint" ? "#fbbf24" : "#e0e7ff"
    }),
    navBtn: (color, borderColor) => ({
      padding: "5px 12px", fontSize: "11px", borderRadius: "8px", cursor: "pointer",
      background: `rgba(${color},0.15)`, border: `1px solid ${borderColor}`,
      color: borderColor, fontFamily: "inherit"
    }),
    inputRow: {
      padding: "16px 24px", borderTop: "1px solid #1e2d4a",
      display: "flex", gap: "10px",
      background: "rgba(8,12,24,0.98)", backdropFilter: "blur(8px)"
    },
    input: {
      flex: 1, background: "rgba(15,22,40,0.9)", border: "1px solid #1e2d4a",
      borderRadius: "10px", color: "#e2e8f0", padding: "10px 16px",
      fontSize: "13px", fontFamily: "inherit", outline: "none"
    },
    sendBtn: {
      padding: "10px 20px", background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer",
      fontSize: "13px", fontFamily: "inherit", fontWeight: "600"
    }
  };

  function renderText(text) {
    return text.split("\n").map((line, i) => (
      <div key={i}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} style={{ color: "#93c5fd" }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </div>
    ));
  }

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        textarea:focus { border-color: #2563eb !important; }
        input:focus { border-color: #2563eb !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 2px; }
      `}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={S.dot("#ef4444")} /><div style={S.dot("#f59e0b")} /><div style={S.dot("#22c55e")} />
        </div>
        <span style={{ fontSize: "14px", color: "#7dd3fc", fontWeight: "600", letterSpacing: "0.05em" }}>
          concept_tutor.py
        </span>
        {selectedConcept && (
          <span style={{ fontSize: "12px", color: "#7c3aed" }}>
            {CONCEPT_EMOJIS[selectedConcept]} {selectedConcept}
          </span>
        )}
        {phase === "task_active" && (
          <span style={{ fontSize: "11px", color: "#475569", marginLeft: "auto" }}>
            ✅ {solvedCount} solved • {taskIndex + 1}/5 • {skillLevel}
          </span>
        )}
        <div style={{ display: "flex", gap: "8px", marginLeft: phase === "task_active" ? "12px" : "auto" }}>
          <button onClick={() => navigate("/exercise")} style={S.navBtn("99,102,241", "#a5b4fc")}>← Tasks</button>
          <button onClick={() => navigate("/profile")} style={S.navBtn("14,165,233", "#7dd3fc")}>📊 Profile</button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {phase === "task_active" && (
        <div style={{ height: "2px", background: "#1e2d4a", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            width: `${(taskIndex / 5) * 100}%`, transition: "width 0.4s ease"
          }} />
        </div>
      )}

      {/* ── Messages ── */}
      <div style={S.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "user" ? S.userBubble : S.botBubble(msg)}>
            {renderText(msg.text)}

            {/* Concept chips on last bot message while selecting */}
            {msg.role === "bot" && phase === "selecting" && i === messages.length - 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {ALL_CONCEPTS.map(c => (
                  <button key={c} style={S.chip(c === selectedConcept)} onClick={() => selectConcept(c)}>
                    {CONCEPT_EMOJIS[c] || "📘"} {c}
                  </button>
                ))}
              </div>
            )}

            {/* All-done buttons */}
            {msg.role === "bot" && phase === "all_done" && i === messages.length - 1 && (
              <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button style={S.btn("primary")} onClick={handleNewConcept}>🔁 Practice Another Concept</button>
                <button style={S.btn("secondary")} onClick={() => navigate("/profile")}>📊 View My Profile</button>
              </div>
            )}

            {/* Task code editor — only on active task bubble */}
            {msg.role === "bot" && msg.isTask && phase === "task_active" && taskIndex === msg.taskIndex && !taskSolved && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ fontSize: "11px", color: "#475569", marginBottom: "6px" }}>
                  # write your solution
                </div>
                <textarea
                  style={S.codeArea}
                  placeholder="# Write your Python code here..."
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  <button style={S.btn("primary")} onClick={handleSubmitCode} disabled={isEvaluating}>
                    {isEvaluating ? "Checking..." : "▶ Run & Check"}
                  </button>
                  <button style={S.btn("hint")} onClick={() => setShowHint(!showHint)}>
                    💡 {showHint ? "Hide Hint" : "Hint"}
                  </button>
                  <button
                    style={S.btn("secondary")}
                    onClick={() => {
                      saveConceptProgress({ userId, task: tasks[taskIndex].task, concept: selectedConcept, skillLevel, solved: false, timeTakenSeconds: 0 });
                      const next = taskIndex + 1;
                      if (next < tasks.length) { setTaskIndex(next); presentTask(tasks, next); }
                      else { setPhase("all_done"); addBotMessage("You've gone through all 5 tasks! Check your profile to see your progress."); }
                    }}
                  >
                    Skip →
                  </button>
                </div>
                {showHint && currentTask?.hint && (
                  <div style={{
                    marginTop: "10px", padding: "10px 14px",
                    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: "8px", fontSize: "12.5px", color: "#fcd34d"
                  }}>
                    💡 {currentTask.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={S.typingBubble}>
            {["0s", "0.2s", "0.4s"].map((d, i) => <div key={i} style={S.tdot(d)} />)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input row ── */}
      {(phase === "selecting" || phase === "greeting") && (
        <div style={S.inputRow}>
          <input
            style={S.input}
            placeholder="Type a concept name (e.g. loops, functions, recursion)..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={S.sendBtn} onClick={handleSend}>Send</button>
        </div>
      )}

      {phase === "all_done" && (
        <div style={{ ...S.inputRow, justifyContent: "center" }}>
          <button style={S.sendBtn} onClick={handleNewConcept}>Practice Another Concept →</button>
        </div>
      )}
    </div>
  );
}

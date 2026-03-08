import express from "express";
import { structuredTasks } from "../../data/structuredTasks.js";
import { generateTaskWithGemini } from "../../services/IT22604194/geminiService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import studentProgress from "../../models/IT22604194/StudentProgress.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJsonl(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return [];
    const lines = raw.split("\n");
    return lines.map(line => JSON.parse(line));
  } catch (err) {
    console.warn(`⚠️ Failed to load dataset file: ${filePath}`);
    return [];
  }
}

const beginnerDataset = loadJsonl(
  path.join(__dirname, "../../data/cleaned_output/beginner_tasks.jsonl")
);

const intermediateDataset = loadJsonl(
  path.join(__dirname, "../../data/cleaned_output/intermediate_tasks.jsonl")
);

const advancedDataset = loadJsonl(
  path.join(__dirname, "../../data/cleaned_output/advanced_tasks.jsonl")
);

// store recent tasks/concepts per user to avoid repetition
const recentTasks = new Map();
const recentConcepts = new Map();

// ─── BLOCKLIST ────────────────────────────────────────────────────────────
const BLOCKED_TASKS = new Set([
  "Write a function that prints all factors of a number.",
  "Write a function that prints all factors of a number",
  "write a function that prints all factors of a number."
]);

// ─── LAST RESORT FALLBACK ────────────────────────────────────────────────
const fallbackTasks = {
  Beginner: [
    { task: "Print the sum of 5 and 10.", test_input: "", expected_output: "15", concept: "math" },
    { task: "Print numbers from 1 to 3 using a for loop.", test_input: "", expected_output: "1\n2\n3", concept: "loops" },
    { task: "Create a variable x = 7 and print it.", test_input: "", expected_output: "7", concept: "variables" },
    { task: "Print the result of 4 multiplied by 5.", test_input: "", expected_output: "20", concept: "math" },
    { task: "Calculate 10 - 4 and print the result.", test_input: "", expected_output: "6", concept: "math" },
    { task: "Print the result of 2 raised to the power of 5.", test_input: "", expected_output: "32", concept: "math" },
    { task: "Print even numbers from 2 to 8 using a for loop.", test_input: "", expected_output: "2\n4\n6\n8", concept: "loops" },
    { task: "Print the word Hello.", test_input: "", expected_output: "Hello", concept: "print" },
    { task: "Print the numbers from 5 down to 1 using a loop.", test_input: "", expected_output: "5\n4\n3\n2\n1", concept: "loops" },
    { task: "Store the word Python in a variable and print it.", test_input: "", expected_output: "Python", concept: "variables" },
    { task: "Print the remainder of 17 divided by 5.", test_input: "", expected_output: "2", concept: "math" },
    { task: "Print True if 10 is greater than 5, otherwise print False.", test_input: "", expected_output: "True", concept: "conditionals" },
    { task: "Print the letters in the word cat each on a new line.", test_input: "", expected_output: "c\na\nt", concept: "loops" },
    { task: "Create two variables a = 6 and b = 7, then print their product.", test_input: "", expected_output: "42", concept: "variables" },
    { task: "Print the first 4 odd numbers.", test_input: "", expected_output: "1\n3\n5\n7", concept: "loops" }
  ],

  Intermediate: [
    { task: "Print the sum of all numbers from 1 to 10.", test_input: "", expected_output: "55", concept: "loops" },
    { task: "Write a function is_even(n). Print is_even(4).", test_input: "", expected_output: "True", concept: "functions" },
    { task: "Print all even numbers from 2 to 10.", test_input: "", expected_output: "2\n4\n6\n8\n10", concept: "loops" },
    { task: "Print the factorial of 4 by computing it.", test_input: "", expected_output: "24", concept: "math" },
    { task: "Write a function max_of_two(a,b). Print max_of_two(3,7).", test_input: "", expected_output: "7", concept: "functions" },
    { task: "Sort the list [5,2,8,1,9] and print it.", test_input: "", expected_output: "[1, 2, 5, 8, 9]", concept: "lists" },
    { task: "Write a function square(n). Print square(9).", test_input: "", expected_output: "81", concept: "functions" },
    { task: "Print the count of even numbers from 1 to 20.", test_input: "", expected_output: "10", concept: "loops" },
    { task: "Compute the sum of [1,2,3,4,5] using sum() and print it.", test_input: "", expected_output: "15", concept: "lists" },
    { task: "Reverse the list [1,2,3,4,5] and print it.", test_input: "", expected_output: "[5, 4, 3, 2, 1]", concept: "lists" },
    { task: "Write a function multiply(a,b) that returns a*b. Print multiply(6,7).", test_input: "", expected_output: "42", concept: "functions" },
    { task: "Print whether 17 is prime — True or False.", test_input: "", expected_output: "True", concept: "algorithm" },
    { task: "Compute the maximum of [3,7,2,9,1] and print it.", test_input: "", expected_output: "9", concept: "lists" },
    { task: "Write a function sum_list(lst) that returns the sum. Print sum_list([1,2,3,4,5]).", test_input: "", expected_output: "15", concept: "functions" },
    { task: "Print the multiplication table of 3 from 1 to 5.", test_input: "", expected_output: "3\n6\n9\n12\n15", concept: "loops" },
    { task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').", test_input: "", expected_output: "True", concept: "functions" },
    { task: "Print numbers from 1 to 10 that are not divisible by 3.", test_input: "", expected_output: "1\n2\n4\n5\n7\n8\n10", concept: "conditionals" },
    { task: "Use a while loop to print numbers from 5 down to 1.", test_input: "", expected_output: "5\n4\n3\n2\n1", concept: "loops" },
    { task: "Write a function print_factors(n) that prints all factors. Call print_factors(12).", test_input: "", expected_output: "1\n2\n3\n4\n6\n12", concept: "functions" },
    { task: "Compute the length of the string 'hello world' and print it.", test_input: "", expected_output: "11", concept: "strings" }
  ],

  Advanced: [
    { task: "Print all prime numbers between 1 and 20.", test_input: "", expected_output: "2\n3\n5\n7\n11\n13\n17\n19", concept: "algorithm" },
    { task: "Write a recursive factorial(n). Print factorial(5).", test_input: "", expected_output: "120", concept: "recursion" },
    { task: "Print the first 8 Fibonacci numbers.", test_input: "", expected_output: "0\n1\n1\n2\n3\n5\n8\n13", concept: "algorithm" },
    { task: "Write is_palindrome(s). Print is_palindrome('racecar').", test_input: "", expected_output: "True", concept: "strings" },
    { task: "Print the sum of digits of 12345.", test_input: "", expected_output: "15", concept: "math" },
    { task: "Binary search for 7 in [1,3,5,7,9]. Print the index.", test_input: "", expected_output: "3", concept: "algorithm" },
    { task: "Implement bubble sort. Print sorted [5,3,8,1,2].", test_input: "", expected_output: "[1, 2, 3, 5, 8]", concept: "algorithm" },
    { task: "Write a recursive power function. Print power(2, 10).", test_input: "", expected_output: "1024", concept: "recursion" },
    { task: "Write a function gcd(a,b). Print gcd(48,18).", test_input: "", expected_output: "6", concept: "algorithm" },
    { task: "Print the largest element in [3,1,4,1,5,9,2,6].", test_input: "", expected_output: "9", concept: "lists" },
    { task: "Write a function second_largest(lst). Print second_largest([3,1,9,7,5]).", test_input: "", expected_output: "7", concept: "algorithm" },
    { task: "Write a recursive function reverse(s). Print reverse('python').", test_input: "", expected_output: "nohtyp", concept: "recursion" },
    { task: "Compute and print the dot product of [1,2,3] and [4,5,6].", test_input: "", expected_output: "32", concept: "algorithm" },
    { task: "Write a function is_prime(n). Print is_prime(29).", test_input: "", expected_output: "True", concept: "algorithm" },
    { task: "Implement selection sort and print the sorted version of [64,25,12,22,11].", test_input: "", expected_output: "[11, 12, 22, 25, 64]", concept: "algorithm" },
    { task: "Write a recursive function fib(n). Print fib(10).", test_input: "", expected_output: "55", concept: "recursion" },
    { task: "Write a function rotate(lst, k). Print rotate([1,2,3,4,5],2).", test_input: "", expected_output: "[3, 4, 5, 1, 2]", concept: "algorithm" },
    { task: "Write a class Rectangle with width=4 and height=5. Print its area.", test_input: "", expected_output: "20", concept: "oop" },
    { task: "Write a function prime_factors(n). Print prime_factors(60).", test_input: "", expected_output: "[2, 2, 3, 5]", concept: "algorithm" },
    { task: "Write a recursive function flatten(lst). Print flatten([[1,2],[3,4]]).", test_input: "", expected_output: "[1, 2, 3, 4]", concept: "recursion" },
    { task: "Find and print all factors of 36.", test_input: "", expected_output: "1\n2\n3\n4\n6\n9\n12\n18\n36", concept: "algorithm" },
    { task: "Write a function is_anagram(a,b). Print is_anagram('listen','silent').", test_input: "", expected_output: "True", concept: "strings" },
    { task: "Write a recursive function sum_digits(n). Print sum_digits(1234).", test_input: "", expected_output: "10", concept: "recursion" },
    { task: "Compute the sum of squares of numbers from 1 to 5 and print it.", test_input: "", expected_output: "55", concept: "math" },
    { task: "Write a class Animal with a speak method returning 'Roar'. Print Animal().speak().", test_input: "", expected_output: "Roar", concept: "oop" }
  ]
};

// ─── WEAKNESS → CONCEPT MAPPING ──────────────────────────────────────────
const weaknessConceptMap = {
  logic_error: "logic",
  infinite_loop: "loops",
  missing_base_case: "recursion",
  syntax_error: "print",
  hardcoded_value: "math",
  missing_print: "print",
  no_function: "functions",
  idle_stuck: "variables"
};

// ─── CONCEPT ALIASES ─────────────────────────────────────────────────────
const conceptAliases = {
  print:         ["print", "output", "pri", "display"],
  variables:     ["variables", "variable", "var"],
  strings:       ["strings", "string", "str", "text"],
  math:          ["math", "mat", "arithmetic", "numbers"],
  conditionals:  ["conditionals", "conditional", "boolean", "logic", "con", "if_else"],
  loops:         ["loops", "loop", "for_loop", "while_loop", "loo", "iteration"],
  functions:     ["functions", "function", "methods", "basic_function", "boolean_function", "fun"],
  lists:         ["lists", "list", "list_operations", "lis"],
  tuples:        ["tuples", "tuple", "tup"],
  dictionaries:  ["dictionaries", "dictionary", "dict_comprehension", "dic",
                  "dictionary_nested", "dict"],
  sets:          ["sets", "set"],
  casting:       ["casting", "cast", "type_conversion"],
  slicing:       ["slicing", "slice"],
  sorting:       ["sorting", "sort"],
  filter:        ["filter", "filtering"],
  comprehension: ["list_comprehension", "comprehension", "dict_comprehension"],
  recursion:     ["recursion", "recursive_problem", "rec", "recursive"],
  oop:           ["oop", "class", "classes", "object", "advanced_oop"],
  inheritance:   ["inheritance", "inherit", "inheritance_chain"],
  polymorphism:  ["polymorphism", "poly"],
  algorithm:     ["algorithm", "algorithms", "algorithmic_problem", "algo",
                  "algorithmic", "search", "binary_search"],
  sorting:       ["sorting", "sort", "bubble_sort", "merge_sort"],
  stack:         ["stack", "stacks"],
  queue:         ["queue", "queues"],
  lambda:        ["lambda", "lambda_function"],
  functional:    ["filter", "map", "reduce", "lambda"],
  modules:       ["modules", "module", "imports"],
  data:          ["data_processing", "data_cleaning", "cleaning", "data", "merging"],
  pattern:       ["pattern", "sliding_window", "frequency"],
  general:       []
};

// ─── HELPERS ─────────────────────────────────────────────────────────────
function normalizeConcept(concept) {
  if (!concept) return null;
  const value = String(concept).trim().toLowerCase();

  if (["lis", "list"].includes(value)) return "lists";
  if (["pri", "print"].includes(value)) return "print";
  if (["algorit", "algo", "algorithm"].includes(value)) return "algorithm";
  if (["loo", "loop"].includes(value)) return "loops";
  if (["fun", "function"].includes(value)) return "functions";
  if (["var", "variable"].includes(value)) return "variables";
  if (["con", "conditional", "logic", "boolean"].includes(value)) return "conditionals";
  if (["rec", "recursive"].includes(value)) return "recursion";
  if (["dic", "dictionary"].includes(value)) return "dictionaries";
  if (["str", "string"].includes(value)) return "strings";
  if (["mat"].includes(value)) return "math";

  return value;
}

function isValidTask(task, expected_output) {
  if (!task || expected_output === undefined || expected_output === null) return false;

  const normalized = String(task).trim().toLowerCase();

  for (const blocked of BLOCKED_TASKS) {
    if (normalized === blocked.toLowerCase()) {
      console.log(`🚫 Blocklisted task rejected: "${task}"`);
      return false;
    }
  }

  const hasExactCall =
    /[Pp]rint\s+[\w]+\([^)]*\)/.test(task) ||
    /[Cc]all\s+[\w]+\([^)]*\)/.test(task);

  const vaguePatterns = [
    "a number",
    "a string",
    "a list",
    "some numbers",
    "any number",
    "user input",
    "of words",
    "of strings",
    "of numbers"
  ];

  const isVague = vaguePatterns.some(p => normalized.includes(p));

  if (isVague && !hasExactCall) {
    console.log(`⚠️ Vague task rejected: "${task}"`);
    return false;
  }

  const isFunctionTask =
    normalized.includes("write a function") ||
    normalized.includes("define a function") ||
    normalized.includes("create a function") ||
    normalized.includes("write a recursive function");

  if (isFunctionTask && !hasExactCall && !/\d/.test(task)) {
    console.log(`⚠️ Function task rejected (missing exact call): "${task}"`);
    return false;
  }

  return true;
}

function extractFunctionCall(taskText) {
  if (!taskText) return null;

  const callInstructionMatch = taskText.match(/[Cc]all\s+([\w]+\([^)]*\))/);
  if (callInstructionMatch) return callInstructionMatch[1];

  const printMatch = taskText.match(/[Pp]rint\s+([\w]+\([^)]*\))/);
  if (printMatch) {
    const call = printMatch[1];
    const fnName = call.split("(")[0].toLowerCase();
    const selfPrinting = ["print_factors", "print_primes", "count_down", "countdown", "greet"];
    return selfPrinting.includes(fnName) ? call : `print(${call})`;
  }

  const bareMatch = taskText.match(/\b([a-z_][\w]*\(\s*[\d,\s'"\[\].]+\s*\))/i);
  if (bareMatch) return bareMatch[1];

  return null;
}

function inferConceptFromTask(taskText = "") {
  const text = taskText.toLowerCase();

  if (text.includes("dict comprehension") || text.includes("dictionary comprehension")) return "dictionaries";
  if (text.includes("recursion") || text.includes("recursive")) return "recursion";
  if (text.includes("class") || text.includes("object") || text.includes("inherit")) return "oop";
  if (text.includes("dictionary")) return "dictionaries";
  if (text.includes("tuple")) return "tuples";
  if (text.includes("list")) return "lists";
  if (text.includes("string")) return "strings";
  if (text.includes("loop") || text.includes("for ") || text.includes("while ")) return "loops";
  if (text.includes("function") || text.includes("def ")) return "functions";
  if (text.includes("print") || text.includes("output") || text.includes("display")) return "print";
  if (text.includes("if ") || text.includes("else") || text.includes("condition")) return "conditionals";
  if (
    text.includes("sum") ||
    text.includes("multiply") ||
    text.includes("divide") ||
    text.includes("subtract") ||
    text.includes("factorial") ||
    text.includes("power")
  ) return "math";
  if (
    text.includes("search") ||
    text.includes("sort") ||
    text.includes("prime") ||
    text.includes("fibonacci") ||
    text.includes("algorithm")
  ) return "algorithm";
  if (text.includes("try") || text.includes("except") || text.includes("finally")) return "exception_handling";
  if (text.includes("yield") || text.includes("generator")) return "generators";
  if (text.includes("decorator") || text.includes("@")) return "decorators";
  if (text.includes("lambda")) return "lambda";
  if (text.includes("inherits") || text.includes("inherit") || text.includes("override")) return "inheritance";
  if (text.includes("set") && (text.includes("union") || text.includes("intersection"))) return "sets";
  if (text.includes("tuple") || text.includes("unpack")) return "tuples";
  if (text.includes("dictionary") || text.includes("dict") || text.includes("key") && text.includes("value")) return "dictionaries";
  if (text.includes("filter(") || text.includes("map(") || text.includes("reduce(")) return "functional";

  return "general";
}

function getDatasetPool(skillLabel) {
  if (skillLabel === "Beginner") return beginnerDataset;
  if (skillLabel === "Intermediate") return intermediateDataset;
  if (skillLabel === "Advanced") return advancedDataset;
  return [];
}

function normalizeExpectedOutput(expected) {
  return Array.isArray(expected) ? expected.join("\n") : String(expected || "");
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeakestConcept(progress) {
  if (!progress?.conceptProgress) return null;
  const entries = Array.from(progress.conceptProgress.entries());
  if (!entries.length) return null;
  entries.sort((a, b) => (a[1]?.mastery || 0) - (b[1]?.mastery || 0));
  return entries[0][0];
}

function filterByConcept(pool, concept) {
  if (!concept) return pool;
  const normalizedConcept = normalizeConcept(concept);
  const aliases = conceptAliases[normalizedConcept] || [normalizedConcept];
  const matched = pool.filter(t => aliases.includes((t.concept || "").toLowerCase()));
  return matched.length > 0 ? matched : pool;
}

function filterByWeakness(pool, weakness) {
  if (!weakness) return pool;
  const mappedConcept = weaknessConceptMap[weakness];
  if (!mappedConcept) return pool;
  return filterByConcept(pool, mappedConcept);
}

function excludeDuplicate(pool, excludeTask) {
  if (!excludeTask) return pool;
  const filtered = pool.filter(t => t.task !== excludeTask);
  return filtered.length > 0 ? filtered : pool;
}

function rememberRecentTask(userId, task) {
  if (!userId || !task) return;
  const history = recentTasks.get(userId) || [];
  const updated = [task, ...history.filter(t => t !== task)].slice(0, 3);
  recentTasks.set(userId, updated);
}

function avoidRecentTasks(userId, pool) {
  if (!userId) return pool;
  const history = recentTasks.get(userId) || [];
  if (!history.length) return pool;

  const filtered = pool.filter(t => !history.includes(t.task));
  return filtered.length > 0 ? filtered : pool;
}

function rememberConcept(userId, concept) {
  if (!userId || !concept) return;
  const history = recentConcepts.get(userId) || [];
  const updated = [concept, ...history.filter(c => c !== concept)].slice(0, 3);
  recentConcepts.set(userId, updated);
}

function avoidRecentConcepts(userId, pool) {
  if (!userId) return pool;
  const history = recentConcepts.get(userId) || [];
  if (!history.length) return pool;

  const filtered = pool.filter(t => !history.includes(t.concept));
  return filtered.length > 0 ? filtered : pool;
}

// ─── TASK CHOOSERS ───────────────────────────────────────────────────────
function chooseStructuredTask(skillLabel, weakness, concept, excludeTask, userId) {
  if (weakness) {
    const pool = structuredTasks?.[skillLabel]?.[weakness];
    if (pool?.length > 0) {
      const validPool = pool.filter(t => isValidTask(t.task, t.expected_output));
      if (validPool.length > 0) {
        let filtered = excludeDuplicate(validPool, excludeTask);
        filtered = avoidRecentTasks(userId, filtered);
        filtered = avoidRecentConcepts(userId, filtered);

        const chosen = randomItem(filtered);
        return {
          task: chosen.task,
          expected_output: chosen.expected_output,
          test_input: chosen.test_input,
          concept: inferConceptFromTask(chosen.task),
          source: "structured_tasks"
        };
      }
    }
  }

  if (concept && structuredTasks?.[skillLabel]) {
    const allPools = Object.values(structuredTasks[skillLabel]).flat();
    let matched = allPools
      .filter(t => isValidTask(t.task, t.expected_output))
      .filter(t => {
        const taskConcept = inferConceptFromTask(t.task);
        return taskConcept === normalizeConcept(concept);
      });

    matched = excludeDuplicate(matched, excludeTask);
    matched = avoidRecentTasks(userId, matched);
    matched = avoidRecentConcepts(userId, matched);

    if (matched.length > 0) {
      const chosen = randomItem(matched);
      return {
        task: chosen.task,
        expected_output: chosen.expected_output,
        test_input: chosen.test_input,
        concept: inferConceptFromTask(chosen.task),
        source: "structured_tasks_concept"
      };
    }
  }

  return null;
}

function chooseDatasetTask(skillLabel, weakness, concept, excludeTask, userId) {
  let pool = getDatasetPool(skillLabel);
  if (!pool.length) return null;

  pool = pool.filter(t => t.is_valid !== false);
  pool = excludeDuplicate(pool, excludeTask);
  pool = avoidRecentTasks(userId, pool);
  pool = avoidRecentConcepts(userId, pool);

  if (concept) {
    const normalizedConcept = normalizeConcept(concept);
    const aliases = conceptAliases[normalizedConcept] || [normalizedConcept];
    pool = pool.filter(t => {
      const taskConcept = (t.concept || "").toLowerCase();
      return aliases.includes(taskConcept);
    });
  }

  if (weakness) {
    pool = pool.filter(t => Array.isArray(t.weakness_target) && t.weakness_target.includes(weakness));
  }

  if (!pool.length) return null;

  const chosen = randomItem(pool);
  const normalizedOutput = normalizeExpectedOutput(chosen.expected_output);

  if (!isValidTask(chosen.task, normalizedOutput)) {
    console.warn(`⚠️ Dataset task rejected at final check: "${chosen.task}"`);
    return null;
  }

  return {
    task: chosen.task,
    expected_output: normalizedOutput,
    test_input: chosen.test_input || "",
    concept: chosen.concept || inferConceptFromTask(chosen.task),
    source: "dataset_fallback"
  };
}

// ─── MAIN ROUTE ──────────────────────────────────────────────────────────
router.post("/generate", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    let {
      student_skill,
      weakness,
      userId,
      learning_mode = "level_up",
      concept = null,
      exclude_task = null
    } = req.body;

    if (!student_skill) {
      return res.status(400).json({ error: "student_skill is required" });
    }

    let progress = null;

    if (userId) {
      try {
        progress = await studentProgress.findOne({ userId });

        if (
          learning_mode === "level_up" &&
          progress?.zpd_boost &&
          progress.skillLevel !== "Advanced"
        ) {
          const skillMap = { Beginner: 3, Intermediate: 5 };
          student_skill = skillMap[progress.skillLevel] || student_skill;
          console.log("⚡ ZPD: elevating task to next level");
        }
      } catch (e) {
        console.warn("⚠️ ZPD check failed:", e.message);
      }
    }

    const skillLabel =
      student_skill <= 2 ? "Beginner" :
      student_skill <= 4 ? "Intermediate" :
      "Advanced";

    let targetConcept = null;

    if (learning_mode === "improve_concept") {
      targetConcept = normalizeConcept(concept);

      if (!targetConcept && weakness) {
        targetConcept = weaknessConceptMap[weakness];
      }

      if (!targetConcept && progress?.targetConcept) {
        targetConcept = normalizeConcept(progress.targetConcept);
      }

      if (!targetConcept && progress) {
        targetConcept = normalizeConcept(getWeakestConcept(progress));
      }
    } else {
      // Level-up mode should not be locked to old concept
      targetConcept = weakness ? weaknessConceptMap[weakness] : null;
    }

    console.log(
      `🎯 Task → skill=${skillLabel}, mode=${learning_mode}, weakness=${weakness || "none"}, concept=${targetConcept || "none"}`
    );

    // STEP 1: Structured tasks
    const structured = chooseStructuredTask(
      skillLabel,
      weakness,
      learning_mode === "improve_concept" ? targetConcept : null,
      exclude_task,
      userId
    );

    if (structured) {
      console.log(`📋 Structured [${skillLabel}]: "${structured.task.substring(0, 60)}"`);
      rememberRecentTask(userId, structured.task);
      rememberConcept(userId, structured.concept);

      return res.json({
        generated_task: structured.task,
        expected_output: structured.expected_output,
        test_input: structured.test_input,
        weakness_target: weakness || null,
        task_level: skillLabel,
        concept: structured.concept,
        learning_mode,
        source: structured.source,
        function_call: extractFunctionCall(structured.task)
      });
    }
    // No weakness — pick randomly from all structured tasks at this level
    if (!weakness && learning_mode === "level_up") {
     const allPools = structuredTasks?.[skillLabel];
    if (allPools) {
    const allTasks = Object.values(allPools).flat();
    const filtered = exclude_task 
      ? allTasks.filter(t => t.task !== exclude_task)
      : allTasks;
    if (filtered.length > 0) {
      const t = filtered[Math.floor(Math.random() * filtered.length)];
      console.log(`📋 Structured [${skillLabel}]: "${t.task.substring(0,50)}"`);
      return res.json({
        generated_task: t.task,
        expected_output: t.expected_output,
        test_input: t.test_input || "",
        weakness_target: null,
        task_level: skillLabel,
        concept: inferConceptFromTask(t.task),
        learning_mode: learning_mode,
        source: "structured_tasks",
        function_call: t.function_call || null
      });
    }
  }
}
    // STEP 2: Gemini
    console.log(`🤖 Gemini [${skillLabel}]`);
    const geminiTask = await generateTaskWithGemini(skillLabel, weakness);

    if (geminiTask && isValidTask(geminiTask.task, geminiTask.expected_output)) {
      const geminiConcept = inferConceptFromTask(geminiTask.task);
      console.log(`✅ Gemini [${skillLabel}]: "${geminiTask.task.substring(0, 60)}"`);

      rememberRecentTask(userId, geminiTask.task);
      rememberConcept(userId, geminiConcept);

      return res.json({
        generated_task: geminiTask.task,
        expected_output: geminiTask.expected_output,
        test_input: geminiTask.test_input,
        weakness_target: weakness || null,
        task_level: skillLabel,
        concept: geminiConcept,
        learning_mode,
        source: "gemini",
        function_call: geminiTask.function_call || extractFunctionCall(geminiTask.task)
      });
    }

    if (geminiTask) {
      console.warn("⚠️ Gemini task rejected by validator — trying dataset fallback");
    }

    // STEP 3: Dataset fallback (concept mode only)
    let datasetTask = null;

    if (learning_mode === "improve_concept") {
      datasetTask = chooseDatasetTask(
        skillLabel,
        weakness,
        targetConcept,
        exclude_task,
        userId
      );
    }

    if (datasetTask) {
      console.log(`📚 Dataset [${skillLabel}]: "${datasetTask.task.substring(0, 60)}"`);
      rememberRecentTask(userId, datasetTask.task);
      rememberConcept(userId, datasetTask.concept);

      return res.json({
        generated_task: datasetTask.task,
        expected_output: datasetTask.expected_output,
        test_input: datasetTask.test_input,
        weakness_target: weakness || null,
        task_level: skillLabel,
        concept: datasetTask.concept,
        learning_mode,
        source: datasetTask.source,
        function_call: extractFunctionCall(datasetTask.task)
      });
    }

    // STEP 4: Hardcoded fallback
    console.log(`⚠️ Hardcoded fallback [${skillLabel}]`);
    let fallbackPool = fallbackTasks[skillLabel] || fallbackTasks.Beginner;

    if (targetConcept) {
      const matched = fallbackPool.filter(t => t.concept === targetConcept);
      if (matched.length > 0) fallbackPool = matched;
    }

    fallbackPool = excludeDuplicate(fallbackPool, exclude_task);
    fallbackPool = avoidRecentTasks(userId, fallbackPool);
    fallbackPool = avoidRecentConcepts(userId, fallbackPool);

    const fallback = randomItem(fallbackPool);

    rememberRecentTask(userId, fallback.task);
    rememberConcept(userId, fallback.concept);

    return res.json({
      generated_task: fallback.task,
      expected_output: fallback.expected_output,
      test_input: fallback.test_input || "",
      weakness_target: weakness || null,
      task_level: skillLabel,
      concept: fallback.concept || inferConceptFromTask(fallback.task),
      learning_mode,
      source: "hardcoded_fallback",
      function_call: extractFunctionCall(fallback.task)
    });

  } catch (error) {
    console.error("❌ Task generation failed:", error);
    res.status(500).json({ error: "Task generation failed", details: error.message });
  }
});

export default router;
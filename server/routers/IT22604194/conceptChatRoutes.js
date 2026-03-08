// ═══════════════════════════════════════════════════════════════════════════
//  OPTICODE — Concept Tutor Route
//  File: server/routes/IT22604194/conceptChatRoutes.js
//
//  Endpoints:
//    POST /api/concept-chat/start   → returns 5 ordered tasks for a concept
//    GET  /api/concept-chat/concepts/:skillLevel → returns available concepts
// ═══════════════════════════════════════════════════════════════════════════

import express from "express";
import StudentProgress from "../../models/IT22604194/StudentProgress.js";

const router = express.Router();

// ─── ORDERED CONCEPT TASK PATHS ───────────────────────────────────────────
// 5 tasks per concept per level, ordered easy → hard
const CONCEPT_PATHS = {
  Beginner: {
    loops: [
      { task: "Print numbers from 1 to 5 using a for loop.", test_input: "", expected_output: "1\n2\n3\n4\n5", hint: "Use range(1, 6) inside a for loop." },
      { task: "Print even numbers from 2 to 8 using a for loop.", test_input: "", expected_output: "2\n4\n6\n8", hint: "Use range(2, 9, 2) to step by 2." },
      { task: "Print numbers from 5 down to 1 using a for loop.", test_input: "", expected_output: "5\n4\n3\n2\n1", hint: "Use range(5, 0, -1) to count down." },
      { task: "Print the letters in the word 'cat' each on a new line.", test_input: "", expected_output: "c\na\nt", hint: "You can loop over a string directly: for char in 'cat'." },
      { task: "Use a loop to print the multiplication table of 3 from 1 to 5.", test_input: "", expected_output: "3\n6\n9\n12\n15", hint: "Loop from 1 to 5 and print 3 * i each time." }
    ],
    functions: [
      { task: "Write a function add(a, b) that returns a+b. Print add(3, 4).", test_input: "", expected_output: "7", hint: "Use def add(a, b): return a + b" },
      { task: "Write a function double(n) that returns double of n. Print double(5).", test_input: "", expected_output: "10", hint: "Return n * 2 inside the function." },
      { task: "Write a function square(n) that returns n*n. Print square(6).", test_input: "", expected_output: "36", hint: "Return n ** 2 inside the function." },
      { task: "Write a function subtract(a, b) that returns a-b. Print subtract(10, 3).", test_input: "", expected_output: "7", hint: "Return a - b inside the function." },
      { task: "Write a function greet(name) that prints Hello name. Call greet('Sam').", test_input: "", expected_output: "Hello Sam", hint: "Use print('Hello', name) inside the function." }
    ],
    math: [
      { task: "Print the sum of 5 and 10.", test_input: "", expected_output: "15", hint: "Use print(5 + 10)." },
      { task: "Print the result of 3 multiplied by 4.", test_input: "", expected_output: "12", hint: "Use the * operator." },
      { task: "Print the result of 2 raised to the power of 5.", test_input: "", expected_output: "32", hint: "Use ** for exponentiation: 2 ** 5." },
      { task: "Print the remainder of 17 divided by 5.", test_input: "", expected_output: "2", hint: "Use the % (modulo) operator." },
      { task: "Store 6 and 7 in variables a and b, then print their product.", test_input: "", expected_output: "42", hint: "Assign a = 6, b = 7, then print(a * b)." }
    ],
    conditionals: [
      { task: "Print True if 5 is greater than 3, otherwise print False.", test_input: "", expected_output: "True", hint: "Use print(5 > 3)." },
      { task: "Check if 10 is greater than 5. Print Yes or No.", test_input: "", expected_output: "Yes", hint: "Use an if/else statement." },
      { task: "Print Even if 8 is even, otherwise print Odd.", test_input: "", expected_output: "Even", hint: "Use 8 % 2 == 0 as the condition." },
      { task: "Check if 15 is divisible by 3. Print Yes or No.", test_input: "", expected_output: "Yes", hint: "Use 15 % 3 == 0 as the condition." },
      { task: "Print Positive if 7 is positive, Negative if it is negative, Zero if it is zero.", test_input: "", expected_output: "Positive", hint: "Use if/elif/else with comparisons to 0." }
    ],
    strings: [
      { task: "Store the word Python in a variable and print it.", test_input: "", expected_output: "Python", hint: "Assign name = 'Python' then print(name)." },
      { task: "Print the length of the word hello.", test_input: "", expected_output: "5", hint: "Use print(len('hello'))." },
      { task: "Print the first letter of the word 'apple'.", test_input: "", expected_output: "a", hint: "Use string indexing: 'apple'[0]." },
      { task: "Print the string 'hello' in uppercase.", test_input: "", expected_output: "HELLO", hint: "Use the .upper() method." },
      { task: "Print the string 'WORLD' in lowercase.", test_input: "", expected_output: "world", hint: "Use the .lower() method." }
    ],
    variables: [
      { task: "Create a variable x = 10 and print it.", test_input: "", expected_output: "10", hint: "Assign x = 10 then print(x)." },
      { task: "Create a variable name = 'Alice' and print it.", test_input: "", expected_output: "Alice", hint: "Assign name = 'Alice' then print(name)." },
      { task: "Create two variables x=5 and y=3 and print their sum.", test_input: "", expected_output: "8", hint: "print(x + y) after assigning both." },
      { task: "Create a variable pi = 3.14 and print it.", test_input: "", expected_output: "3.14", hint: "Assign pi = 3.14 then print(pi)." },
      { task: "Swap two variables a=5 and b=10 and print b then a.", test_input: "", expected_output: "10\n5", hint: "Use a, b = b, a to swap, then print each." }
    ]
  },

  Intermediate: {
    loops: [
      { task: "Use a while loop to print numbers from 5 down to 1.", test_input: "", expected_output: "5\n4\n3\n2\n1", hint: "Start at 5, loop while i >= 1, decrement inside." },
      { task: "Print even numbers from 2 to 10 using a loop.", test_input: "", expected_output: "2\n4\n6\n8\n10", hint: "Use range(2, 11, 2) or check i % 2 == 0." },
      { task: "Print numbers from 1 to 10 that are not divisible by 3.", test_input: "", expected_output: "1\n2\n4\n5\n7\n8\n10", hint: "Use if i % 3 != 0 inside the loop." },
      { task: "Use a loop to compute and print the product of 1 to 5.", test_input: "", expected_output: "120", hint: "Start product = 1, multiply each i from 1 to 5." },
      { task: "Print the multiplication table of 7 from 1 to 10.", test_input: "", expected_output: "7\n14\n21\n28\n35\n42\n49\n56\n63\n70", hint: "Loop from 1 to 10 and print 7 * i each iteration." }
    ],
    functions: [
      { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", test_input: "", expected_output: "True", hint: "Return n % 2 == 0 inside the function." },
      { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(3, 7).", test_input: "", expected_output: "7", hint: "Use if/else or Python's built-in comparison." },
      { task: "Write a function multiply(a, b) that returns a*b. Print multiply(6, 7).", test_input: "", expected_output: "42", hint: "Return a * b inside the function." },
      { task: "Write a function sum_list(lst) that returns the sum. Print sum_list([1,2,3,4,5]).", test_input: "", expected_output: "15", hint: "Use Python's built-in sum() or a loop." },
      { task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').", test_input: "", expected_output: "True", hint: "Compare s == s[::-1]." }
    ],
    lists: [
      { task: "Compute the sum of [1,2,3,4,5] using sum() and print it.", test_input: "", expected_output: "15", hint: "print(sum([1,2,3,4,5]))" },
      { task: "Compute the maximum of [3,7,2,9,1] and print it.", test_input: "", expected_output: "9", hint: "print(max([3,7,2,9,1]))" },
      { task: "Sort the list [5,2,8,1,9] and print it.", test_input: "", expected_output: "[1, 2, 5, 8, 9]", hint: "Use sorted() or .sort() then print." },
      { task: "Reverse the list [1,2,3,4,5] and print it.", test_input: "", expected_output: "[5, 4, 3, 2, 1]", hint: "Use [::-1] slicing or .reverse()." },
      { task: "Write a list comprehension returning squares of 1 to 4 and print it.", test_input: "", expected_output: "[1, 4, 9, 16]", hint: "Use [x**2 for x in range(1, 5)]." }
    ],
    strings: [
      { task: "Compute the length of the string 'hello world' and print it.", test_input: "", expected_output: "11", hint: "Use len('hello world')." },
      { task: "Print the string 'Hello World' in uppercase.", test_input: "", expected_output: "HELLO WORLD", hint: "Use .upper() method." },
      { task: "Count the number of vowels in 'hello world' and print the count.", test_input: "", expected_output: "3", hint: "Loop through each char and check if it's in 'aeiou'." },
      { task: "Check if 'racecar' is a palindrome and print True or False.", test_input: "", expected_output: "True", hint: "Compare s == s[::-1]." },
      { task: "Replace all spaces in 'hello world' with underscores and print.", test_input: "", expected_output: "hello_world", hint: "Use .replace(' ', '_')." }
    ],
    recursion: [
      { task: "Write a recursive function to sum numbers from 1 to n. Print sum_to(4).", test_input: "", expected_output: "10", hint: "Base case: if n == 0 return 0. Else return n + sum_to(n-1)." },
      { task: "Write a recursive function count_down(n) that prints from n to 1. Call count_down(5).", test_input: "", expected_output: "5\n4\n3\n2\n1", hint: "Base case: if n < 1 return. Else print n then call count_down(n-1)." },
      { task: "Write a recursive function to compute factorial of 5. Print the result.", test_input: "", expected_output: "120", hint: "Base case: if n == 1 return 1. Else return n * factorial(n-1)." },
      { task: "Write a recursive function reverse(s). Print reverse('hello').", test_input: "", expected_output: "olleh", hint: "Base case: if len(s) == 0 return ''. Else return s[-1] + reverse(s[:-1])." },
      { task: "Write a recursive function to compute the 6th Fibonacci number. Print it.", test_input: "", expected_output: "8", hint: "fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)." }
    ]
  },

  Advanced: {
    recursion: [
      { task: "Write a recursive power function. Print power(2, 8).", test_input: "", expected_output: "256", hint: "Base case: power(base, 0) = 1. Else return base * power(base, exp-1)." },
      { task: "Write a recursive function to compute the nth Fibonacci. Print fib(10).", test_input: "", expected_output: "55", hint: "fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)." },
      { task: "Write a recursive function sum_digits(n). Print sum_digits(1234).", test_input: "", expected_output: "10", hint: "Base case: if n < 10 return n. Else return n%10 + sum_digits(n//10)." },
      { task: "Write a recursive function reverse(s). Print reverse('python').", test_input: "", expected_output: "nohtyp", hint: "Return the last char + reverse of remaining string." },
      { task: "Write a recursive function to compute factorial(7). Print the result.", test_input: "", expected_output: "5040", hint: "Base: factorial(1)=1. Recursive: n * factorial(n-1)." }
    ],
    algorithm: [
      { task: "Print all prime numbers between 1 and 20.", test_input: "", expected_output: "2\n3\n5\n7\n11\n13\n17\n19", hint: "For each number, check if any divisor from 2 to sqrt(n) divides it." },
      { task: "Binary search for 7 in [1,3,5,7,9]. Print the index.", test_input: "", expected_output: "3", hint: "Use low=0, high=len-1, mid=(low+high)//2 and compare." },
      { task: "Implement bubble sort and print the sorted version of [5,3,8,1,2].", test_input: "", expected_output: "[1, 2, 3, 5, 8]", hint: "Nested loops: compare adjacent pairs and swap if out of order." },
      { task: "Write a function second_largest(lst). Print second_largest([3,1,9,7,5]).", test_input: "", expected_output: "7", hint: "Sort descending and take index 1, or track top-2 in one pass." },
      { task: "Write a function prime_factors(n). Print prime_factors(60).", test_input: "", expected_output: "[2, 2, 3, 5]", hint: "Divide by 2 first, then odd numbers up to sqrt(n)." }
    ],
    oop: [
      { task: "Write a class Rectangle with width=4 and height=5. Print its area.", test_input: "", expected_output: "20", hint: "Define __init__(self, w, h) and an area() method returning w*h." },
      { task: "Write a class Circle with radius=7. Print its area rounded to 2 decimals.", test_input: "", expected_output: "153.94", hint: "Area = math.pi * r ** 2. Use round(..., 2)." },
      { task: "Write a class Animal with a speak method returning 'Roar'. Print Animal().speak().", test_input: "", expected_output: "Roar", hint: "Define speak(self) that returns 'Roar'." },
      { task: "Write a class Stack with push and pop methods. Push 1,2,3 then pop and print.", test_input: "", expected_output: "3", hint: "Use a list inside the class. push appends, pop removes from end." },
      { task: "Write a class Counter with increment and get_count methods. Increment 5 times and print the count.", test_input: "", expected_output: "5", hint: "Store count as self.count, increment adds 1, get_count returns it." }
    ],
    lists: [
      { task: "Compute and print the dot product of [1,2,3] and [4,5,6].", test_input: "", expected_output: "32", hint: "Sum of a[i]*b[i] for each index i." },
      { task: "Write a function rotate(lst, k). Print rotate([1,2,3,4,5],2).", test_input: "", expected_output: "[3, 4, 5, 1, 2]", hint: "Return lst[k:] + lst[:k]." },
      { task: "Find and print all factors of 36.", test_input: "", expected_output: "1\n2\n3\n4\n6\n9\n12\n18\n36", hint: "Loop from 1 to n+1 and check if i divides n evenly." },
      { task: "Write a function flatten(lst). Print flatten([[1,2],[3,4]]).", test_input: "", expected_output: "[1, 2, 3, 4]", hint: "Use a list comprehension or nested loop to combine sublists." },
      { task: "Write a function is_anagram(a,b). Print is_anagram('listen','silent').", test_input: "", expected_output: "True", hint: "Compare sorted(a) == sorted(b)." }
    ]
  }
};

const AVAILABLE_CONCEPTS = {
  Beginner: ["loops", "functions", "math", "conditionals", "strings", "variables"],
  Intermediate: ["loops", "functions", "lists", "strings", "recursion"],
  Advanced: ["recursion", "algorithm", "oop", "lists"]
};

// ─── GET AVAILABLE CONCEPTS FOR A SKILL LEVEL ────────────────────────────
router.get("/concepts/:skillLevel", (req, res) => {
  const { skillLevel } = req.params;
  const concepts = AVAILABLE_CONCEPTS[skillLevel];

  if (!concepts) {
    return res.status(400).json({ error: "Invalid skill level" });
  }

  res.json({ skillLevel, concepts });
});

// ─── START A CONCEPT SESSION ──────────────────────────────────────────────
router.post("/start", async (req, res) => {
  try {
    const { userId, concept } = req.body;

    if (!concept) {
      return res.status(400).json({ error: "concept is required" });
    }

    // Get student's actual skill level from DB
    let skillLevel = "Beginner";
    if (userId) {
      try {
        const progress = await StudentProgress.findOne({ userId });
        if (progress?.skillLevel) skillLevel = progress.skillLevel;
      } catch (e) {
        console.warn("Could not fetch student skill level:", e.message);
      }
    }

    const normalizedConcept = concept.toLowerCase().trim();
    const available = AVAILABLE_CONCEPTS[skillLevel] || [];

    if (!available.includes(normalizedConcept)) {
      return res.status(404).json({
        error: `Concept '${normalizedConcept}' not available for ${skillLevel} level`,
        availableConcepts: available
      });
    }

    const tasks = CONCEPT_PATHS[skillLevel]?.[normalizedConcept];

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found for this concept" });
    }

    console.log(`📘 Concept session: userId=${userId}, concept=${normalizedConcept}, level=${skillLevel}`);

    res.json({
      concept: normalizedConcept,
      skillLevel,
      totalTasks: tasks.length,
      tasks: tasks.map((t, i) => ({
        index: i,
        task: t.task,
        test_input: t.test_input,
        expected_output: t.expected_output,
        hint: t.hint,
        difficulty: i < 2 ? "easy" : i < 4 ? "medium" : "hard"
      }))
    });

  } catch (err) {
    console.error("Concept chat start error:", err);
    res.status(500).json({ error: "Failed to start concept session" });
  }
});

export default router;

// questions.js
// 30 questions mapped to 6 categories (5 each) with options

const questions = [
  // Foundational Coding (1-5)
  {
    id: 1,
    question: "How comfortable are you with writing basic code without help?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 2,
    question: "How well do you understand variables?",
    options: ["Not at all", "Basic understanding", "Some understanding", "Good understanding", "Expert"],
  },
  {
    id: 3,
    question: "How well do you understand basic data types?",
    options: ["Not at all", "Basic understanding", "Some understanding", "Good understanding", "Expert"],
  },
  {
    id: 4,
    question: "How comfortable are you with writing conditional statements (if/else)?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 5,
    question: "How well do you understand loops (for/while)?",
    options: ["Not at all", "Basic understanding", "Some understanding", "Good understanding", "Expert"],
  },

  // Problem Solving (6-10)
  {
    id: 6,
    question: "How comfortable are you breaking a complex question into small steps?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 7,
    question: "How good are you at finding patterns in problems?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 8,
    question: "How confident are you solving logic-based tasks?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 9,
    question: "How comfortable are you debugging broken code?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 10,
    question: "How good are you at identifying edge cases?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },

  // Workflow (11-15)
  {
    id: 11,
    question: "How comfortable are you planning before coding?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 12,
    question: "How well do you organize your code (structure/formatting)?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 13,
    question: "How comfortable are you writing reusable functions?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 14,
    question: "How well do you test your programs?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 15,
    question: "How comfortable are you reading other people’s code?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },

  // Tools (16-20)
  {
    id: 16,
    question: "How comfortable are you using a code editor (e.g. VS Code)?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 17,
    question: "How comfortable are you using version control (Git)?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 18,
    question: "How comfortable are you installing libraries/frameworks?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"],
  },
  {
    id: 19,
    question: "How well do you understand packages/modules?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 20,
    question: "How confident are you debugging using built-in tools?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },

  // Computational Thinking (21-25)
  {
    id: 21,
    question: "How well do you understand algorithms?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 22,
    question: "How confident are you focusing on optimal solutions?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 23,
    question: "How well do you think logically/procedurally?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 24,
    question: "How well do you understand data structures?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },
  {
    id: 25,
    question: "How good are you working with patterns & abstraction?",
    options: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  },

  // Confidence (26-30)
  {
    id: 26,
    question: "How confident are you when writing code alone?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 27,
    question: "How confident are you sharing your code with others?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 28,
    question: "How confident are you learning new programming concepts?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 29,
    question: "How confident are you solving new/unfamiliar challenges?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
  {
    id: 30,
    question: "How confident are you completing a programming task independently?",
    options: ["Not confident", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
  },
];

export default questions;

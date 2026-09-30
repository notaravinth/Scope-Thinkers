import type { Question } from "../types/quiz";

export const questions: Question[] = [
  {
    id: 1,
    question: "Which keyword declares a constant in JavaScript?",
    options: ["var", "let", "const", "static"],
    correctAnswer: "const",
    category: "JavaScript",
  },
  {
    id: 2,
    question: "Which TypeScript type allows either a string or a number?",
    options: [
      "string & number",
      "string | number",
      "string[]",
      "string || number",
    ],
    correctAnswer: "string | number",
    category: "TypeScript",
  },
  {
    id: 3,
    question: "Which keyword is used to define an interface in TypeScript?",
    options: ["type", "interface", "struct", "shape"],
    correctAnswer: "interface",
    category: "TypeScript",
  },
  {
    id: 4,
    question: "Which method converts JSON text into a JavaScript object?",
    options: [
      "JSON.stringify()",
      "JSON.parse()",
      "JSON.convert()",
      "JSON.object()",
    ],
    correctAnswer: "JSON.parse()",
    category: "JavaScript",
  },
  {
    id: 5,
    question: "What does TypeScript primarily provide?",
    options: [
      "A new JavaScript runtime",
      "Static type checking",
      "A database system",
      "A browser engine",
    ],
    correctAnswer: "Static type checking",
    category: "TypeScript",
  },
  {
    id: 6,
    question: "Which React hook is used to manage local component state?",
    options: ["useEffect", "useState", "useMemo", "useRef"],
    correctAnswer: "useState",
    category: "React",
  },
  {
    id: 7,
    question: "What does the === operator check?",
    options: [
      "Only value",
      "Only type",
      "Value and type",
      "Reference only",
    ],
    correctAnswer: "Value and type",
    category: "JavaScript",
  },
  {
    id: 8,
    question: "Which TypeScript feature allows a variable to have multiple possible types?",
    options: [
      "Union type",
      "Tuple",
      "Enum",
      "Namespace",
    ],
    correctAnswer: "Union type",
    category: "TypeScript",
  },
  {
    id: 9,
    question: "Which hook runs side effects in a React component?",
    options: ["useState", "useContext", "useEffect", "useReducer"],
    correctAnswer: "useEffect",
    category: "React",
  },
  {
    id: 10,
    question: "What does Array.map() return?",
    options: [
      "The original array only",
      "A new array",
      "A boolean",
      "A single value",
    ],
    correctAnswer: "A new array",
    category: "JavaScript",
  },
];
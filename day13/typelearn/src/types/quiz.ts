export type Category = "JavaScript" | "TypeScript" | "React";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: Category;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
}
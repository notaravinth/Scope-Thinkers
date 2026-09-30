import { useState } from "react";
import { questions } from "../data/questions";
import type { QuizResult } from "../types/quiz";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import Results from "./Results";

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setScore((previousScore) => previousScore + 1);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      return;
    }

    const isLastQuestion =
      currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      const finalScore =
        score +
        (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);

      const finalResult: QuizResult = {
        score: finalScore,
        totalQuestions: questions.length,
        percentage: Math.round(
          (finalScore / questions.length) * 100
        ),
      };

      setResult(finalResult);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer(null);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setResult(null);
  };

  if (result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          <Results result={result} onRestart={handleRestart} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              TypeScript Quiz
            </p>

            <h1 className="mt-2 text-xl font-semibold text-white">
              Test your knowledge
            </h1>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Score: {score}
          </div>
        </div>

        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
        />

        <div className="mt-10">
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
          />
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            disabled={selectedAnswer === null}
            onClick={handleNext}
            className="rounded-2xl bg-white px-7 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {currentQuestionIndex === questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Quiz;
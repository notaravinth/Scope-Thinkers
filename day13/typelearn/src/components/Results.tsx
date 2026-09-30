import type { QuizResult } from "../types/quiz";

interface ResultsProps {
  result: QuizResult;
  onRestart: () => void;
}

const Results = ({ result, onRestart }: ResultsProps) => {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl">
        ✓
      </div>

      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Quiz Complete
      </p>

      <h2 className="mt-3 text-4xl font-bold text-white">
        {result.score} / {result.totalQuestions}
      </h2>

      <p className="mt-3 text-slate-400">
        You scored {result.percentage}%
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 rounded-2xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
      >
        Try Again
      </button>
    </div>
  );
};

export default Results;
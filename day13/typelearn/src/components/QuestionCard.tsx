import type { Question } from "../types/quiz";
import AnswerOption from "./AnswerOption";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

const QuestionCard = ({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) => {
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
          {question.category}
        </span>

        <h2 className="mt-5 text-2xl font-semibold leading-relaxed text-white sm:text-3xl">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option}
            option={option}
            selectedAnswer={selectedAnswer}
            correctAnswer={question.correctAnswer}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
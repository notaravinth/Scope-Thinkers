interface AnswerOptionProps {
  option: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  onSelect: (option: string) => void;
}

const AnswerOption = ({
  option,
  selectedAnswer,
  correctAnswer,
  onSelect,
}: AnswerOptionProps) => {
  const isSelected = selectedAnswer === option;
  const isCorrect = option === correctAnswer;
  const showResult = selectedAnswer !== null;

  let styles =
    "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20";

  if (showResult && isCorrect) {
    styles = "border-emerald-400/50 bg-emerald-400/10 text-emerald-300";
  } else if (showResult && isSelected && !isCorrect) {
    styles = "border-red-400/50 bg-red-400/10 text-red-300";
  } else if (isSelected) {
    styles = "border-violet-400/50 bg-violet-400/10";
  }

  return (
    <button
      type="button"
      disabled={showResult}
      onClick={() => onSelect(option)}
      className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${styles} ${
        showResult ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm ${
            isSelected ? "bg-white/10" : "bg-white/5"
          }`}
        >
          {String.fromCharCode(65 + ["A", "B", "C", "D"].indexOf(option))}
        </div>

        <span>{option}</span>
      </div>
    </button>
  );
};

export default AnswerOption;
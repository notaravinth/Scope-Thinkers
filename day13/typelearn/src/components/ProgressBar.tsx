interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = (current / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-slate-400">
        <span>
          Question {current} / {total}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
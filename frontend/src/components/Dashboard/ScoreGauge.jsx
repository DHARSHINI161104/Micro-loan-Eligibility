export default function ScoreGauge({ score }) {
  const getScoreColor = () => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Low';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getScoreColor() }}>
          {score}
        </span>
        <span className="text-sm text-slate-500">out of 100</span>
        <span
          className="text-sm font-semibold px-2 py-0.5 rounded mt-1"
          style={{ backgroundColor: getScoreColor() + '20', color: getScoreColor() }}
        >
          {getScoreLabel()}
        </span>
      </div>
    </div>
  );
}

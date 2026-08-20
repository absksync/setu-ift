import React from 'react';

interface MEOWSBadgeProps {
  riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MEOWSBadge: React.FC<MEOWSBadgeProps> = ({
  riskLevel,
  score,
  showScore = true,
  size = 'md',
}) => {
  const isHigh = riskLevel === 'HIGH RISK';
  const isMedium = riskLevel === 'MEDIUM RISK';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-semibold',
  }[size];

  let colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let dotClass = 'bg-emerald-500';

  if (isHigh) {
    colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 high-risk-pulse';
    dotClass = 'bg-rose-500';
  } else if (isMedium) {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    dotClass = 'bg-amber-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClass} ${isHigh ? 'animate-ping' : ''}`} />
      <span>{riskLevel}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 text-xs font-bold rounded-md bg-black/10 dark:bg-white/10">
          Score: {score}
        </span>
      )}
    </span>
  );
};

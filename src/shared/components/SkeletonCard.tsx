interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className = '',
  showHeader = true,
  showContent = true,
  lines = 3
}: SkeletonCardProps) {
  return (
    <div className={`rounded-panel border border-edubot-line/80 bg-white/90 shadow-edubot-card ${className}`}>
      {showHeader && (
        <div className="border-b border-edubot-line/80 px-6 py-5">
          <div className="h-6 animate-shimmer rounded bg-slate-200" style={{ width: '40%' }} />
        </div>
      )}
      {showContent && (
        <div className="space-y-3 px-6 py-5">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-shimmer rounded bg-slate-200"
              style={{ width: i === lines - 1 ? '70%' : '100%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

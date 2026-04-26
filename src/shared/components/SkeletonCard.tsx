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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-shimmer" style={{ width: '40%' }} />
        </div>
      )}
      {showContent && (
        <div className="px-6 py-4 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded animate-shimmer"
              style={{ width: i === lines - 1 ? '70%' : '100%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

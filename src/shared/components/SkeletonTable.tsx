interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className = ''
}: SkeletonTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-edubot-line">
        <thead className="bg-edubot-surfaceAlt/80">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                className="px-6 py-3 text-left"
              >
                <div className="h-4 animate-shimmer rounded bg-slate-200" style={{ width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edubot-line bg-white/80">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  <div 
                    className="h-4 animate-shimmer rounded bg-slate-200"
                    style={{ width: colIndex === columns - 1 ? '40%' : '70%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

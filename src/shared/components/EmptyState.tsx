import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-edubot-orange/10 ring-1 ring-edubot-orange/15">
          <Icon className="h-8 w-8 text-edubot-orange" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-edubot-dark">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-edubot-muted">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="dashboard-button-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

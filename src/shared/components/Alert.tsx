import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  title?: string;
}

export function Alert({ children, variant = 'info', className = '', title }: AlertProps) {
  const styles = {
    success: {
      wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: 'text-emerald-600',
      Icon: CheckCircle2,
    },
    error: {
      wrapper: 'border-red-200 bg-red-50 text-red-800',
      icon: 'text-red-600',
      Icon: AlertCircle,
    },
    warning: {
      wrapper: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: 'text-amber-600',
      Icon: TriangleAlert,
    },
    info: {
      wrapper: 'border-sky-200 bg-sky-50 text-sky-800',
      icon: 'text-sky-600',
      Icon: Info,
    },
  };

  const { wrapper, icon, Icon } = styles[variant];

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${wrapper} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
        <div className="min-w-0">
          {title ? <p className="mb-1 font-medium">{title}</p> : null}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

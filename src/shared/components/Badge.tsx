import { Check, AlertTriangle, X, Info, Minus } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  showIcon?: boolean;
}

export function Badge({ children, variant = 'neutral', className = '', showIcon = true }: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  };

  const variantIcons = {
    success: Check,
    warning: AlertTriangle,
    danger: X,
    info: Info,
    neutral: Minus,
  };

  const Icon = variantIcons[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

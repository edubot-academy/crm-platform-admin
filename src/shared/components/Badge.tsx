import React from 'react';
import { Check, AlertTriangle, X, Info, Minus } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  showIcon?: boolean;
}

export function Badge({ children, variant = 'neutral', className = '', showIcon = true }: BadgeProps) {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
}

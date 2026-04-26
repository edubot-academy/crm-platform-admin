import type { LucideIcon } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconOnly = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50';

  const variantStyles = {
    primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus:ring-[#2563eb] shadow-sm hover:shadow-md',
    secondary: 'bg-[#e5e7eb] text-[#000000] hover:bg-[#d1d5db] focus:ring-[#6b7280]',
    danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] focus:ring-[#dc2626] shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-[#000000] hover:bg-[#f3f4f6] focus:ring-[#6b7280]',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-1.5' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2' : 'px-4 py-2 text-sm',
    lg: iconOnly ? 'p-3' : 'px-6 py-3 text-base',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isDisabled = disabled || loading;

  const spinnerColor = variant === 'primary' || variant === 'danger' ? 'white' : 'currentColor';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} color={spinnerColor} />
      ) : (
        <>
          {LeftIcon && !iconOnly && <LeftIcon className={`${iconSize[size]} mr-2`} />}
          {iconOnly ? (
            LeftIcon ? (
              <LeftIcon className={iconSize[size]} />
            ) : RightIcon ? (
              <RightIcon className={iconSize[size]} />
            ) : (
              children
            )
          ) : (
            children
          )}
          {RightIcon && !iconOnly && <RightIcon className={`${iconSize[size]} ml-2`} />}
        </>
      )}
    </button>
  );
}

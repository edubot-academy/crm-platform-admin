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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-primary-200/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 active:scale-[0.99]';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft hover:-translate-y-0.5 hover:shadow-edubot-hover-soft',
    secondary: 'border border-edubot-line bg-white/85 text-edubot-ink shadow-sm hover:-translate-y-0.5 hover:border-edubot-orange/50 hover:text-edubot-orange hover:shadow-edubot-soft',
    danger: 'bg-edubot-danger text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg focus:ring-red-200',
    ghost: 'bg-transparent text-edubot-ink hover:bg-edubot-orange/10 hover:text-edubot-orange',
  };

  const sizeStyles = {
    sm: iconOnly ? 'h-9 w-9 p-0' : 'px-3 py-2 text-sm',
    md: iconOnly ? 'h-10 w-10 p-0' : 'px-4 py-2.5 text-sm',
    lg: iconOnly ? 'h-12 w-12 p-0' : 'px-5 py-3 text-base',
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
          {LeftIcon && !iconOnly && <LeftIcon className={iconSize[size]} />}
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
          {RightIcon && !iconOnly && <RightIcon className={iconSize[size]} />}
        </>
      )}
    </button>
  );
}

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  fullWidth?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className = '', elevation = 'sm', hoverable = false, fullWidth = false, ...props },
  ref
) {
  const elevationStyles = {
    none: 'shadow-none',
    sm: 'shadow-edubot-card',
    md: 'shadow-lg',
    lg: 'shadow-edubot-hover',
    xl: 'shadow-2xl',
  };

  return (
    <div
      ref={ref}
      className={`rounded-panel border border-edubot-line/80 bg-white/90 ${elevationStyles[elevation]} ${hoverable ? 'hover:-translate-y-1 hover:shadow-edubot-hover transition-all duration-300 ease-out' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 border-b border-edubot-line/80 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

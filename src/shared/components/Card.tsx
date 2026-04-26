interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  fullWidth?: boolean;
}

export function Card({ children, className = '', elevation = 'sm', hoverable = false, fullWidth = false }: CardProps) {
  const elevationStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${elevationStyles[elevation]} ${hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`mb-6 flex flex-col gap-4 md:flex-row md:items-center ${className}`}>
      {children}
    </div>
  );
}

interface FilterBarItemProps {
  children: ReactNode;
  grow?: boolean;
  widthClassName?: string;
  className?: string;
}

export function FilterBarItem({ children, grow = false, widthClassName = '', className = '' }: FilterBarItemProps) {
  return <div className={`${grow ? 'flex-1' : ''} ${widthClassName} ${className}`.trim()}>{children}</div>;
}

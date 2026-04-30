import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, eyebrow, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1 className="app-heading">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-edubot-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto lg:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';

interface SectionIntroProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  titleId?: string;
  descriptionId?: string;
}

export function SectionIntro({ title, description, actions, className = '', titleId, descriptionId }: SectionIntroProps) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-start md:justify-between ${className}`}>
      <div className="min-w-0">
        <h2 id={titleId} className="text-lg font-semibold text-edubot-dark">{title}</h2>
        {description ? <p id={descriptionId} className="mt-1 text-sm text-edubot-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}

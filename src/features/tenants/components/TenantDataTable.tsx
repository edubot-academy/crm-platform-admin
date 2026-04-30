import type { ReactNode } from 'react';

interface TenantDataTableProps {
  headers: string[];
  children: ReactNode;
}

export function TenantDataTable({ headers, children }: TenantDataTableProps) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-edubot-line">
      <table className="min-w-full divide-y divide-edubot-line">
        <thead className="bg-edubot-surfaceAlt/80">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-edubot-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edubot-line bg-white/80">{children}</tbody>
      </table>
    </div>
  );
}

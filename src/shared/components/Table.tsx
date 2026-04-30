import { useState, type Key, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Check } from 'lucide-react';

type RowRecord = object;

interface TableColumn<T extends RowRecord> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T extends RowRecord> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  stickyHeader?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  emptyMessage?: string;
  responsive?: boolean;
  rowKey?: keyof T | ((row: T, index: number) => Key);
  onRowClick?: (row: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T extends RowRecord>({
  columns,
  data,
  className = '',
  stickyHeader = false,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Маалымат жок',
  responsive = true,
  rowKey,
  onRowClick,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<Key>>(new Set());

  const resolveRowKey = (row: T, index: number): Key => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }

    if (rowKey) {
      return (row as Record<string, unknown>)[String(rowKey)] as Key;
    }

    if ('id' in row) {
      return (row as { id?: Key }).id ?? index;
    }

    return index;
  };

  const sortedData = (() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];

      if (aVal === bVal) return 0;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return 0;
    });
  })();

  const sortedRowKeys = sortedData.map((row, index) => resolveRowKey(row, index));

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
      return;
    }

    setSortColumn(key);
    setSortDirection('asc');
  };

  const emitSelection = (nextSelection: Set<Key>) => {
    if (!onSelectionChange) return;

    const selectedData = sortedData.filter((_row, index) =>
      sortedRowKeys[index] !== undefined && nextSelection.has(sortedRowKeys[index])
    );
    onSelectionChange(selectedData);
  };

  const handleRowSelect = (rowKeyValue: Key) => {
    const nextSelection = new Set(selectedRows);

    if (nextSelection.has(rowKeyValue)) {
      nextSelection.delete(rowKeyValue);
    } else {
      nextSelection.add(rowKeyValue);
    }

    setSelectedRows(nextSelection);
    emitSelection(nextSelection);
  };

  const handleSelectAll = () => {
    const nextSelection =
      selectedRows.size === sortedData.length
        ? new Set<Key>()
        : new Set(sortedRowKeys);

    setSelectedRows(nextSelection);
    emitSelection(nextSelection);
  };

  const allSelected = sortedData.length > 0 && selectedRows.size === sortedData.length;
  const someSelected = selectedRows.size > 0 && !allSelected;
  const isRowInteractive = typeof onRowClick === 'function';

  return (
    <div
      className={`${responsive ? 'overflow-x-auto' : ''} ${className}`}
      role="region"
      aria-label="Таблица"
      tabIndex={0}
    >
      <table className="min-w-full divide-y divide-edubot-line" role="table">
        <thead className={`bg-edubot-surfaceAlt/80 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left" scope="col">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-lg p-1 transition-colors hover:bg-edubot-orange/10"
                  aria-label="Select all"
                  aria-checked={allSelected}
                  role="checkbox"
                >
                  {allSelected ? (
                    <Check className="h-4 w-4 text-primary-600" />
                  ) : someSelected ? (
                    <div className="h-4 w-4 rounded border-2 border-primary-600 bg-primary-100" />
                  ) : (
                    <div className="h-4 w-4 rounded border-2 border-edubot-line" />
                  )}
                </button>
              </th>
            )}
            {columns.map((column) => {
              const columnKey = String(column.key);

              return (
                <th
                  key={columnKey}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-edubot-muted"
                  aria-sort={sortColumn === columnKey ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(columnKey)}
                      className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-edubot-orange/10"
                    >
                      <span>{column.header}</span>
                      <span className="text-edubot-muted" aria-hidden="true">
                        {sortColumn === columnKey ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-edubot-line bg-white/85" role="rowgroup">
          {sortedData.map((row, rowIndex) => {
            const rowKeyValue = sortedRowKeys[rowIndex] ?? rowIndex;
            const isSelected = selectedRows.has(rowKeyValue);

            return (
              <tr
                key={rowKeyValue}
                className={`transition-colors hover:bg-edubot-surface ${isSelected ? 'bg-primary-50/70' : ''} ${isRowInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-edubot-orange/30 focus:ring-inset' : ''}`}
                role="row"
                aria-selected={isSelected}
                tabIndex={isRowInteractive ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
              >
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap" role="cell">
                    <button
                      type="button"
                      onClick={() => handleRowSelect(rowKeyValue)}
                      className="rounded-lg p-1 transition-colors hover:bg-edubot-orange/10"
                      aria-label={`Select row ${rowIndex + 1}`}
                      aria-checked={isSelected}
                      role="checkbox"
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary-600" />
                      ) : (
                        <div className="h-4 w-4 rounded border-2 border-edubot-line" />
                      )}
                    </button>
                  </td>
                )}
                {columns.map((column) => {
                  const columnKey = String(column.key);
                  const cellValue = (row as Record<string, unknown>)[columnKey];

                  return (
                    <td
                      key={columnKey}
                      className="px-6 py-4 text-sm text-edubot-ink"
                      role="cell"
                    >
                      {column.render ? column.render(cellValue, row) : (cellValue as ReactNode)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="py-8 text-center text-edubot-muted" role="status" aria-live="polite">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

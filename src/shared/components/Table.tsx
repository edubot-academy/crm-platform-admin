import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Check } from 'lucide-react';

interface TableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  className?: string;
  stickyHeader?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  emptyMessage?: string;
  responsive?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table({
  columns,
  data,
  className = '',
  stickyHeader = false,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Маалымат жок',
  responsive = true
}: TableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

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
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);

    if (onSelectionChange) {
      const selectedData = Array.from(newSelected).map(i => data[i]);
      onSelectionChange(selectedData);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, i) => i)));
    }

    if (onSelectionChange) {
      const newSelected = selectedRows.size === data.length ? [] : data;
      onSelectionChange(newSelected);
    }
  };

  const getSortedData = () => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  };

  const sortedData = getSortedData();
  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  return (
    <div className={`${responsive ? 'overflow-x-auto' : ''} ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  aria-label="Select all"
                >
                  {allSelected ? (
                    <Check className="w-4 h-4 text-primary-600" />
                  ) : someSelected ? (
                    <div className="w-4 h-4 border-2 border-primary-600 rounded bg-primary-100" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                </button>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 transition-colors ${selectedRows.has(rowIndex) ? 'bg-primary-50' : ''
                }`}
            >
              {selectable && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleRowSelect(rowIndex)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    aria-label={`Select row ${rowIndex + 1}`}
                  >
                    {selectedRows.has(rowIndex) ? (
                      <Check className="w-4 h-4 text-primary-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                    )}
                  </button>
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

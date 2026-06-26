'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface ServerSideTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T | ((row: T) => string);
  emptyText?: ReactNode;
}

export function ServerSideTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onRowClick,
  rowKey = 'id',
  emptyText = 'No data found',
}: ServerSideTableProps<T>) {
  const getRowKey = (row: T) => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Table Body */}
      {isLoading ? (
        <div className="p-4 space-y-2 border-t border-[#27272A]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-[#27272A] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-[#27272A]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-xs font-medium uppercase text-[#71717A] ${col.className || ''}`}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[#27272A] last:border-b-0 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#1A1A1A]/30' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : col.dataIndex
                        ? String(row[col.dataIndex] ?? '—')
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-[#52525B]"
                  >
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#27272A] p-4 gap-4 bg-[#111111]/80 rounded-b-xl">
          {/* Left section */}
          <div className="flex items-center gap-6">
            <div className="text-sm text-[#71717A]">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} records
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-[#71717A]">Rows per page:</label>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="rounded-md border border-[#27272A] bg-[#1A1A1A] px-2 py-1 text-sm text-[#A1A1AA] outline-none focus:border-[#FACC15] cursor-pointer"
              >
                {[20, 50, 100, 200, 500].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4 text-sm text-[#71717A]">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 hover:text-white disabled:opacity-50 disabled:hover:text-[#71717A] disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <div>
              Page <span className="text-[#A1A1AA]">{page}</span> of {Math.ceil(total / limit) || 1}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * limit >= total}
              className="flex items-center gap-1 hover:text-white disabled:opacity-50 disabled:hover:text-[#71717A] disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

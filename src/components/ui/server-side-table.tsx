'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T;
  render?: (row: T, expanded?: boolean) => ReactNode;
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
  size?: 'default' | 'sm';
  renderExpandedRow?: (row: T) => ReactNode;
  tableClassName?: string;
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
  size = 'default',
  renderExpandedRow,
  tableClassName = '',
}: ServerSideTableProps<T>) {
  const getRowKey = (row: T) => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  const cellPadding = size === 'sm' ? 'px-2 py-2' : 'px-4 py-3';

  return (
    <div className="flex flex-col w-full">
      {/* Table Body */}
      <div className="overflow-x-auto border-t border-[#27272A]">
        <table className={`w-full text-left ${tableClassName}`}>
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${cellPadding} text-xs font-medium uppercase text-[#71717A] whitespace-nowrap ${col.className || ''}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-[#27272A] last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.key} className={`${cellPadding} ${col.className || ''}`}>
                      <div className="h-5 w-full rounded bg-[#27272A] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-[#52525B]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <RowItem
                  key={getRowKey(row)}
                  row={row}
                  columns={columns}
                  cellPadding={cellPadding}
                  onRowClick={onRowClick}
                  renderExpandedRow={renderExpandedRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#27272A] p-4 gap-4 bg-[#111111]/80 rounded-b-xl">
          {/* Left Side: Showing count and Rows per page */}
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

          {/* Right Side: Pagination Controls */}
          <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * limit >= total}
              className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
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

import React, { useState } from 'react';

function RowItem<T>({ 
  row, 
  columns, 
  cellPadding, 
  onRowClick, 
  renderExpandedRow 
}: { 
  row: T; 
  columns: ColumnDef<T>[]; 
  cellPadding: string; 
  onRowClick?: (row: T) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (renderExpandedRow) {
      setExpanded(!expanded);
    }
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <React.Fragment>
      <tr
        onClick={handleClick}
        className={`border-b border-[#27272A] last:border-b-0 transition-colors ${
          (onRowClick || renderExpandedRow) ? 'cursor-pointer hover:bg-[#1A1A1A]/30' : ''
        }`}
      >
        {columns.map((col) => (
          <td key={col.key} className={`${cellPadding} ${col.className || ''}`}>
            {col.render
              ? col.render(row, expanded)
              : col.dataIndex
              ? String((row as any)[col.dataIndex] ?? '—')
              : '—'}
          </td>
        ))}
      </tr>
      {expanded && renderExpandedRow && (
        <tr className="bg-[#141414] border-b border-[#2A2A2A]">
          <td colSpan={columns.length} className="p-0">
            {renderExpandedRow(row)}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

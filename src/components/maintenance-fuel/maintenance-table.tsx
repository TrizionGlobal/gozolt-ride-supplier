'use client';

import { Wrench } from 'lucide-react';
import type { MaintenanceLogEntry } from '@/types';
import { ServerSideTable, ColumnDef } from '@/components/ui/server-side-table';

interface MaintenanceTableProps {
  data: MaintenanceLogEntry[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Completed: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Scheduled: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Pending: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Overdue: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function MaintenanceTable({ 
  data, 
  isLoading, 
  page, 
  total, 
  limit, 
  onPageChange,
  onLimitChange
}: MaintenanceTableProps) {
  const columns: ColumnDef<MaintenanceLogEntry>[] = [
    { key: 'vehicle', title: 'Vehicle', dataIndex: 'vehicle', className: 'text-sm font-medium text-white' },
    { key: 'type', title: 'Type', dataIndex: 'type', className: 'text-sm text-[#D4D4D8]' },
    { key: 'date', title: 'Date', dataIndex: 'date', className: 'text-sm text-[#D4D4D8]' },
    { key: 'mileage', title: 'Mileage', dataIndex: 'mileage', className: 'text-sm text-[#D4D4D8]' },
    { 
      key: 'cost', 
      title: 'Cost', 
      render: (row) => <span className="text-sm text-[#D4D4D8]">€ {row.cost}</span>
    },
    { 
      key: 'status', 
      title: 'Status', 
      render: (row) => {
        const style = statusStyles[row.status] || statusStyles.Pending;
        return (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {row.status}
          </span>
        );
      }
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText={
          <div className="p-12 text-center">
            <Wrench className="mx-auto mb-3 h-10 w-10 text-[#52525B]" />
            <p className="text-sm text-[#71717A]">No maintenance records yet</p>
          </div>
        }
      />
    </div>
  );
}

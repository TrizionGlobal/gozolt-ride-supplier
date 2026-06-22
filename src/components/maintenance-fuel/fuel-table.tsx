'use client';

import { Droplet } from 'lucide-react';
import type { FuelLogEntry } from '@/types';
import { ServerSideTable, ColumnDef } from '@/components/ui/server-side-table';

interface FuelTableProps {
  data: FuelLogEntry[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function FuelTable({ 
  data, 
  isLoading, 
  page, 
  total, 
  limit, 
  onPageChange,
  onLimitChange
}: FuelTableProps) {
  const columns: ColumnDef<FuelLogEntry>[] = [
    { key: 'vehicle', title: 'Vehicle', dataIndex: 'vehicle', className: 'text-sm font-medium text-white' },
    { key: 'date', title: 'Date', dataIndex: 'date', className: 'text-sm text-[#D4D4D8]' },
    { key: 'liters', title: 'Liters', dataIndex: 'liters', className: 'text-sm text-[#D4D4D8]' },
    { key: 'mileage', title: 'Mileage', dataIndex: 'mileage', className: 'text-sm text-[#D4D4D8]' },
    { 
      key: 'cost', 
      title: 'Cost', 
      render: (row) => <span className="text-sm text-[#D4D4D8]">€ {row.cost}</span>
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
            <Droplet className="mx-auto mb-3 h-10 w-10 text-[#52525B]" />
            <p className="text-sm text-[#71717A]">No fuel records yet</p>
          </div>
        }
      />
    </div>
  );
}

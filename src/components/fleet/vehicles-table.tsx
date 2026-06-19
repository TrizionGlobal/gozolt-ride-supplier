'use client';

import Link from 'next/link';
import type { FleetVehicle } from '@/types';
import { VehicleStatus } from '@/types';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface VehiclesTableProps {
  vehicles: FleetVehicle[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [VehicleStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [VehicleStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending Approval' },
  [VehicleStatus.MAINTENANCE]: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'In Maint.' },
  [VehicleStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [VehicleStatus.DECOMMISSIONED]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Decom.' },
};

export function VehiclesTable({
  vehicles,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: VehiclesTableProps) {
  const columns: ColumnDef<FleetVehicle>[] = [
    {
      key: 'vehicleNo',
      title: 'Vehicle No',
      dataIndex: 'plateNumber',
      render: (row) => <span className="text-sm font-medium text-white">{row.plateNumber}</span>,
    },
    {
      key: 'makeModel',
      title: 'Make/Model',
      dataIndex: 'make',
      render: (row) => <span className="text-sm text-white">{row.make} {row.model}</span>,
    },
    {
      key: 'vehicleType',
      title: 'Vehicle Type',
      dataIndex: 'type',
      render: (row) => <span className="text-sm text-white">{row.type}</span>,
    },
    {
      key: 'fuel',
      title: 'Fuel',
      dataIndex: 'fuelType',
      render: (row) => <span className="text-sm text-white">{row.fuelType}</span>,
    },
    {
      key: 'assignedDriver',
      title: 'Assigned Driver',
      dataIndex: 'assignedDriverName',
      render: (row) => (
        <span className="text-sm text-white">
          {row.assignedDriverName ? (
            row.assignedDriverName
          ) : (
            <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/30">
              Not Assigned
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'regExpiry',
      title: 'Registration Expiry',
      render: () => <span className="text-sm text-[#A1A1AA]">2026-06-28</span>,
    },
    {
      key: 'insStatus',
      title: 'Insurance Status',
      render: () => <span className="text-sm text-[#A1A1AA]">Valid</span>,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (row) => {
        const style = statusStyles[row.status] || statusStyles[VehicleStatus.ACTIVE];
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'action',
      title: 'Action',
      render: (row) => (
        <Link
          href={`/fleet/${row.id}`}
          className="text-sm text-[#FACC15] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable<FleetVehicle>
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        rowKey="id"
        emptyText="No vehicles found"
      />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Edit, ShieldCheck, Clock, Check } from 'lucide-react';
import { AirportTransferVehicle } from '@/services/airport-transfers/airport-transfers.service';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface AirportTransfersTableProps {
  vehicles: AirportTransferVehicle[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit?: (vehicle: AirportTransferVehicle) => void;
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  GO_5P: 'GO 5P',
  PREMIUM_5P: 'PREMIUM 5P',
  SUV_7P: 'SUV 7P',
  MINI_VAN_8P: 'MINI VAN 8P',
  VAN_8P: 'VAN 8P',
  ELECTRIC_5P: 'ELECTRIC 5P',
};

export function AirportTransfersTable({
  vehicles,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
}: AirportTransfersTableProps) {
  const columns: ColumnDef<AirportTransferVehicle>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle',
      dataIndex: 'model',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-16 bg-[#27272A] rounded overflow-hidden flex-shrink-0">
            {row.images?.[0] ? (
              <img
                src={row.images[0]}
                alt={`${row.make} ${row.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-[#71717A]">
                No img
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-white uppercase">
              {row.make ? `${row.make} ` : ''}{row.model}
            </div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              {VEHICLE_TYPE_LABELS[row.vehicleType] || row.vehicleType} • {row.passengerCapacity} SEATS
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'reg',
      title: 'Reg & Year',
      dataIndex: 'registrationNo',
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-[#FACC15]">{row.registrationNo || '-'}</div>
          <div className="text-xs text-[#71717A] mt-0.5">{row.year || '-'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'vehicleType',
      render: (row) => (
        <span className="inline-flex items-center rounded-full border border-[#27272A] bg-[#1A1A1A] px-2.5 py-0.5 text-xs font-semibold text-[#A1A1AA]">
          {VEHICLE_TYPE_LABELS[row.vehicleType] || row.vehicleType?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'price',
      title: 'Tariff (Rate/KM)',
      dataIndex: 'pricePerKm',
      render: (row) => (
        <div>
          <div className="text-sm font-semibold text-[#FACC15]">
            €{Number(row.pricePerKm || 2.5).toFixed(2)}
            <span className="text-xs text-[#A1A1AA] font-normal"> / km</span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-0.5">
            Min: €{Number(row.minPrice || row.fixedPrice || 20).toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: 'capacity',
      title: 'Capacity',
      dataIndex: 'passengerCapacity',
      className: 'text-center',
      render: (row) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#27272A] px-2.5 py-0.5 text-xs font-medium text-white">
            {row.passengerCapacity}P • {row.luggageCapacity}B
          </span>
        </div>
      ),
    },
    {
      key: 'meetAndGreet',
      title: 'Meet & Greet',
      dataIndex: 'isMeetAndGreetIncluded',
      className: 'text-center',
      render: (row) => (
        <div className="text-center">
          {row.isMeetAndGreetIncluded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
              <Check className="w-3 h-3" /> Included
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 text-xs text-zinc-400">
              Standard
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      className: 'text-center',
      render: (row) => {
        const formatStatus = (s: string) => {
          if (!s) return 'Available';
          return s.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        };
        const st = row.status || 'AVAILABLE';
        return (
          <div className="text-center">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                st === 'AVAILABLE'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : st === 'MAINTENANCE'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {formatStatus(st)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      className: 'text-center w-[100px]',
      render: (row) => (
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/airport-transfers/${row.id}/edit`}
            className="text-gray-400 hover:text-white transition-colors"
            title="Edit Vehicle"
          >
            <Edit className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText="No transfer vehicles found. Click '+ Add Airport Transfer' to create one."
      />
    </div>
  );
}

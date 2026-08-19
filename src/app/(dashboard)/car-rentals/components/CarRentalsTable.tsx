'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { CarRentalVehicle } from '@/services/car-rentals/car-rentals.service';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface CarRentalsTableProps {
  vehicles: CarRentalVehicle[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export function CarRentalsTable({
  vehicles,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onToggleStatus,
}: CarRentalsTableProps) {
  const columns: ColumnDef<CarRentalVehicle>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle',
      dataIndex: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-16 bg-[#27272A] rounded overflow-hidden flex-shrink-0">
            {row.images?.[0] ? (
              <img src={row.images[0]} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-[#71717A]">No img</div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{row.name}</div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              {row.transmission?.replace('_', ' ')} • {row.fuelType?.replace('_', ' ')}
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
          <div className="text-xs text-[#71717A] mt-0.5">{(row as any).year || '-'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      render: (row) => (
        <span className="inline-flex items-center rounded-full border border-[#27272A] bg-[#1A1A1A] px-2.5 py-0.5 text-xs font-semibold text-[#A1A1AA]">
          {row.category?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'price',
      title: 'Daily Price',
      dataIndex: 'pricePerDay',
      render: (row) => (
        <div className="text-sm font-medium text-white">€{Number(row.pricePerDay).toFixed(2)}</div>
      ),
    },
    {
      key: 'packages',
      title: 'Packages',
      dataIndex: 'id',
      className: 'text-center',
      render: (row) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#27272A] px-2 py-0.5 text-xs font-medium text-white">
            {row.protectionPackages?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'addons',
      title: 'Add-ons',
      dataIndex: 'id',
      className: 'text-center',
      render: (row) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#27272A] px-2 py-0.5 text-xs font-medium text-white">
            {row.addons?.length || 0}
          </span>
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
          return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        };
        const st = (row as any).status || 'AVAILABLE';
        return (
          <div className="text-center">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              st === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' :
              st === 'ON_RENT' ? 'bg-blue-500/10 text-blue-500' :
              'bg-red-500/10 text-red-500'
            }`}>
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
          <Link href={`/car-rentals/${row.id}/edit`} className="text-gray-400 hover:text-white transition-colors" title="Edit Vehicle">
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
        emptyText="No vehicles found. Click 'Add Car Rental' to create one."
      />
    </div>
  );
}



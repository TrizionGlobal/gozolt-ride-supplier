'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SupplierRideListItem } from '@/types';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface RideTableProps {
  rides: SupplierRideListItem[];
  isLoading: boolean;
  onSelectRide: (ride: SupplierRideListItem) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
  ACTIVE: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Active' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Active' },
  SCHEDULED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Scheduled' },
  REQUESTED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Requested' },
  ACCEPTED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Accepted' },
  DRIVER_EN_ROUTE: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'En Route' },
  DRIVER_ARRIVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Arrived' },
  CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  NO_SHOW_USER: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'No Show' },
};

export function RideTable({
  rides,
  isLoading,
  onSelectRide,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange
}: RideTableProps) {
  const columns: ColumnDef<SupplierRideListItem>[] = [
    {
      key: 'rider',
      title: 'Rider',
      dataIndex: 'riderName',
      render: (row) => <span className="text-sm text-[#D4D4D8]">{row.riderName}</span>,
    },
    {
      key: 'driver',
      title: 'Driver',
      dataIndex: 'driverName',
      render: (row) => <span className="text-sm text-white">{row.driverName}</span>,
    },
    {
      key: 'pickup',
      title: 'Pickup',
      dataIndex: 'pickup',
      render: (row) => (
        <div className="max-w-[150px] truncate text-sm text-[#A1A1AA]" title={row.pickup}>
          {row.pickup}
        </div>
      ),
    },
    {
      key: 'dropoff',
      title: 'Drop-off',
      dataIndex: 'dropoff',
      render: (row) => (
        <div className="max-w-[150px] truncate text-sm text-[#A1A1AA]" title={row.dropoff}>
          {row.dropoff}
        </div>
      ),
    },
    {
      key: 'distance',
      title: 'Distance',
      dataIndex: 'distance',
      render: (row) => <span className="text-sm text-[#A1A1AA]">{row.distance}</span>,
    },
    {
      key: 'fare',
      title: 'Fare',
      dataIndex: 'actualFare',
      render: (row) => (
        <span className="text-sm text-white">
          {row.actualFare ? formatCurrency(row.actualFare) : '—'}
        </span>
      ),
    },
    {
      key: 'payment',
      title: 'Payment',
      dataIndex: 'paymentMethod',
      render: (row) => <span className="text-sm text-[#D4D4D8]">{row.paymentMethod}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (row) => {
        const style = statusStyles[row.status] || statusStyles.COMPLETED;
        return (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      {/* Table */}
      <ServerSideTable<SupplierRideListItem>
        columns={columns}
        data={rides}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onRowClick={onSelectRide}
        rowKey="id"
        emptyText="No rides found"
      />
    </div>
  );
}

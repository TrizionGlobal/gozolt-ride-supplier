'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SupplierRideListItem } from '@/types';

interface RideTableProps {
  rides: SupplierRideListItem[];
  isLoading: boolean;
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  activeFilter: string;
  onSelectRide: (ride: SupplierRideListItem) => void;
}

const STATUS_FILTERS = ['ALL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW_USER'];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Active' },
  CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  NO_SHOW_USER: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'No Show' },
};

export function RideTable({ rides, isLoading, onSearch, onStatusFilter, activeFilter, onSelectRide }: RideTableProps) {
  const [search, setSearch] = useState('');

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearch(val);
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111]">
      {/* Search + Filter */}
      <div className="flex flex-col gap-3 border-b border-[#27272A] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search ride ID, driver, rider..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === s
                  ? 'bg-[#FACC15] text-black'
                  : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46]'
              }`}
            >
              {s === 'ALL' ? 'All' : (statusStyles[s]?.label || s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-[#27272A] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Ride ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Rider</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Fare</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const style = statusStyles[ride.status] || statusStyles.COMPLETED;
                return (
                  <tr
                    key={ride.id}
                    onClick={() => onSelectRide(ride)}
                    className="cursor-pointer border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#FACC15]">{ride.displayId}</td>
                    <td className="px-4 py-3 text-sm text-white">{ride.driverName}</td>
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">{ride.riderName}</td>
                    <td className="px-4 py-3 text-sm text-[#A1A1AA] max-w-[200px] truncate">{ride.pickup} → {ride.dropoff}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{ride.actualFare ? formatCurrency(ride.actualFare) : '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-400">{ride.tipAmount ? formatCurrency(ride.tipAmount) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">{ride.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-[#A1A1AA]">{new Date(ride.requestedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {rides.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#52525B]">No rides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

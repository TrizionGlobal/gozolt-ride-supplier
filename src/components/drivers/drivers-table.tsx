'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Driver } from '@/types';
import { DriverStatus } from '@/types';

interface DriversTableProps {
  drivers: Driver[];
  vehicleMap: Record<string, string>;
  isLoading: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [DriverStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [DriverStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  [DriverStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [DriverStatus.INACTIVE]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Inactive' },
};

export function DriversTable({ drivers, vehicleMap, isLoading }: DriversTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111]">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Rides</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#71717A]">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver) => {
                const style = statusStyles[driver.status] || statusStyles[DriverStatus.ACTIVE];
                const vehicle = vehicleMap[driver.id];
                return (
                  <tr
                    key={driver.id}
                    className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {driver.firstName} {driver.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">{driver.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {vehicle || <span className="text-[#52525B]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{driver.totalRides}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#FACC15] text-[#FACC15]" />
                        <span className="text-white">{driver.avgRating}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="text-sm text-[#FACC15] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

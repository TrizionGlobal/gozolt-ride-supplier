'use client';

import Link from 'next/link';
import type { FleetVehicle } from '@/types';
import { VehicleStatus } from '@/types';

interface VehiclesTableProps {
  vehicles: FleetVehicle[];
  isLoading: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [VehicleStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [VehicleStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending Approval' },
  [VehicleStatus.MAINTENANCE]: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'In Maint.' },
  [VehicleStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [VehicleStatus.DECOMMISSIONED]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Decom.' },
};

export function VehiclesTable({ vehicles, isLoading }: VehiclesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Plate</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Make/Model</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Fuel</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Driver</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Insurance Exp</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">VRT Exp</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-[#2A2A2A] last:border-b-0">
                  <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 rounded-full bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-[#27272A] animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-[#27272A] animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Plate</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Make/Model</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Type</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Fuel</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Driver</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Insurance Exp</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">VRT Exp</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#71717A]">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const style = statusStyles[vehicle.status] || statusStyles[VehicleStatus.ACTIVE];
                return (
                  <tr
                    key={vehicle.id}
                    className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">{vehicle.plateNumber}</td>
                    <td className="px-4 py-3 text-sm text-white">{vehicle.make}</td>
                    <td className="px-4 py-3 text-sm text-white">{vehicle.type}</td>
                    <td className="px-4 py-3 text-sm text-white">{vehicle.fuelType}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {vehicle.assignedDriverName ? (
                        vehicle.assignedDriverName
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/30">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#A1A1AA]">2026-06-28</td>
                    <td className="px-4 py-3 text-sm text-[#A1A1AA]">2025-09-01</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/fleet/${vehicle.id}`}
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

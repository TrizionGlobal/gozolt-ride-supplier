'use client';

import { mockDashboardActiveRides } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export function ActiveRidesTable() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
        <h3 className="text-lg font-semibold text-white">Active Rides</h3>
        <div className="flex items-center gap-2">
          <button className="text-xs text-[#FACC15] hover:underline">View All</button>
          <span className="flex items-center gap-1.5 rounded-full bg-[#22C55E]/20 px-2 py-0.5 text-xs text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Driver</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Vehicle</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Rider</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Route</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Duration</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Tip</th>
            </tr>
          </thead>
          <tbody>
            {mockDashboardActiveRides.map((ride) => (
              <tr key={ride.id} className="border-b border-[#27272A] last:border-b-0">
                <td className="px-4 py-3 text-sm text-white">{ride.driver}</td>
                <td className="px-4 py-3 text-sm text-white">{ride.vehicle}</td>
                <td className="px-4 py-3 text-sm text-white">{ride.rider}</td>
                <td className="px-4 py-3 text-sm text-[#A1A1AA]">{ride.route}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#22C55E]/20 px-2 py-1 text-xs text-[#22C55E]">
                    {ride.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#A1A1AA]">{ride.duration}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-400">
                  {ride.tipAmount ? formatCurrency(ride.tipAmount) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import type { VehicleRate } from '@/types';

interface RatePricingTableProps {
  data: VehicleRate[];
}

export function RatePricingTable({ data }: RatePricingTableProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Vehicle Rate Pricing</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Vehicle Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Base Rate (€)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Per KM (€)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Per Min (€)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Min. Fare (€)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.vehicleType}
                className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
              >
                <td className="px-4 py-3 text-sm font-medium text-white">{row.vehicleType}</td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">{Number(row.baseRate ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">{Number(row.perKm ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">{Number(row.perMin ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">{Number(row.minFare ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

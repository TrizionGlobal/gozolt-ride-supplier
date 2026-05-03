'use client';

import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PerDriverEarning } from '@/types';

interface PerDriverEarningsTableProps {
  data: PerDriverEarning[];
  isLoading: boolean;
}

export function PerDriverEarningsTable({ data, isLoading }: PerDriverEarningsTableProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Per-Driver Earnings</h3>

      {/* Tip pass-through warning */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#FACC15]/30 bg-[#FACC15]/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
        <p className="text-xs text-[#FACC15]">
          Tips are collected by the platform and passed through 100% to drivers. They are not
          included in your commission or payout calculations.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded bg-[#27272A] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Driver</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Rides</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Gross</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Net</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Tips</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Tip #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Avg/Ride</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.driverName}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#D4D4D8]">{row.rides}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.gross)}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.commission)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{formatCurrency(row.net)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-400">{formatCurrency(row.tipEarnings)}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#D4D4D8]">{row.tipCount}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.avgPerRide)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

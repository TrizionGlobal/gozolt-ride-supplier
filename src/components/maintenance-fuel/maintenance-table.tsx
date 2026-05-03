'use client';

import { Wrench } from 'lucide-react';
import type { MaintenanceLogEntry } from '@/types';

interface MaintenanceTableProps {
  data: MaintenanceLogEntry[];
  isLoading: boolean;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Completed: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Scheduled: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Pending: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Overdue: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function MaintenanceTable({ data, isLoading }: MaintenanceTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111]">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-12 text-center">
        <Wrench className="mx-auto mb-3 h-10 w-10 text-[#52525B]" />
        <p className="text-sm text-[#71717A]">No maintenance records yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Mileage</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Cost</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const style = statusStyles[row.status] || statusStyles.Pending;
              return (
                <tr
                  key={row.id}
                  className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.vehicle}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{row.type}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{row.mileage}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">€ {row.cost}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

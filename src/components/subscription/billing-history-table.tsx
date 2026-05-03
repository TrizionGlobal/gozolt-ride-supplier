'use client';

import type { BillingRecord } from '@/types';

interface BillingHistoryTableProps {
  data: BillingRecord[];
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Paid: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function BillingHistoryTable({ data }: BillingHistoryTableProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Billing History</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Amount</th>
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
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{row.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.description}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">€ {row.amount}</td>
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

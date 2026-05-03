'use client';

import { Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { invoiceService } from '@/services/invoices/invoice.service';
import type { SupplierStatement } from '@/types';

interface InvoiceTableProps {
  data: SupplierStatement[];
  isLoading: boolean;
}

export function InvoiceTable({ data, isLoading }: InvoiceTableProps) {
  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start);
    return s.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Statements</h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-[#27272A] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Period</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Rides</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Gross</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Net</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#71717A]">Download</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30">
                  <td className="px-4 py-3 text-sm font-medium text-[#FACC15]">{row.statementNo}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatPeriod(row.periodStart, row.periodEnd)}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#D4D4D8]">{row.totalRides}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.grossRevenue)}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.commissionEarned)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{formatCurrency(row.netBalance)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => invoiceService.downloadStatement(row.id)}
                      className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#27272A] hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

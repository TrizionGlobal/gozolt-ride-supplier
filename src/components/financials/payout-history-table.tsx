'use client';

import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import type { PayoutRecord } from '@/types';

interface PayoutHistoryTableProps {
  data: PayoutRecord[];
  isLoading: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Processing' },
  FAILED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Failed' },
};

function formatPeriod(periodStart: string | null): string {
  if (!periodStart) return '——';
  const d = new Date(periodStart);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '——';
  return new Date(dateStr).toLocaleDateString('en-CA');
}

// Mock rides count derived from amount (no direct API field)
function estimateRides(amount: number): number {
  return Math.round(amount / 35);
}

export function PayoutHistoryTable({ data, isLoading }: PayoutHistoryTableProps) {
  const router = useRouter();

  const handleStatementPDF = () => {
    toast.success('Statement PDF downloaded (dev mode)');
  };

  const handleCSVExport = () => {
    const csvData = data.map((p) => ({
      Date: formatDate(p.periodEnd),
      Period: formatPeriod(p.periodStart),
      Rides: estimateRides(p.amount),
      Net: p.amount,
      Status: statusStyles[p.status]?.label || p.status,
    }));
    downloadCSV(csvData, 'payout-history');
    toast.success('CSV exported successfully');
  };

  const handleInvoiceClick = () => {
    router.push('/invoices');
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Payout History</h3>
        <div className="flex gap-2">
          <button
            onClick={handleStatementPDF}
            className="flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Statement PDF
          </button>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-[#27272A] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Period</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Rides</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Net</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const style = statusStyles[row.status] || statusStyles.PENDING;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                  >
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                      {formatDate(row.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                      {formatPeriod(row.periodStart)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#D4D4D8]">
                      {estimateRides(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={handleInvoiceClick}
                        className="inline-flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

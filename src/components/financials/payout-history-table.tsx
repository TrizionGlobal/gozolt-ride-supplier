'use client';

import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { InvoiceDocument } from '@/components/invoices/invoice-document';
import { useAuth } from '@/hooks/use-auth';
import type { PayoutRecord, SupplierProfile } from '@/types';

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

function formatPeriodFull(start: string | null, end: string | null): string {
  if (!start || !end) return '——';
  const d1 = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const d2 = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${d1} - ${d2}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '——';
  return new Date(dateStr).toLocaleDateString('en-CA');
}

function PrintRowButton({ row, supplier }: { row: PayoutRecord; supplier: SupplierProfile | null }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Gozolt_Payout_Invoice_${row.id.substring(0, 8)}`,
  });

  return (
    <>
      <button
        onClick={() => handlePrint()}
        className="inline-flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
      >
        <Printer className="h-4 w-4" />
      </button>
      <div className="hidden">
        <InvoiceDocument ref={contentRef} payout={row} supplier={supplier} />
      </div>
    </>
  );
}

export function PayoutHistoryTable({ data, isLoading }: PayoutHistoryTableProps) {
  const { user } = useAuth();

  const handleStatementPDF = () => {
    toast.success('Statement PDF downloaded (dev mode)');
  };

  const handleCSVExport = () => {
    const csvData = data.map((p) => ({
      Date: formatDate(p.processedAt || p.createdAt),
      Period: formatPeriodFull(p.periodStart, p.periodEnd),
      'Cab Booking': p.details?.breakdown?.cab || 0,
      'Car Rental': p.details?.breakdown?.carRental || 0,
      'Bike Rental': p.details?.breakdown?.bikeRental || 0,
      Net: p.amount,
      Status: statusStyles[p.status]?.label || p.status,
    }));
    downloadCSV(csvData, 'payout-history');
    toast.success('Excel exported successfully');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent opacity-20" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Platform Payout History</h3>
          <p className="text-xs text-[#71717A] mt-0.5">Record of all payouts from Gozolt to your account.</p>
        </div>
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
            Export Excel
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">DATE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">PERIOD</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">AMOUNT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">STATUS</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#71717A]">INVOICE</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const style = statusStyles[row.status] || statusStyles.PENDING;
                const hasBreakdown = !!row.details?.breakdown;
                
                return (
                  <React.Fragment key={row.id}>
                  <tr
                    className={`border-[#27272A] transition-colors hover:bg-[#1A1A1A]/30 ${hasBreakdown ? 'border-b-0' : 'border-b last:border-b-0'}`}
                  >
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                      {formatDate(row.processedAt || row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                      {formatPeriodFull(row.periodStart, row.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#22C55E]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PrintRowButton row={row} supplier={user} />
                    </td>
                  </tr>
                  {hasBreakdown && (
                    <tr className="border-b border-[#27272A] last:border-b-0 bg-[#0A0A0A]/30">
                      <td colSpan={5} className="px-4 py-3 pb-4">
                        <div className="rounded-lg bg-[#111111] p-4 border border-[#27272A]">
                          <p className="text-xs font-semibold text-[#A1A1AA] mb-3 uppercase tracking-wider">Earnings Breakdown by Service</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#141414] border border-[#27272A] p-3 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-[#D4D4D8]">Cab Bookings</span>
                              <span className="text-sm font-semibold text-white">{formatCurrency(row.details?.breakdown?.cab || 0)}</span>
                            </div>
                            <div className="bg-[#141414] border border-[#27272A] p-3 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-[#D4D4D8]">Car Rentals</span>
                              <span className="text-sm font-semibold text-white">{formatCurrency(row.details?.breakdown?.carRental || 0)}</span>
                            </div>
                            <div className="bg-[#141414] border border-[#27272A] p-3 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-[#D4D4D8]">Bike Rentals</span>
                              <span className="text-sm font-semibold text-white">{formatCurrency(row.details?.breakdown?.bikeRental || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
              {data.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A] text-sm">
                    No payouts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

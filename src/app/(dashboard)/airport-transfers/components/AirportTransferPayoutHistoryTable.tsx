'use client';

import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { AirportTransferInvoiceDocument } from './AirportTransferInvoiceDocument';
import { useAuth } from '@/hooks/use-auth';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import type { PayoutRecord, SupplierProfile } from '@/types';

interface AirportTransferPayoutHistoryTableProps {
  data: PayoutRecord[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Processing' },
  FAILED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Failed' },
};

function formatPeriodFull(start: string | null, end: string | null): string {
  if (!start || !end) return '——';
  const d1 = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const d2 = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${d1} - ${d2}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '——';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PrintRowButton({ row, supplier }: { row: PayoutRecord; supplier: SupplierProfile | null }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Gozolt_Airport_Transfer_Invoice_${row.id.substring(0, 8)}`,
  });

  return (
    <>
      <button
        onClick={() => handlePrint()}
        className="inline-flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
        title="Print Invoice"
      >
        <Printer className="h-4 w-4" />
      </button>
      <div className="hidden">
        <AirportTransferInvoiceDocument ref={contentRef} payout={row} supplier={supplier} />
      </div>
    </>
  );
}

export function AirportTransferPayoutHistoryTable({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: AirportTransferPayoutHistoryTableProps) {
  const { user } = useAuth();

  const statementRef = useRef<HTMLDivElement>(null);
  const handlePrintStatement = useReactToPrint({
    contentRef: statementRef,
    documentTitle: 'Gozolt_Airport_Transfer_Statement',
  });

  const handleStatementPDF = () => {
    if (data && data.length > 0) {
      handlePrintStatement();
    } else {
      toast.info('No payout records yet to generate an invoice statement.');
    }
  };

  const handleCSVExport = () => {
    const csvData = data.map((p) => ({
      Date: formatDate(p.processedAt || p.createdAt),
      Period: formatPeriodFull(p.periodStart, p.periodEnd),
      Net: p.amount,
      Status: statusStyles[p.status]?.label || p.status,
    }));
    downloadCSV(csvData, 'airport-transfer-payouts');
    toast.success('Excel exported successfully');
  };

  const columns: ColumnDef<PayoutRecord>[] = [
    {
      key: 'date',
      title: 'DATE',
      render: (row) => <span className="text-[#D4D4D8]">{formatDate(row.processedAt || row.createdAt)}</span>,
    },
    {
      key: 'period',
      title: 'PERIOD',
      render: (row) => <span className="text-[#D4D4D8]">{formatPeriodFull(row.periodStart, row.periodEnd)}</span>,
    },
    {
      key: 'amount',
      title: 'TOTAL (NET)',
      render: (row) => <span className="font-semibold text-[#22C55E]">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      title: 'STATUS',
      render: (row) => {
        const style = statusStyles[row.status] || statusStyles.PENDING;
        return (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'invoice',
      title: 'INVOICE',
      className: 'text-center',
      render: (row) => (
        <div className="flex justify-center">
          <PrintRowButton row={row} supplier={user} />
        </div>
      ),
    },
  ];

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

      <ServerSideTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText="No payouts recorded yet."
      />

      <div className="hidden">
        {data && data.length > 0 && (
          <AirportTransferInvoiceDocument
            ref={statementRef}
            payout={data[0]}
            supplier={user}
          />
        )}
      </div>
    </div>
  );
}

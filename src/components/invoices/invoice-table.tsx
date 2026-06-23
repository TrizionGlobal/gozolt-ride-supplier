'use client';

import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { invoiceService } from '@/services/invoices/invoice.service';
import type { SupplierStatement } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { InvoicePreviewModal } from './invoice-preview-modal';
import { ServerSideTable, ColumnDef } from '@/components/ui/server-side-table';

interface InvoiceTableProps {
  data: SupplierStatement[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function InvoiceTable({ 
  data, 
  isLoading,
  page,
  total,
  limit,
  onPageChange,
  onLimitChange
}: InvoiceTableProps) {
  const [selectedStatement, setSelectedStatement] = useState<SupplierStatement | null>(null);
  const { user } = useAuthStore();

  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start);
    return s.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const columns: ColumnDef<SupplierStatement>[] = [
    { 
      key: 'statementNo', 
      title: 'Invoice #', 
      render: (row) => <span className="text-[#FACC15] font-medium">{row.statementNo}</span>,
      className: 'font-medium text-sm' 
    },
    { 
      key: 'period', 
      title: 'Period', 
      render: (row) => <span className="text-[#D4D4D8]">{formatPeriod(row.periodStart, row.periodEnd)}</span>,
      className: 'text-sm'
    },
    { 
      key: 'rides', 
      title: 'Rides', 
      dataIndex: 'totalRides', 
      className: 'text-[#D4D4D8] text-center text-sm' 
    },
    { 
      key: 'gross', 
      title: 'Gross', 
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.grossRevenue)}</span>,
      className: 'text-sm'
    },
    { 
      key: 'commission', 
      title: 'Commission', 
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.commissionEarned)}</span>,
      className: 'text-sm'
    },
    { 
      key: 'net', 
      title: 'Net', 
      render: (row) => <span className="text-white font-medium">{formatCurrency(row.netBalance)}</span>,
      className: 'text-sm'
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right text-sm',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStatement(row);
            }}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#FACC15] hover:text-black transition-colors"
            title="View & Print Invoice"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              invoiceService.downloadStatement(row.id);
            }}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#27272A] hover:text-white transition-colors"
            title="Download raw PDF"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <div className="p-6 pb-4 border-b border-[#27272A]">
        <h3 className="text-lg font-semibold text-white">Statements</h3>
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
        emptyText="No invoices found."
      />
      <InvoicePreviewModal
        isOpen={!!selectedStatement}
        onClose={() => setSelectedStatement(null)}
        statement={selectedStatement}
        supplier={user}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { useDebounce } from '@/hooks/use-debounce';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

export interface DriverPayoutLog {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  deductions: number;
  notes: string | null;
  createdAt: string;
}

interface DriverPayoutHistoryTableProps {
  onRefresh?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '——';
  return new Date(dateStr).toLocaleString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace('a.m.', 'AM').replace('p.m.', 'PM');
}

export function DriverPayoutHistoryTable({ onRefresh }: DriverPayoutHistoryTableProps) {
  const [data, setData] = useState<DriverPayoutLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { financialService } = await import('@/services/financials/financial.service');
        const res = await financialService.getDriverPayoutLogs(page, limit, debouncedSearch || undefined);
        setData(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        toast.error('Failed to load payout history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const paginatedData = data;

  const columns: ColumnDef<DriverPayoutLog>[] = [
    {
      key: 'createdAt',
      title: 'Date Paid',
      render: (row) => <span className="text-[#D4D4D8]">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'driverName',
      title: 'Driver Name',
      render: (row) => <span className="font-medium text-white">{row.driverName}</span>,
    },
    {
      key: 'amount',
      title: 'Amount Paid',
      render: (row) => <span className="font-semibold text-green-400">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'deductions',
      title: 'Commission / Deductions',
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.deductions)}</span>,
    },
    {
      key: 'notes',
      title: 'Notes',
      render: (row) => (
        <span className="max-w-[200px] truncate text-[#A1A1AA] block" title={row.notes || ''}>
          {row.notes || '——'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      className: 'text-center',
      render: () => (
        <span className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
          Paid
        </span>
      ),
    },
  ];

  const handleExportExcel = () => {
    const excelData = paginatedData.map((p) => ({
      'Date Paid': formatDate(p.createdAt),
      'Driver Name': p.driverName,
      'Amount Paid': p.amount,
      'Deductions': p.deductions,
      'Notes': p.notes || '',
    }));
    exportToExcel(excelData, `driver_payout_history_${new Date().toISOString().split('T')[0]}`);
    toast.success('Excel exported successfully');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent opacity-20" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Driver Payout History</h3>
          <p className="text-xs text-[#71717A] mt-0.5">Historical list of settlements paid out to drivers.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search driver name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#52525B] focus:border-[#FACC15] focus:outline-none sm:w-[220px]"
            />
          </div>
          <button
            onClick={handleExportExcel}
            disabled={isLoading || paginatedData.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      <ServerSideTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        emptyText="No historical payouts found."
      />
    </div>
  );
}

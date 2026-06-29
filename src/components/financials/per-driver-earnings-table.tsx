'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Download, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { useDebounce } from '@/hooks/use-debounce';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import type { PerDriverEarning } from '@/types';
import { PayDriverModal } from './pay-driver-modal';
import { SettleDebtModal } from './settle-debt-modal';

import { toast } from 'sonner';

interface PerDriverEarningsTableProps {
  onRefresh?: () => void;
}

export function PerDriverEarningsTable({ onRefresh }: PerDriverEarningsTableProps) {
  const [data, setData] = useState<PerDriverEarning[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<{ id: string; name: string; balance: number; vehicleType?: string | null } | null>(null);
  const [selectedDebtDriver, setSelectedDebtDriver] = useState<{ id: string; name: string; balance: number } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Payment Due' | 'Settled'>('All');

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      const { financialService } = await import('@/services/financials/financial.service');
      const res = await financialService.getPerDriverEarnings(undefined, undefined, page, limit, debouncedSearch || undefined);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to load driver settlements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [page, limit, debouncedSearch]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const paginatedData = data.filter((row) => {
    let matchesStatus = true;
    if (statusFilter === 'Payment Due') matchesStatus = row.availableBalance > 0;
    if (statusFilter === 'Settled') matchesStatus = row.availableBalance <= 0;
    return matchesStatus;
  });

  const columns: ColumnDef<PerDriverEarning>[] = [
    {
      key: 'driverName',
      title: 'Driver Name',
      render: (row) => <span className="font-medium text-white">{row.driverName}</span>,
    },
    {
      key: 'totalCashReceived',
      title: 'Total Cash',
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.totalCashReceived || 0)}</span>,
    },
    {
      key: 'totalCardReceived',
      title: 'Card Money',
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.totalCardReceived || 0)}</span>,
    },
    {
      key: 'totalPaidOut',
      title: 'Total Paid Out',
      render: (row) => <span className="text-[#D4D4D8]">{formatCurrency(row.totalPaidOut)}</span>,
    },
    {
      key: 'availableBalance',
      title: 'Owed Balance',
      render: (row) => (
        <span className={`font-bold ${row.availableBalance < 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.availableBalance < 0 ? `-€${Math.abs(row.availableBalance).toFixed(2)}` : formatCurrency(row.availableBalance)}
        </span>
      ),
    },
    {
      key: 'lastPaymentDate',
      title: 'Last Payment',
      render: (row) => <span className="text-[#71717A]">{row.lastPaymentDate ? new Date(row.lastPaymentDate).toLocaleDateString() : 'Never'}</span>,
    },
    {
      key: 'action',
      title: 'Action',
      className: 'text-center',
      render: (row) => {
        if (row.availableBalance < 0) {
          return (
            <button 
              onClick={() => setSelectedDebtDriver({
                id: row.driverId,
                name: row.driverName,
                balance: row.availableBalance,
              })}
              className="rounded bg-red-500/20 px-4 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all shadow-sm"
            >
              Receive Cash
            </button>
          );
        }

        return (
          <button 
            onClick={() => setSelectedDriver({
              id: row.driverId,
              name: row.driverName,
              balance: row.availableBalance,
              vehicleType: row.vehicleType,
            })}
            className="rounded bg-[#FACC15] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] disabled:bg-[#27272A] disabled:text-[#71717A] disabled:cursor-not-allowed transition-all shadow-sm"
            disabled={row.availableBalance === 0}
          >
            Pay Driver
          </button>
        );
      },
    },
  ];

  const handleExportExcel = () => {
    const excelData = paginatedData.map((row) => ({
      'Driver Name': row.driverName,
      'Ride Earnings': row.totalCashReceived || 0,
      'Tips': row.totalCardReceived || 0,
      'Total Paid Out': row.totalPaidOut,
      'Owed Balance': row.availableBalance,
      'Last Payment Date': row.lastPaymentDate ? new Date(row.lastPaymentDate).toLocaleDateString() : 'Never',
    }));
    exportToExcel(excelData, `driver_settlements_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent opacity-20" />
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Driver Settlements</h3>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search driver name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#52525B] focus:border-[#FACC15] focus:outline-none sm:w-[200px]"
            />
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-[#71717A]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none rounded-lg border border-[#27272A] bg-[#0A0A0A] pl-9 pr-8 py-2 text-sm text-white focus:border-[#FACC15] focus:outline-none sm:w-[150px] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Payment Due">Payment Due</option>
              <option value="Settled">Settled / Paid</option>
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={isLoading || paginatedData.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Tip pass-through warning */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#FACC15]/30 bg-[#FACC15]/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
        <p className="text-xs text-[#FACC15]">
          Tips are collected by the platform and passed through 100% to drivers. They are not
          included in your commission or payout calculations.
        </p>
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
        emptyText="No driver settlements found."
        rowKey="driverId"
      />

      {selectedDriver && (
        <PayDriverModal
          driverId={selectedDriver.id}
          driverName={selectedDriver.name}
          vehicleType={selectedDriver.vehicleType}
          availableBalance={selectedDriver.balance}
          onClose={() => setSelectedDriver(null)}
          onSuccess={() => {
            setSelectedDriver(null);
            fetchTableData(); // Refresh the table
            if (onRefresh) onRefresh(); // Refresh KPI cards
          }}
        />
      )}

      {selectedDebtDriver && (
        <SettleDebtModal
          isOpen={!!selectedDebtDriver}
          onClose={() => setSelectedDebtDriver(null)}
          driver={selectedDebtDriver}
          onSuccess={() => {
            fetchTableData(); // Refresh the table
            if (onRefresh) onRefresh(); // Refresh KPI cards
          }}
        />
      )}
    </div>
  );
}

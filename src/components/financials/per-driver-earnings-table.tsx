'use client';

import { useState } from 'react';
import { AlertTriangle, Info, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PerDriverEarning } from '@/types';
import { PayDriverModal } from './pay-driver-modal';

interface PerDriverEarningsTableProps {
  data: PerDriverEarning[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function PerDriverEarningsTable({ data, isLoading, onRefresh }: PerDriverEarningsTableProps) {
  const [selectedDriver, setSelectedDriver] = useState<{ id: string; name: string; balance: number; vehicleType?: string | null } | null>(null);

  const handleExportCSV = () => {
    const headers = ['Driver Name', 'Ride Earnings', 'Tips', 'Total Paid Out', 'Owed Balance'];
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          `"${row.driverName}"`,
          row.totalEarnings - row.totalTips,
          row.totalTips,
          row.totalPaidOut,
          row.availableBalance,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `driver_settlements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Driver Settlements</h3>
        <button
          onClick={handleExportCSV}
          disabled={isLoading || data.length === 0}
          className="flex items-center gap-2 rounded-md border border-[#3F3F46] bg-[#1A1A1A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#27272A] disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Driver Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Ride Earnings</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Tips (100% Pass-through)</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Total Paid Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Owed Balance</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#71717A]">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{row.driverName}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.totalEarnings - row.totalTips)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-400">{formatCurrency(row.totalTips)}</td>
                  <td className="px-4 py-3 text-sm text-[#D4D4D8]">{formatCurrency(row.totalPaidOut)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">
                    {formatCurrency(row.availableBalance)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => setSelectedDriver({
                        id: row.driverId,
                        name: row.driverName,
                        balance: row.availableBalance,
                        vehicleType: row.vehicleType,
                      })}
                      className="rounded bg-[#27272A] px-3 py-1 text-xs font-medium text-white hover:bg-[#3F3F46] disabled:opacity-50 transition-colors"
                      disabled={row.availableBalance <= 0}
                    >
                      Pay Driver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDriver && (
        <PayDriverModal
          driverId={selectedDriver.id}
          driverName={selectedDriver.name}
          vehicleType={selectedDriver.vehicleType}
          availableBalance={selectedDriver.balance}
          onClose={() => setSelectedDriver(null)}
          onSuccess={() => {
            setSelectedDriver(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

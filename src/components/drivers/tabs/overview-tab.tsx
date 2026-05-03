'use client';

import { DollarSign, TrendingUp, HandCoins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockDriverEarningsBreakdown } from '@/lib/mock-data';
import type { Driver } from '@/types';
import { DriverStatus } from '@/types';

interface OverviewTabProps {
  driver: Driver;
  vehicle?: string;
}

const statusStyles: Record<string, { text: string; label: string }> = {
  [DriverStatus.ACTIVE]: { text: 'text-green-400', label: 'Active' },
  [DriverStatus.PENDING_APPROVAL]: { text: 'text-yellow-400', label: 'Pending' },
  [DriverStatus.SUSPENDED]: { text: 'text-red-400', label: 'Suspended' },
  [DriverStatus.INACTIVE]: { text: 'text-zinc-400', label: 'Inactive' },
};

export function OverviewTab({ driver, vehicle }: OverviewTabProps) {
  const style = statusStyles[driver.status] || statusStyles[DriverStatus.ACTIVE];
  const earnings = mockDriverEarningsBreakdown;

  const details = [
    { label: 'Name', value: `${driver.firstName} ${driver.lastName}` },
    { label: 'Phone', value: driver.phone },
    { label: 'Email', value: driver.email || '—' },
    { label: 'Driver ID', value: driver.driverId },
    { label: 'Status', value: style.label, colored: true, colorClass: style.text },
    { label: 'Vehicle', value: vehicle || 'Not assigned' },
    { label: 'Total Rides', value: String(driver.totalRides) },
    { label: 'Rating', value: String(driver.avgRating) },
  ];

  return (
    <div className="space-y-6">
      {/* Driver Details */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="grid grid-cols-3 gap-6">
          {details.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-[#71717A]">{item.label}</p>
              <p className={`mt-1 text-sm font-medium ${item.colored ? item.colorClass : 'text-white'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Earnings Breakdown (MTD)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
                <DollarSign className="h-4 w-4 text-[#8B5CF6]" />
              </div>
              <p className="text-xs text-[#A1A1AA]">Total Earnings</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(earnings.totalEarnings)}</p>
          </div>
          <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0EA5E9]/20">
                <TrendingUp className="h-4 w-4 text-[#0EA5E9]" />
              </div>
              <p className="text-xs text-[#A1A1AA]">Card Earnings</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(earnings.cardEarnings)}</p>
          </div>
          <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                <HandCoins className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-xs text-[#A1A1AA]">Tips Earned</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-400">{formatCurrency(earnings.tipEarnings)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#71717A]">Cash Earnings</p>
            <p className="mt-1 text-sm font-medium text-white">{formatCurrency(earnings.cashEarnings)}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Rides Completed</p>
            <p className="mt-1 text-sm font-medium text-white">{earnings.ridesCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Tip Count</p>
            <p className="mt-1 text-sm font-medium text-white">{earnings.tipCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

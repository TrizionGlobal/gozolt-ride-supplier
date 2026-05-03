'use client';

import { formatCurrency } from '@/lib/utils';
import type { SupplierRideKpis } from '@/types';

interface RideKPICardsProps {
  kpis: SupplierRideKpis | null;
  isLoading: boolean;
}

export function RideKPICards({ kpis, isLoading }: RideKPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <div className="h-4 w-20 rounded bg-[#27272A] animate-pulse mb-2" />
            <div className="h-7 w-16 rounded bg-[#27272A] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Rides', value: (kpis.totalRides ?? 0).toLocaleString() },
    { label: 'Completed Today', value: String(kpis.completedToday) },
    { label: 'Active Now', value: String(kpis.activeNow), accent: 'text-green-400' },
    { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue) },
    { label: 'Total Tips', value: formatCurrency(kpis.totalTips), accent: 'text-green-400' },
    { label: 'Cancel Rate', value: `${kpis.cancellationRate}%`, accent: 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <p className="text-xs text-[#A1A1AA]">{card.label}</p>
          <p className={`mt-1 text-xl font-bold ${card.accent || 'text-white'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

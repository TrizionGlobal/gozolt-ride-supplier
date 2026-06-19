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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
    { label: 'Ongoing Rides', value: String(kpis.activeNow ?? 0), accent: 'text-blue-400' },
    { label: 'Completed Rides', value: String(kpis.completedRides ?? 0), accent: 'text-green-400' },
    { label: 'Cancelled Rides', value: String(kpis.cancelledRides ?? 0), accent: 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <p className="text-xs text-[#A1A1AA]">{card.label}</p>
          <p className={`mt-1 text-xl font-bold ${card.accent || 'text-white'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

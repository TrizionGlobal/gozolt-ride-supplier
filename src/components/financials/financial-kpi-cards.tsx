'use client';

import { formatCurrency } from '@/lib/utils';
import type { FinancialKPIs } from '@/types';

interface FinancialKPICardsProps {
  kpis: FinancialKPIs | null;
  isLoading: boolean;
}

export function FinancialKPICards({ kpis, isLoading }: FinancialKPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <div className="h-4 w-24 rounded bg-[#27272A] animate-pulse mb-2" />
            <div className="h-8 w-20 rounded bg-[#27272A] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Gross Revenue', value: formatCurrency(kpis.grossRevenue) },
    { label: `Commission (${kpis.commissionRate}%)`, value: formatCurrency(kpis.commissionAmount) },
    { label: 'Gross Net Revenue', value: formatCurrency(kpis.netRevenue) },
    { label: 'Pending Payout', value: formatCurrency(kpis.pendingPayout) },
    { label: 'Tip Earnings', value: formatCurrency(kpis.tipEarnings), accent: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[#27272A] bg-[#111111] p-4"
        >
          <p className="text-xs text-[#A1A1AA]">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.accent || 'text-white'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

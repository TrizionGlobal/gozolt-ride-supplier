'use client';

import { formatCurrency } from '@/lib/utils';
import type { InvoiceKpis } from '@/types';

interface InvoiceKPICardsProps {
  kpis: InvoiceKpis | null;
  isLoading: boolean;
}

export function InvoiceKPICards({ kpis, isLoading }: InvoiceKPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <div className="h-4 w-24 rounded bg-[#27272A] animate-pulse mb-2" />
            <div className="h-8 w-20 rounded bg-[#27272A] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Invoiced', value: formatCurrency(kpis.totalInvoiced) },
    { label: 'Paid', value: formatCurrency(kpis.paid), accent: 'text-green-400' },
    { label: 'Pending', value: formatCurrency(kpis.pending), accent: 'text-yellow-400' },
    { label: 'Tip Pass-Through', value: formatCurrency(kpis.tipPassThrough), accent: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <p className="text-xs text-[#A1A1AA]">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.accent || 'text-white'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

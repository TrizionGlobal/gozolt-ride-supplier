'use client';

import { formatCurrency } from '@/lib/utils';
import type { FinancialKPIs } from '@/types';
import { DollarSign, Percent, TrendingUp, Clock, HeartHandshake } from 'lucide-react';

interface FinancialKPICardsProps {
  kpis: FinancialKPIs | null;
  isLoading: boolean;
}

export function FinancialKPICards({ kpis, isLoading }: FinancialKPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl border border-[#27272A] bg-[#111111]/50 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-[#27272A] rounded animate-pulse" />
              <div className="h-8 w-8 bg-[#27272A] rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-32 bg-[#27272A] rounded animate-pulse mt-4" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { 
      label: 'Gross Revenue', 
      value: formatCurrency(kpis.grossRevenue),
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    { 
      label: `Commission (${kpis.commissionRate}%)`, 
      value: formatCurrency(kpis.commissionAmount),
      icon: Percent,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20'
    },
    { 
      label: 'Gross Net Revenue', 
      value: formatCurrency(kpis.netRevenue),
      icon: TrendingUp,
      color: 'text-white',
      bg: 'bg-white/10',
      border: 'border-[#27272A]'
    },
    { 
      label: 'Pending Payout', 
      value: formatCurrency(kpis.pendingPayout),
      icon: Clock,
      color: 'text-[#FACC15]',
      bg: 'bg-[#FACC15]/10',
      border: 'border-[#FACC15]/20'
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-[#111111]/80 backdrop-blur-xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20" style={{ color: card.color.replace('text-', '') }} />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#A1A1AA]">{card.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

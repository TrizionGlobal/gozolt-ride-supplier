import { Wallet, Banknote, CreditCard, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PerDriverEarning } from '@/types';

interface SettlementKPICardsProps {
  data: {
    totalOwed: number;
    totalCash: number;
    totalCard: number;
    totalPaid: number;
  };
  isLoading: boolean;
}

export function SettlementKPICards({ data: kpis, isLoading }: SettlementKPICardsProps) {

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl border border-[#27272A] bg-[#27272A]/50 p-6 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Owed to Drivers',
      value: formatCurrency(kpis.totalOwed),
      icon: Users,
      color: 'text-white',
      bg: 'bg-white/10',
      border: 'border-[#27272A]'
    },
    {
      label: 'Total Cash Collected',
      value: formatCurrency(kpis.totalCash),
      icon: Banknote,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20'
    },
    {
      label: 'Total Card Earnings',
      value: formatCurrency(kpis.totalCard),
      icon: CreditCard,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    },
    {
      label: 'Total Paid Out',
      value: formatCurrency(kpis.totalPaid),
      icon: Wallet,
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
            
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#A1A1AA]">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

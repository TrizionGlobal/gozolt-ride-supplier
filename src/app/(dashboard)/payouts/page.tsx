'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Landmark, Banknote, CreditCard,
  AlertCircle, Car, Bike, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Wrench, Crown, Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import type { PayoutRecord } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-[#1F1F1F] ${className}`} />
);

function PageSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0D0D0D] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-8 w-8 rounded-lg" />
            <Shimmer className="h-4 w-4 rounded" />
          </div>
          <div className="space-y-2">
            <Shimmer className="h-6 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { useSidebarStore } from '@/stores/sidebar.store';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const { activeModule } = useSidebarStore();
  const { user } = useAuthStore();

  const cabMode = user?.cabAccessMode || (user?.subscription ? 'WITH_SUBSCRIPTION' : 'COMMISSION');
  const isSubscription = cabMode === 'WITH_SUBSCRIPTION';
  const commissionRate = user?.commissionRate ?? kpis?.breakdown?.cab?.commissionRate ?? 9;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [payoutsData, kpiData] = await Promise.all([
        financialService.getPayoutHistory('CAB', page, limit),
        financialService.getFinancialKPIs(undefined, undefined, 'CAB')
      ]);
      setPayouts(payoutsData.data);
      setTotal(payoutsData.meta.total);
      setKpis(kpiData);
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (val: number | undefined) => `€${(val || 0).toFixed(2)}`;

  const KpiCard = ({
    label, value, icon: Icon, color, trend,
  }: {
    label: string; value: string; icon: any; color: string; trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0D0D0D] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-400" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
      </div>
      <div>
        <p className="text-xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs font-medium text-[#71717A] mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );

  const allServices = [
    { name: 'Cab Bookings', id: 'CAB', icon: Car, iconColor: 'bg-yellow-500/10 text-yellow-500', accentColor: 'border-yellow-500/40', data: kpis?.breakdown?.cab },
    { name: 'Car Rentals', id: 'RENTAL', icon: Car, iconColor: 'bg-blue-500/10 text-blue-500', accentColor: 'border-blue-500/40', data: kpis?.breakdown?.carRental },
    { name: 'Bike Rentals', id: 'BIKE_RENTAL', icon: Bike, iconColor: 'bg-purple-500/10 text-purple-500', accentColor: 'border-purple-500/40', data: kpis?.breakdown?.bikeRental },
    { name: 'Quick Services', id: 'QUICK_SERVICES', icon: Wrench, iconColor: 'bg-green-500/10 text-green-500', accentColor: 'border-green-500/40', data: kpis?.breakdown?.quickServices },
  ];

  const services = allServices.filter(s => s.id === 'CAB');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments &amp; Settlements</h1>
          <p className="text-sm text-[#71717A] mt-1">Revenue summary, settlement status, and earnings breakdown across all services.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-[#27272A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#D4D4D8] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Operating Model Pill */}
      <div className="flex items-center gap-3.5 p-4 rounded-xl border border-[#27272A] bg-[#111111]">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSubscription ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#FACC15]/10 text-[#FACC15]'}`}>
          {isSubscription ? <Crown className="h-5 w-5" /> : <Percent className="h-5 w-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {isSubscription ? 'Subscription Model Active' : `Commission Model (${commissionRate}% Per Ride)`}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isSubscription ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20'}`}>
              {isSubscription ? '0% Commission' : 'Pay As You Earn'}
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            {isSubscription
              ? 'You keep 100% of your completed ride fares. Zero platform commission deducted during 9-day settlements.'
              : `Platform commission (${commissionRate}%) is automatically deducted from customer total paid (Ride Fare + VAT) during 9-day settlements.`}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-8">
        {/* KPI Cards (Always visible) */}
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <KpiCard label="Net Earnings" value={fmt(kpis?.netRevenue)} icon={Landmark} color="bg-green-500/10 text-green-500" trend="up" />
            <KpiCard label="Gross Revenue" value={fmt(kpis?.grossRevenue)} icon={TrendingUp} color="bg-blue-500/10 text-blue-500" />
            <KpiCard label="Pending" value={fmt(kpis?.pendingPayout)} icon={Clock} color="bg-yellow-500/10 text-yellow-500" />
            <KpiCard label="Admin Settled" value={fmt(kpis?.settledPayout)} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-500" />
            <KpiCard label="Cancellations" value={fmt(kpis?.totalCancellations)} icon={AlertCircle} color="bg-orange-500/10 text-orange-500" trend="down" />
            <KpiCard label="Refunds" value={fmt(kpis?.totalRefunds)} icon={CreditCard} color="bg-red-500/10 text-red-500" trend="down" />
          </div>
        )}

        {/* History Table */}
        <PayoutHistoryTable 
          data={payouts} 
          isLoading={isLoading} 
          page={page}
          limit={limit}
          total={total}
          serviceName="Cab Bookings"
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Landmark, Banknote, CreditCard,
  AlertCircle, Car, Bike, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import type { PayoutRecord } from '@/types';

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-[#1F1F1F] ${className}`} />
);

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[#27272A] bg-[#0D0D0D] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-10 w-10 rounded-lg" />
              <Shimmer className="h-4 w-4 rounded" />
            </div>
            <div className="space-y-2">
              <Shimmer className="h-7 w-32" />
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-[#27272A] bg-[#0D0D0D] px-5 py-4">
            <Shimmer className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-6 w-24" />
              <Shimmer className="h-3 w-20" />
            </div>
            <Shimmer className="h-5 w-5 shrink-0 rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#0D0D0D] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-4 w-48" />
            <Shimmer className="h-3 w-36" />
          </div>
          <Shimmer className="h-4 w-4 rounded" />
        </div>
        <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A]">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className={`h-3 w-20 ${i === 0 ? '' : 'mx-auto'}`} />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 items-center px-6 py-5 border-b border-[#111] border-l-2 border-l-[#2A2A2A]">
            <div className="col-span-1 flex items-center gap-3">
              <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
              <Shimmer className="h-4 w-24" />
            </div>
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex justify-center">
                <Shimmer className="h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-[#0A0A0A] border-t border-[#27272A]">
          <Shimmer className="h-3 w-10" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-center">
              <Shimmer className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [payoutsData, kpiData] = await Promise.all([
        financialService.getPayoutHistory(),
        financialService.getFinancialKPIs()
      ]);
      setPayouts(payoutsData);
      setKpis(kpiData);
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (val: number | undefined) => `€${(val || 0).toFixed(2)}`;

  const KpiCard = ({
    label, value, icon: Icon, color, sub, trend,
  }: {
    label: string; value: string; icon: any; color: string; sub?: string; trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0D0D0D] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-400" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs font-medium text-[#71717A] mt-1">{label}</p>
        {sub && <p className="text-xs text-[#52525B] mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  const services = [
    { name: 'Cab Bookings', icon: Car, iconColor: 'bg-yellow-500/10 text-yellow-500', accentColor: 'border-yellow-500/40', data: kpis?.breakdown?.cab },
    { name: 'Car Rentals', icon: Car, iconColor: 'bg-blue-500/10 text-blue-500', accentColor: 'border-blue-500/40', data: kpis?.breakdown?.carRental },
    { name: 'Bike Rentals', icon: Bike, iconColor: 'bg-purple-500/10 text-purple-500', accentColor: 'border-purple-500/40', data: kpis?.breakdown?.bikeRental },
  ];

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

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#27272A]">
        {(['overview', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-[#A1A1AA] hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Overview' : 'Payout History'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        isLoading ? <PageSkeleton /> : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Total Net Earnings" value={fmt(kpis?.netRevenue)} icon={Landmark} color="bg-green-500/10 text-green-500" sub="After all deductions" trend="up" />
              <KpiCard label="Gross Revenue" value={fmt(kpis?.grossRevenue)} icon={TrendingUp} color="bg-blue-500/10 text-blue-500" sub="Before refunds & cancellations" />
              <KpiCard label="Pending Settlement" value={fmt(kpis?.pendingPayout)} icon={Clock} color="bg-yellow-500/10 text-yellow-500" sub="Awaiting admin payout" />
              <KpiCard label="Admin Settled" value={fmt(kpis?.settledPayout)} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-500" sub="Total received from admin" />
            </div>

            {/* Deductions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-[#27272A] bg-[#0D0D0D] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 shrink-0"><AlertCircle className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#71717A] mb-0.5">Total Cancellations</p>
                  <p className="text-xl font-bold text-orange-400">{fmt(kpis?.totalCancellations)}</p>
                  <p className="text-xs text-[#52525B] mt-0.5">Across all services</p>
                </div>
                <TrendingDown className="h-5 w-5 text-orange-500/30 shrink-0" />
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#27272A] bg-[#0D0D0D] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500 shrink-0"><CreditCard className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#71717A] mb-0.5">Total Refunds Issued</p>
                  <p className="text-xl font-bold text-red-400">{fmt(kpis?.totalRefunds)}</p>
                  <p className="text-xs text-[#52525B] mt-0.5">Returned to customers</p>
                </div>
                <TrendingDown className="h-5 w-5 text-red-500/30 shrink-0" />
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-xl border border-[#27272A] bg-[#0D0D0D] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Earnings Breakdown by Service</h3>
                  <p className="text-xs text-[#52525B] mt-0.5">Revenue split across each service module</p>
                </div>
                <Banknote className="h-4 w-4 text-[#3F3F46]" />
              </div>
              <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A]">
                <div className="col-span-1 text-xs font-semibold text-[#52525B] uppercase tracking-wider">Service</div>
                <div className="text-center text-xs font-semibold text-[#52525B] uppercase tracking-wider">Gross Earned</div>
                <div className="text-center text-xs font-semibold text-[#52525B] uppercase tracking-wider">Cancellations</div>
                <div className="text-center text-xs font-semibold text-[#52525B] uppercase tracking-wider">Refunds</div>
                <div className="text-center text-xs font-semibold text-[#52525B] uppercase tracking-wider">Net Earnings</div>
              </div>
              <div className="divide-y divide-[#111]">
                {services.map(({ name, icon: SIcon, iconColor, accentColor, data }) => {
                  const net = data?.netAmount ?? 0;
                  return (
                    <div key={name} className={`grid grid-cols-5 gap-4 items-center px-6 py-5 border-l-2 ${accentColor} hover:bg-[#0F0F0F] transition-colors`}>
                      <div className="col-span-1 flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${iconColor}`}><SIcon className="h-4 w-4" /></div>
                        <span className="text-sm font-medium text-white">{name}</span>
                      </div>
                      <div className="text-center"><span className="text-sm font-semibold text-white">{fmt(data?.totalEarned)}</span></div>
                      <div className="text-center"><span className="text-sm font-medium text-orange-400">{(data?.cancellations || 0) > 0 ? '-' : ''}{fmt(data?.cancellations)}</span></div>
                      <div className="text-center"><span className="text-sm font-medium text-red-400">{(data?.refunds || 0) > 0 ? '-' : ''}{fmt(data?.refunds)}</span></div>
                      <div className="text-center"><span className={`text-sm font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(net)}</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-[#0A0A0A] border-t border-[#27272A]">
                <div className="col-span-1"><span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Total</span></div>
                <div className="text-center"><span className="text-sm font-bold text-white">{fmt(kpis?.grossRevenue)}</span></div>
                <div className="text-center"><span className="text-sm font-bold text-orange-400">-{fmt(kpis?.totalCancellations)}</span></div>
                <div className="text-center"><span className="text-sm font-bold text-red-400">-{fmt(kpis?.totalRefunds)}</span></div>
                <div className="text-center"><span className="text-sm font-bold text-green-400">{fmt(kpis?.netRevenue)}</span></div>
              </div>
            </div>
          </div>
        )
      )}

      {/* History */}
      {activeTab === 'history' && (
        <PayoutHistoryTable data={payouts} isLoading={isLoading} />
      )}
    </div>
  );
}

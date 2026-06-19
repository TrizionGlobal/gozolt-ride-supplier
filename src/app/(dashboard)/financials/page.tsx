'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { financialService } from '@/services/financials/financial.service';
import { FinancialKPICards } from '@/components/financials/financial-kpi-cards';
import { RevenueTrendChart } from '@/components/financials/revenue-trend-chart';
import { PerDriverEarningsTable } from '@/components/financials/per-driver-earnings-table';
import type { FinancialKPIs, RevenueTrendPoint, PerDriverEarning } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useCallback } from 'react';

const periodOptions = [
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Last 6 Months',
  'This Year',
];

export default function FinancialsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('This Month');
  const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [driverEarnings, setDriverEarnings] = useState<PerDriverEarning[]>([]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      let fromDate: Date | undefined;
      const today = new Date();
      if (period === 'This Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (period === 'Last Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      } else if (period === 'Last 3 Months') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      } else if (period === 'Last 6 Months') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      } else if (period === 'This Year') {
        fromDate = new Date(today.getFullYear(), 0, 1);
      }
      
      let toDate: Date | undefined;
      if (period === 'Last Month') {
        toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      }

      const fromStr = fromDate?.toISOString();
      const toStr = toDate?.toISOString();

      const [kpiData, trendData, earningsData] = await Promise.all([
        financialService.getFinancialKPIs(fromStr, toStr),
        financialService.getRevenueTrend(fromStr, toStr),
        financialService.getPerDriverEarnings(fromStr, toStr),
      ]);
      setKpis(kpiData);
      setRevenueTrend(trendData);
      setDriverEarnings(earningsData);
    } catch {
      // handled in services
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFleetTracking({ onRefresh: loadAll });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Earnings & Settlements</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center rounded-md border border-[#3F3F46] bg-[#1A1A1A] p-2 text-[#A1A1AA] hover:text-white transition-colors">
            <Calendar className="h-4 w-4" />
          </button>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-md border border-[#3F3F46] bg-[#1A1A1A] pl-3 pr-8 py-2 text-sm text-white focus:border-[#FACC15] focus:outline-none"
            >
              {periodOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <FinancialKPICards kpis={kpis} isLoading={isLoading} />

      {/* Revenue Trend Chart */}
      <RevenueTrendChart data={revenueTrend} isLoading={isLoading} />

      {/* Driver Settlements Table */}
      <PerDriverEarningsTable 
        data={driverEarnings} 
        isLoading={isLoading} 
        onRefresh={loadAll}
      />
    </div>
  );
}

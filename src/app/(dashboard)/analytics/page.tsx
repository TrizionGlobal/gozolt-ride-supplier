'use client';

import { toast } from 'sonner';
import { RidesWeekChart } from '@/components/analytics/rides-week-chart';
import { RevenueWeekChart } from '@/components/analytics/revenue-week-chart';
import { DriverPerformanceChart } from '@/components/analytics/driver-performance-chart';
import { SystemDistributionChart } from '@/components/analytics/system-distribution-chart';
import { TipsWeekChart } from '@/components/analytics/tips-week-chart';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
export default function AnalyticsPage() {
  const [ridesData, setRidesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [driverPerfData, setDriverPerfData] = useState([]);
  const [systemDistData, setSystemDistData] = useState([]);
  const [tipsData, setTipsData] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [rides, revenue, perf, dist, tips] = await Promise.allSettled([
          apiClient.get('/suppliers/analytics/rides-trend'),
          apiClient.get('/suppliers/analytics/revenue-trend'),
          apiClient.get('/suppliers/analytics/driver-performance'),
          apiClient.get('/suppliers/analytics/system-distribution'),
          apiClient.get('/suppliers/analytics/tips-trend')
        ]);
        
        if (rides.status === 'fulfilled') setRidesData(rides.value.data || []);
        if (revenue.status === 'fulfilled') setRevenueData(revenue.value.data || []);
        if (perf.status === 'fulfilled') setDriverPerfData(perf.value.data || []);
        if (dist.status === 'fulfilled') setSystemDistData(dist.value.data || []);
        if (tips.status === 'fulfilled') setTipsData(tips.value.data || []);
      } catch (err) {
        console.error('Failed to load analytics', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={() => toast.info('Export coming soon')}
          className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          Export
        </button>
      </div>

      {/* Row 1: Rides + Revenue */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RidesWeekChart data={ridesData} />
        <RevenueWeekChart data={revenueData} />
      </div>

      {/* Row 2: Driver Performance + System Distribution */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DriverPerformanceChart data={driverPerfData} />
        <SystemDistributionChart data={systemDistData} />
      </div>

      {/* Row 3: Tips Trend */}
      <TipsWeekChart data={tipsData} />
    </div>
  );
}

'use client';


import { RidesWeekChart } from '@/components/analytics/rides-week-chart';
import { RevenueWeekChart } from '@/components/analytics/revenue-week-chart';
import { DriverPerformanceChart } from '@/components/analytics/driver-performance-chart';
import { SystemDistributionChart } from '@/components/analytics/system-distribution-chart';
import { TipsWeekChart } from '@/components/analytics/tips-week-chart';
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
export default function AnalyticsPage() {
  const [ridesData, setRidesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [driverPerfData, setDriverPerfData] = useState([]);
  const [systemDistData, setSystemDistData] = useState([]);
  const [tipsData, setTipsData] = useState([]);
  const [kpiData, setKpiData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rides, revenue, perf, dist, tips, kpis] = await Promise.allSettled([
        apiClient.get('/suppliers/analytics/rides-trend'),
        apiClient.get('/suppliers/analytics/revenue-trend'),
        apiClient.get('/suppliers/analytics/driver-performance'),
        apiClient.get('/suppliers/analytics/system-distribution'),
        apiClient.get('/suppliers/analytics/tips-trend'),
        apiClient.get('/suppliers/analytics')
      ]);
      
      const formatDay = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      };

      if (rides.status === 'fulfilled') {
        const data = (rides.value.data || []).map((b: any) => ({
          day: formatDay(b.periodStart),
          value: b.total,
        }));
        setRidesData(data);
      }
      
      if (revenue.status === 'fulfilled') {
        const data = (revenue.value.data || []).map((b: any) => ({
          day: formatDay(b.periodStart),
          value: b.revenue,
        }));
        setRevenueData(data);
      }
      
      if (perf.status === 'fulfilled') {
        setDriverPerfData(perf.value.data || []);
      }
      
      if (dist.status === 'fulfilled') {
        setSystemDistData(dist.value.data || []);
      }
      
      if (tips.status === 'fulfilled') {
        const data = (tips.value.data || []).map((b: any) => ({
          day: formatDay(b.periodStart),
          value: b.value,
        }));
        setTipsData(data);
      }
      
      if (kpis.status === 'fulfilled') setKpiData(kpis.value.data || null);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFleetTracking({ onRefresh: loadData });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* KPI Skeleton Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[104px] rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#27272A]" />
                <div className="mt-4 h-8 w-1/3 animate-pulse rounded bg-[#27272A]" />
              </div>
            ))}
          </div>
          {/* Row 1 Skeletons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-[280px] rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-[#27272A]" />
                <div className="h-[200px] w-full animate-pulse rounded bg-[#27272A]" />
              </div>
            ))}
          </div>
          {/* Row 2 Skeletons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-[310px] rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-[#27272A]" />
                <div className="h-[220px] w-full animate-pulse rounded bg-[#27272A]" />
              </div>
            ))}
          </div>
          {/* Row 3 Skeleton */}
          <div className="h-[280px] rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <div className="mb-4 h-5 w-1/4 animate-pulse rounded bg-[#27272A]" />
            <div className="h-[200px] w-full animate-pulse rounded bg-[#27272A]" />
          </div>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          {kpiData && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <h3 className="text-sm text-[#A1A1AA]">Total Revenue</h3>
                <p className="mt-2 text-2xl font-bold text-white">€{kpiData.totalRevenue?.toLocaleString() ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <h3 className="text-sm text-[#A1A1AA]">Completed Rides</h3>
                <p className="mt-2 text-2xl font-bold text-white">{kpiData.completedRides?.toLocaleString() ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <h3 className="text-sm text-[#A1A1AA]">Active Drivers</h3>
                <p className="mt-2 text-2xl font-bold text-white">{kpiData.activeDrivers?.toLocaleString() ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
                <h3 className="text-sm text-[#A1A1AA]">Total Tips</h3>
                <p className="mt-2 text-2xl font-bold text-white">€{kpiData.totalTips?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
}

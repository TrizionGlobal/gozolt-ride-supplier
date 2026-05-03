'use client';

import { toast } from 'sonner';
import { RidesWeekChart } from '@/components/analytics/rides-week-chart';
import { RevenueWeekChart } from '@/components/analytics/revenue-week-chart';
import { DriverPerformanceChart } from '@/components/analytics/driver-performance-chart';
import { SystemDistributionChart } from '@/components/analytics/system-distribution-chart';
import { TipsWeekChart } from '@/components/analytics/tips-week-chart';
import {
  mockRidesThisWeek,
  mockRevenueTrendWeekly,
  mockDriverPerformance,
  mockSystemDistribution,
  mockTipTrendWeek,
} from '@/lib/mock-data';

export default function AnalyticsPage() {
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
        <RidesWeekChart data={mockRidesThisWeek} />
        <RevenueWeekChart data={mockRevenueTrendWeekly} />
      </div>

      {/* Row 2: Driver Performance + System Distribution */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DriverPerformanceChart data={mockDriverPerformance} />
        <SystemDistributionChart data={mockSystemDistribution} />
      </div>

      {/* Row 3: Tips Trend */}
      <TipsWeekChart data={mockTipTrendWeek} />
    </div>
  );
}

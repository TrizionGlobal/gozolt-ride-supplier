'use client';

import { apiClient } from '@/lib/api-client';
import type { DashboardKpis } from '@/types';
import { mockDashboardKpis } from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const dashboardService = {
  async getKpis(): Promise<DashboardKpis> {
    if (isDevBypassed()) return mockDashboardKpis;
    try {
      const res = await apiClient.get('/suppliers/analytics');
      return {
        activeDrivers: res.data.activeDrivers ?? 0,
        totalVehicles: res.data.totalVehicles ?? 0,
        ridesToday: res.data.ridesToday ?? 0,
        revenueMTD: res.data.totalRevenue ?? 0,
        tipEarningsMTD: res.data.tipEarnings ?? 0,
      };
    } catch {
      return mockDashboardKpis;
    }
  },
};

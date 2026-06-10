'use client';

import { apiClient } from '@/lib/api-client';
import type { DashboardKpis } from '@/types';


export const dashboardService = {
  async getKpis(): Promise<DashboardKpis> {
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
      return {
        activeDrivers: 0,
        totalVehicles: 0,
        ridesToday: 0,
        revenueMTD: 0,
        tipEarningsMTD: 0,
      };
    }
  },
};

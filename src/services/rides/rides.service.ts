'use client';

import { apiClient } from '@/lib/api-client';
import type { SupplierRideListItem, SupplierRideKpis } from '@/types';
import { mockSupplierRides, mockSupplierRideKpis } from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const ridesService = {
  async getRides(params?: { status?: string; search?: string; page?: number }): Promise<{
    data: SupplierRideListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (isDevBypassed()) {
      let filtered = [...mockSupplierRides];
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.displayId.toLowerCase().includes(s) ||
            r.driverName.toLowerCase().includes(s) ||
            r.riderName.toLowerCase().includes(s),
        );
      }
      return { data: filtered, total: filtered.length, page: 1, totalPages: 1 };
    }
    const res = await apiClient.get('/suppliers/rides', { params });
    return res.data;
  },

  async getKpis(): Promise<SupplierRideKpis> {
    if (isDevBypassed()) return mockSupplierRideKpis;
    const res = await apiClient.get('/suppliers/analytics');
    return res.data;
  },
};

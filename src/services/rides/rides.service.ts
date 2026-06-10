'use client';

import { apiClient } from '@/lib/api-client';
import type { SupplierRideListItem, SupplierRideKpis } from '@/types';


export const ridesService = {
  async getRides(params?: { status?: string; search?: string; page?: number }): Promise<{
    data: SupplierRideListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const res = await apiClient.get('/suppliers/rides', { params });
      return res.data;
    } catch {
      return { data: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  async getKpis(): Promise<SupplierRideKpis> {
    try {
      const res = await apiClient.get('/suppliers/analytics');
      return res.data;
    } catch {
      return {
        totalRides: 0,
        completedRides: 0,
        cancelledRides: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
      };
    }
  },
};

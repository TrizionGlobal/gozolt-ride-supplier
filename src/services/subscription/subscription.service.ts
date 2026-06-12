'use client';

import { apiClient } from '@/lib/api-client';
import type { SubscriptionInfo } from '@/types';


export const subscriptionService = {
  async getSubscription(): Promise<SubscriptionInfo> {
    try {
      const res = await apiClient.get('/suppliers/subscription');
      return res.data;
    } catch {
      return { tier: 'STARTER', maxVehicles: 5, maxDrivers: 5, currentPeriodEnd: new Date().toISOString() };
    }
  },

  async getUsage(): Promise<{ totalVehicles: number; totalDrivers: number }> {
    try {
      const res = await apiClient.get('/suppliers/analytics');
      const data = res.data;
      return { totalVehicles: data.totalVehicles || 0, totalDrivers: data.totalDrivers || 0 };
    } catch {
      return { totalVehicles: 0, totalDrivers: 0 };
    }
  },

  async changePlan(tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'): Promise<SubscriptionInfo> {    const res = await apiClient.patch('/suppliers/subscription', { tier });
    return res.data;
  },
};

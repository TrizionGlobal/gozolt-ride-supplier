'use client';

import { apiClient } from '@/lib/api-client';
import type { SubscriptionInfo } from '@/types';
import { mockSubscriptionInfo, mockSubscriptionUsage } from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const subscriptionService = {
  async getSubscription(): Promise<SubscriptionInfo> {
    if (isDevBypassed()) return mockSubscriptionInfo;

    try {
      const res = await apiClient.get('/suppliers/subscription');
      return res.data;
    } catch {
      return mockSubscriptionInfo;
    }
  },

  async getUsage(): Promise<{ totalVehicles: number; totalDrivers: number }> {
    if (isDevBypassed()) return mockSubscriptionUsage;

    try {
      const res = await apiClient.get('/suppliers/analytics');
      const data = res.data;
      return { totalVehicles: data.totalVehicles || 0, totalDrivers: data.totalDrivers || 0 };
    } catch {
      return mockSubscriptionUsage;
    }
  },

  async changePlan(tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'): Promise<SubscriptionInfo> {
    if (isDevBypassed()) {
      const limits: Record<string, { maxVehicles: number; maxDrivers: number }> = {
        STARTER: { maxVehicles: 5, maxDrivers: 5 },
        PROFESSIONAL: { maxVehicles: 25, maxDrivers: 25 },
        ENTERPRISE: { maxVehicles: 9999, maxDrivers: 9999 },
      };
      return {
        tier,
        ...limits[tier],
        currentPeriodEnd: mockSubscriptionInfo.currentPeriodEnd,
      };
    }

    const res = await apiClient.patch('/suppliers/subscription', { tier });
    return res.data;
  },
};

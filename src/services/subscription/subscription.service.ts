'use client';

import { apiClient } from '@/lib/api-client';
import type { SubscriptionInfo } from '@/types';

type SubscriptionTier =
  | 'STARTER'
  | 'GROWTH'
  | 'PROFESSIONAL'
  | 'ENTERPRISE';

interface SetupSubscriptionPayload {
  subscriptionTier: SubscriptionTier;
  paymentMethodId: string;
}

interface SubscriptionUsage {
  totalVehicles: number;
  totalDrivers: number;
  totalRides: number;
}

export const subscriptionService = {
  async getSubscription():
    Promise<SubscriptionInfo | null> {
    try {
      const response = await apiClient.get(
        '/suppliers/subscription'
      );

      return response.data;
    } catch {
      return null;
    }
  },

  async getUsage():
    Promise<SubscriptionUsage> {
    try {
      const response = await apiClient.get(
        '/suppliers/analytics'
      );

      const data = response.data;

      return {
        totalVehicles:
          data.totalVehicles || 0,
        totalDrivers:
          data.totalDrivers || 0,
        totalRides:
          data.totalRides || 0,
      };
    } catch {
      return {
        totalVehicles: 0,
        totalDrivers: 0,
        totalRides: 0,
      };
    }
  },

  async changePlan(
    tier: SubscriptionTier,
    paymentMethodId?: string
  ): Promise<SubscriptionInfo> {
    const response = await apiClient.patch(
      '/suppliers/subscription',
      {
        tier,
        paymentMethodId,
      }
    );

    return response.data;
  },

  async setupSubscription(
    payload: SetupSubscriptionPayload
  ): Promise<SubscriptionInfo> {
    const response = await apiClient.post(
      '/suppliers/subscribe',
      payload
    );

    return response.data;
  },

  async cancelSubscription():
    Promise<void> {
    await apiClient.post(
      '/suppliers/subscription/cancel'
    );
  },
};
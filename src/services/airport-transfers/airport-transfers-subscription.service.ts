'use client';

import { apiClient } from '@/lib/api-client';
import type { SubscriptionInfo } from '@/types';

export type SubscriptionTier =
  | 'STARTER'
  | 'GROWTH'
  | 'PROFESSIONAL'
  | 'ENTERPRISE';

export interface SetupAirportSubscriptionPayload {
  subscriptionTier: SubscriptionTier;
  paymentMethodId: string;
}

export interface AirportSubscriptionUsage {
  totalVehicles: number;
  totalDrivers: number;
  totalRides: number;
}

export const airportTransfersSubscriptionService = {
  async getSubscription(): Promise<SubscriptionInfo | null> {
    try {
      const response = await apiClient.get('/suppliers/subscription');
      return response.data;
    } catch {
      return null;
    }
  },

  async getUsage(): Promise<AirportSubscriptionUsage> {
    try {
      const response = await apiClient.get('/airport-transfers/supplier/dashboard');
      const data = response.data;
      return {
        totalVehicles: data.totalVehicles || 0,
        totalDrivers: data.availableVehicles || 0,
        totalRides: data.activeTransfers || 0,
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
    const response = await apiClient.patch('/suppliers/subscription', {
      tier,
      paymentMethodId,
    });
    return response.data;
  },

  async setupSubscription(
    payload: SetupAirportSubscriptionPayload
  ): Promise<SubscriptionInfo> {
    const response = await apiClient.post('/suppliers/subscribe', payload);
    return response.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.post('/suppliers/subscription/cancel');
  },
};

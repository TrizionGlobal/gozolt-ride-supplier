'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { quickServiceAnalyticsService } from '@/services/quick-services/quick-service-analytics.service';

import type {
  QuickServiceAnalyticsPeriod,
  QuickServiceAnalyticsResponse,
} from '@/services/quick-services/quick-service-analytics.types';

const initialAnalytics: QuickServiceAnalyticsResponse = {
  summary: {
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    currency: 'EUR',
    completionRate: 0,
    cancellationRate: 0,
  },
  bookingTrend: [],
  bookingsByService: [],
  workerPerformance: [],
};

export function useQuickServiceAnalytics(
  period: QuickServiceAnalyticsPeriod
) {
  const [analytics, setAnalytics] =
    useState<QuickServiceAnalyticsResponse>(
      initialAnalytics
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        await quickServiceAnalyticsService.getAnalytics(
          period
        );

      setAnalytics(result);
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ||
        'Quick Services analytics could not be loaded.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message
      );
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics,
  };
}
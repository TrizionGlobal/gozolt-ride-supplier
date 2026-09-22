import { apiClient } from '@/lib/api-client';

import type {
  QuickServiceAnalyticsPeriod,
  QuickServiceAnalyticsResponse,
} from './quick-service-analytics.types';

const emptyAnalytics: QuickServiceAnalyticsResponse = {
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

export const quickServiceAnalyticsService = {
  async getAnalytics(
    period: QuickServiceAnalyticsPeriod
  ): Promise<QuickServiceAnalyticsResponse> {
    const response = await apiClient.get(
      '/quick-services/supplier/analytics',
      {
        params: {
          period,
        },
      }
    );

    const responseData =
      response.data?.data ?? response.data;

    return {
      summary:
        responseData?.summary ??
        emptyAnalytics.summary,

      bookingTrend:
        responseData?.bookingTrend ?? [],

      bookingsByService:
        responseData?.bookingsByService ?? [],

      workerPerformance:
        responseData?.workerPerformance ?? [],
    };
  },
};
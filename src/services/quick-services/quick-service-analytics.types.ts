export type QuickServiceAnalyticsPeriod =
  | '7_DAYS'
  | '30_DAYS'
  | '3_MONTHS'
  | '12_MONTHS';

export interface QuickServiceAnalyticsSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  activeBookings: number;
  totalRevenue: number;
  currency: string;
  completionRate: number;
  cancellationRate: number;
}

export interface QuickServiceBookingTrendItem {
  label: string;
  date: string;
  bookings: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface QuickServiceCategoryAnalytics {
  categoryId: string;
  categoryName: string;
  bookings: number;
  completed: number;
  revenue: number;
  percentage: number;
}

export interface QuickServiceWorkerPerformance {
  workerId: string;
  workerName: string;
  assignedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  averageRating?: number | null;
}

export interface QuickServiceAnalyticsResponse {
  summary: QuickServiceAnalyticsSummary;
  bookingTrend: QuickServiceBookingTrendItem[];
  bookingsByService: QuickServiceCategoryAnalytics[];
  workerPerformance: QuickServiceWorkerPerformance[];
}
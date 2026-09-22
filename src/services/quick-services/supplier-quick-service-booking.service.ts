import { apiClient } from '@/lib/api-client';

import type {
  AssignQuickServiceWorkerPayload,
  QuickServiceBooking,
  QuickServiceBookingFilters,
  QuickServiceBookingListResponse,
  QuickServiceWorker,
  QuickServiceWorkerListResponse,
} from './quick-service-booking.types';

const createQueryString = (
  filters: QuickServiceBookingFilters
) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.categoryId) {
    params.set('categoryId', filters.categoryId);
  }

  if (filters.childService) {
    params.set('childService', filters.childService);
}

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (
    filters.assignment &&
    filters.assignment !== 'ALL'
  ) {
    params.set('assignment', filters.assignment);
  }

  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 20));

  return params.toString();
};

export const supplierQuickServiceBookingService = {
  async getBookings(
    filters: QuickServiceBookingFilters
  ): Promise<QuickServiceBookingListResponse> {
    const queryString = createQueryString(filters);

    const response = await apiClient.get(
      `/quick-services/supplier/bookings?${queryString}`
    );

    const responseData = response.data;
    const bookings =
      responseData?.data ??
      responseData?.bookings ??
      [];

    return {
      bookings,
      total:
        responseData?.meta?.total ??
        responseData?.total ??
        bookings.length,
      page:
        responseData?.meta?.page ??
        responseData?.page ??
        filters.page ??
        1,
      limit:
        responseData?.meta?.limit ??
        responseData?.limit ??
        filters.limit ??
        20,
    };
  },

  async getBooking(
    bookingId: string
  ): Promise<QuickServiceBooking> {
    const response = await apiClient.get(
      `/quick-services/supplier/bookings/${bookingId}`
    );

    return response.data?.data ?? response.data;
  },

  async acceptBooking(
    bookingId: string
  ): Promise<QuickServiceBooking> {
    const response = await apiClient.patch(
      `/quick-services/supplier/bookings/${bookingId}/accept`
    );

    return response.data?.data ?? response.data;
  },

  async rejectBooking(
    bookingId: string,
    reason?: string
  ): Promise<QuickServiceBooking> {
    const response = await apiClient.patch(
      `/quick-services/supplier/bookings/${bookingId}/reject`,
      { reason }
    );

    return response.data?.data ?? response.data;
  },

  async assignToMyself(
    bookingId: string
  ): Promise<QuickServiceBooking> {
    const response = await apiClient.patch(
      `/quick-services/supplier/bookings/${bookingId}/assign-self`
    );

    return response.data?.data ?? response.data;
  },

  async assignWorker(
    bookingId: string,
    payload: AssignQuickServiceWorkerPayload
  ): Promise<QuickServiceBooking> {
    const response = await apiClient.patch(
      `/quick-services/supplier/bookings/${bookingId}/assign-worker`,
      payload
    );

    return response.data?.data ?? response.data;
  },

  async getWorkers(
    page = 1,
    limit = 100
  ): Promise<QuickServiceWorkerListResponse> {
    const response = await apiClient.get(
      `/quick-services/supplier/workers?page=${page}&limit=${limit}`
    );

    const responseData = response.data;
    const workers: QuickServiceWorker[] =
      responseData?.data ??
      responseData?.workers ??
      [];

    return {
      workers,
      total:
        responseData?.meta?.total ??
        responseData?.total ??
        workers.length,
    };
  },
};

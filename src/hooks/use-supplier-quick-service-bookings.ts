'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';

import type {
  QuickServiceBooking,
  QuickServiceBookingFilters,
} from '@/services/quick-services/quick-service-booking.types';

const bookingsCache: Record<string, { bookings: QuickServiceBooking[], total: number, timestamp: number }> = {};

export function useSupplierQuickServiceBookings(
  filters: QuickServiceBookingFilters
) {
  const [bookings, setBookings] = useState<
    QuickServiceBooking[]
  >([]);

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const {
    search,
    categoryId,
    childService,
    status,
    assignment,
    page = 1,
    limit = 20,
  } = filters;

  const fetchBookings = useCallback(async (force = false) => {
    const cacheKey = JSON.stringify({ search, categoryId, childService, status, assignment, page, limit });

    // If not forcing and cache exists and is less than 5 minutes old
    if (!force && bookingsCache[cacheKey] && (Date.now() - bookingsCache[cacheKey].timestamp < 5 * 60 * 1000)) {
      setBookings(bookingsCache[cacheKey].bookings);
      setTotal(bookingsCache[cacheKey].total);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await supplierQuickServiceBookingService.getBookings({
          search,
          categoryId,
          childService,
          status,
          assignment,
          page,
          limit,
        });

      bookingsCache[cacheKey] = {
        bookings: result.bookings,
        total: result.total,
        timestamp: Date.now()
      };

      setBookings(result.bookings);
      setTotal(result.total);
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ||
        'Failed to load Quick Services bookings.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    search,
    categoryId,
    childService,
    status,
    assignment,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const runBookingAction = useCallback(
    async (
      action: () => Promise<QuickServiceBooking>,
      successMessage: string
    ) => {
      setIsActionLoading(true);

      try {
        const updatedBooking = await action();

        setBookings((currentBookings) =>
          currentBookings.map((booking) =>
            booking.id === updatedBooking.id
              ? updatedBooking
              : booking
          )
        );

        toast.success(successMessage);

        await fetchBookings(true);

        return updatedBooking;
      } catch (actionError: any) {
        const message =
          actionError?.response?.data?.message ||
          actionError?.message ||
          'Booking action failed.';

        toast.error(
          Array.isArray(message)
            ? message.join(', ')
            : message
        );

        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [fetchBookings]
  );

  const acceptBooking = useCallback(
    (bookingId: string) =>
      runBookingAction(
        () =>
          supplierQuickServiceBookingService.acceptBooking(
            bookingId
          ),
        'Booking accepted successfully.'
      ),
    [runBookingAction]
  );

  const rejectBooking = useCallback(
    (bookingId: string, reason?: string) =>
      runBookingAction(
        () =>
          supplierQuickServiceBookingService.rejectBooking(
            bookingId,
            reason
          ),
        'Booking rejected successfully.'
      ),
    [runBookingAction]
  );

  const assignToMyself = useCallback(
    (bookingId: string) =>
      runBookingAction(
        () =>
          supplierQuickServiceBookingService.assignToMyself(
            bookingId
          ),
        'Booking assigned to you.'
      ),
    [runBookingAction]
  );

  const assignWorker = useCallback(
    (bookingId: string, workerId: string) =>
      runBookingAction(
        () =>
          supplierQuickServiceBookingService.assignWorker(
            bookingId,
            { workerId }
          ),
        'Worker assigned successfully.'
      ),
    [runBookingAction]
  );

  return {
    bookings,
    total,
    isLoading,
    isActionLoading,
    error,

    refresh: () => fetchBookings(true),
    acceptBooking,
    rejectBooking,
    assignToMyself,
    assignWorker,
  };
}
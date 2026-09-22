'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';

import type { QuickServiceWorker } from '@/services/quick-services/quick-service-booking.types';

export function useQuickServiceWorkers(
  enabled = true
) {
  const [workers, setWorkers] = useState<
    QuickServiceWorker[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const fetchWorkers = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await supplierQuickServiceBookingService.getWorkers(
          1,
          100
        );

      setWorkers(result.workers);
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ||
        'Failed to load workers.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return {
    workers,
    isLoading,
    error,
    refresh: fetchWorkers,
  };
}
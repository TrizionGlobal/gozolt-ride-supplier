'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import {
  supplierLogin,
  supplierRegister,
  logout,
} from '@/services/auth/auth.service';
import type { SupplierLoginPayload } from '@/services/auth/auth.types';

export function useAuth() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    clearAuth,
  } = useAuthStore();

  const login = useCallback(
    async (payload: SupplierLoginPayload) => {
      setLoading(true);

      try {
        // 1. Authenticate with the backend
        const response = await supplierLogin(payload);

        // 2. Save access and refresh tokens as HTTP-only cookies
        const sessionResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }),
        });

        if (!sessionResponse.ok) {
          throw new Error('Unable to create supplier session.');
        }

        // Kept for compatibility with existing portal functionality
        localStorage.setItem(
          'supplier_token',
          response.accessToken
        );

        // 3. Get the service selected on the landing page
        const selectedService = localStorage.getItem(
          'gozolt-selected-service'
        );

        if (!selectedService) {
          useSidebarStore.getState().setActiveModule(null);
          router.push('/');
          return;
        }

        // 4. Fetch the authenticated supplier profile
        const meResponse = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        if (!meResponse.ok) {
          throw new Error(
            'Unable to retrieve the supplier profile.'
          );
        }

        const profileData = await meResponse.json();
        const supplier = profileData.user;

        setUser(supplier);

        // 5. Set the sidebar module and its dashboard route
        const sidebarStore = useSidebarStore.getState();

        let dashboardPath = '/';

        switch (selectedService) {
          case 'CAB':
            sidebarStore.setActiveModule('CAB');
            dashboardPath = '/dashboard';
            break;

          case 'CAR_RENTAL':
            sidebarStore.setActiveModule('RENTAL');
            dashboardPath = '/car-rentals/dashboard';
            break;

          case 'BIKE_RENTAL':
            sidebarStore.setActiveModule('BIKE_RENTAL');
            dashboardPath = '/bike-rentals/dashboard';
            break;

          case 'QUICK_SERVICES':
            sidebarStore.setActiveModule('QUICK_SERVICES');
            dashboardPath = '/quick-services/dashboard';
            break;

          default:
            sidebarStore.setActiveModule(null);
            router.push('/');
            return;
        }

        // 6. Check whether the supplier has an active subscription
        const subscription = supplier.subscription;

        const hasActiveSubscription =
          subscription &&
          subscription.currentPeriodEnd &&
          new Date(subscription.currentPeriodEnd) > new Date();

        if (!hasActiveSubscription) {
          const quickServicesMode = localStorage.getItem(
            'quick-services-access-mode'  
          );
           if (
              quickServicesMode !== 'WITH_SUBSCRIPTION' &&
              quickServicesMode !== 'WITHOUT_SUBSCRIPTION'
              ) {
              router.push('/quick-services/subscription');
              return;
            }

            router.push('/quick-services/dashboard');
            return;
            }

            if (!hasActiveSubscription) {
            router.push(
             `/subscription?service=${encodeURIComponent(
             selectedService
            )}`
            );
             return;
        } 
        router.push(dashboardPath);

        // 7. Open the selected service dashboard
        router.push(dashboardPath);
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  const register = useCallback(
    async (payload: FormData) => {
      setLoading(true);

      try {
        return await supplierRegister(payload);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('supplier_token');
      localStorage.removeItem('gozolt-selected-service');

      useSidebarStore.getState().setActiveModule(null);
      clearAuth();

      // Return to the four-service landing page
      router.push('/');
    }
  }, [router, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
}
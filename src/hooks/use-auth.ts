'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { supplierLogin, supplierRegister, logout } from '@/services/auth/auth.service';
import type { SupplierLoginPayload } from '@/services/auth/auth.types';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, clearAuth } = useAuthStore();

  const login = useCallback(
    async (payload: SupplierLoginPayload) => {
      setLoading(true);
      try {
        const response = await supplierLogin(payload);

        // Set HTTP-only cookies via API route
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }),
        });

        let redirectPath = '/module-selection';

        // Fetch the supplier profile
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
          
          // Check subscription status
          const hasActiveSubscription = data.user.subscription && new Date(data.user.subscription.currentPeriodEnd) > new Date();
          if (!hasActiveSubscription) {
            redirectPath = '/subscription';
          }
        }
        router.push(redirectPath);
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading],
  );

  const register = useCallback(
    async (payload: FormData) => {
      setLoading(true);
      try {
        const response = await supplierRegister(payload);
        return response;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
      router.push('/login');
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

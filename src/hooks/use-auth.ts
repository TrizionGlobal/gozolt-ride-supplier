'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { supplierLogin, supplierRegister, logout, isDevBypassed } from '@/services/auth/auth.service';
import { authMockData } from '@/services/auth/auth.mock';
import type { SupplierLoginPayload, SupplierRegisterPayload } from '@/services/auth/auth.types';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, clearAuth } = useAuthStore();

  const login = useCallback(
    async (payload: SupplierLoginPayload) => {
      setLoading(true);
      try {
        const response = await supplierLogin(payload);

        if (isDevBypassed()) {
          // In dev mode, store mock profile in localStorage and set a cookie marker
          const profile = authMockData.supplierProfile;
          localStorage.setItem('gozolt-supplier-dev-user', JSON.stringify(profile));
          document.cookie = 'gozolt-supplier-dev-authenticated=true; path=/; max-age=86400';
          setUser(profile);
        } else {
          // Set HTTP-only cookies via API route
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            }),
          });

          // Fetch the supplier profile
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const data = await meRes.json();
            setUser(data.user);
          }
        }
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading],
  );

  const register = useCallback(
    async (payload: SupplierRegisterPayload) => {
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
      if (isDevBypassed()) {
        localStorage.removeItem('gozolt-supplier-dev-user');
        document.cookie = 'gozolt-supplier-dev-authenticated=; path=/; max-age=0';
      } else {
        await logout();
        await fetch('/api/auth/logout', { method: 'POST' });
      }
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

'use client';

import { create } from 'zustand';
import type { SupplierProfile } from '@/types';

interface AuthState {
  user: SupplierProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devBypass: boolean;

  setUser: (user: SupplierProfile) => void;
  setLoading: (loading: boolean) => void;
  setDevBypass: (enabled: boolean) => void;
  clearAuth: () => void;
  hydrateFromSession: () => Promise<void>;
}

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  devBypass: DEV_BYPASS,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setDevBypass: (devBypass) => {
    if (typeof window !== 'undefined') {
      if (devBypass) {
        localStorage.setItem('gozolt-supplier-dev-bypass', 'true');
      } else {
        localStorage.removeItem('gozolt-supplier-dev-bypass');
      }
    }
    set({ devBypass });
  },

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hydrateFromSession: async () => {
    try {
      const isDevMode =
        DEV_BYPASS ||
        (typeof window !== 'undefined' &&
          localStorage.getItem('gozolt-supplier-dev-bypass') === 'true');

      if (isDevMode) {
        const stored = localStorage.getItem('gozolt-supplier-dev-user');
        if (stored) {
          const user = JSON.parse(stored) as SupplierProfile;
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        }
        set({ isLoading: false });
        return;
      }

      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

'use client';

import { create } from 'zustand';
import type { SupplierProfile } from '@/types';

interface AuthState {
  user: SupplierProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  setUser: (user: SupplierProfile) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  hydrateFromSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),



  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    }),

  hydrateFromSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('supplier_token', data.token);
        }
        set({ user: data.user, isAuthenticated: true, isLoading: false, authError: null });
      } else {
        if (res.status === 401) {
          localStorage.removeItem('supplier_token');
          set({ user: null, isAuthenticated: false, isLoading: false, authError: null });
        } else {
          set({ isLoading: false, authError: 'Unable to connect to the server.' });
        }
      }
    } catch {
      set({ isLoading: false, authError: 'Network error. Please check your connection.' });
    }
  },
}));

'use client';

import { create } from 'zustand';
import type { SupplierProfile } from '@/types';

interface AuthState {
  user: SupplierProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: SupplierProfile) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  hydrateFromSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),



  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hydrateFromSession: async () => {
    try {


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

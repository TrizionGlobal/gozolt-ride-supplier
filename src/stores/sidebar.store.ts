'use client';

import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed:
    typeof window !== 'undefined'
      ? localStorage.getItem('gozolt-supplier-sidebar-collapsed') === 'true'
      : false,

  toggle: () =>
    set((state) => {
      const next = !state.isCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gozolt-supplier-sidebar-collapsed', String(next));
      }
      return { isCollapsed: next };
    }),

  setCollapsed: (isCollapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gozolt-supplier-sidebar-collapsed', String(isCollapsed));
    }
    set({ isCollapsed });
  },
}));

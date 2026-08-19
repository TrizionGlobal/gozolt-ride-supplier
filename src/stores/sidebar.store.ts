'use client';

import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  activeModule: 'CAB' | 'RENTAL' | null;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActiveModule: (module: 'CAB' | 'RENTAL' | null) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed:
    typeof window !== 'undefined'
      ? localStorage.getItem('gozolt-supplier-sidebar-collapsed') === 'true'
      : false,
  activeModule: 
    typeof window !== 'undefined'
      ? (localStorage.getItem('gozolt-supplier-active-module') as 'CAB' | 'RENTAL' | null)
      : null,

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

  setActiveModule: (module) => {
    if (typeof window !== 'undefined') {
      if (module) {
        localStorage.setItem('gozolt-supplier-active-module', module);
      } else {
        localStorage.removeItem('gozolt-supplier-active-module');
      }
    }
    set({ activeModule: module });
  },
}));

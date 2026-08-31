import { create } from 'zustand';

interface BikeRentalsStore {
  operationalBookings: any[];
  isOperationalLoading: boolean;
  setOperationalBookings: (bookings: any[]) => void;
  setOperationalLoading: (loading: boolean) => void;

  managementBookings: any[];
  isManagementLoading: boolean;
  managementTotal: number;
  managementPage: number;
  managementLimit: number;
  managementSearch: string;
  managementTab: string;
  managementLastFetchedStr: string;
  setManagementBookings: (bookings: any[], total: number, fetchedStr: string) => void;
  setManagementLoading: (loading: boolean) => void;
  setManagementFilters: (page: number, limit: number, search: string, tab?: string) => void;

  // History cache
  historyBookings: any[];
  historyTotal: number;
  historyPage: number;
  historyLimit: number;
  historyTab: string;
  setHistoryCache: (bookings: any[], total: number, page: number, limit: number, tab: string) => void;

  // Fleet cache
  fleetVehicles: any[];
  fleetTotal: number;
  fleetPage: number;
  fleetLimit: number;
  fleetSearch: string;
  setFleetCache: (vehicles: any[], total: number, page: number, limit: number, search: string) => void;
  clearFleetCache: () => void;
}

export const useBikeRentalsStore = create<BikeRentalsStore>((set) => ({
  operationalBookings: [],
  isOperationalLoading: false,
  setOperationalBookings: (bookings) => set({ operationalBookings: bookings }),
  setOperationalLoading: (loading) => set({ isOperationalLoading: loading }),

  managementBookings: [],
  isManagementLoading: false,
  managementTotal: 0,
  managementPage: 1,
  managementLimit: 20,
  managementSearch: '',
  managementTab: 'today',
  managementLastFetchedStr: '',
  setManagementBookings: (bookings, total, fetchedStr) => set({ managementBookings: bookings, managementTotal: total, managementLastFetchedStr: fetchedStr }),
  setManagementLoading: (loading) => set({ isManagementLoading: loading }),
  setManagementFilters: (page, limit, search, tab) => set((state) => ({ 
    managementPage: page, 
    managementLimit: limit, 
    managementSearch: search,
    managementTab: tab !== undefined ? tab : state.managementTab
  })),

  // History cache
  historyBookings: [],
  historyTotal: 0,
  historyPage: 1,
  historyLimit: 20,
  historyTab: 'completed',
  setHistoryCache: (bookings, total, page, limit, tab) => set({
    historyBookings: bookings,
    historyTotal: total,
    historyPage: page,
    historyLimit: limit,
    historyTab: tab,
  }),

  // Fleet cache
  fleetVehicles: [],
  fleetTotal: 0,
  fleetPage: 1,
  fleetLimit: 20,
  fleetSearch: '',
  setFleetCache: (vehicles, total, page, limit, search) => set({
    fleetVehicles: vehicles,
    fleetTotal: total,
    fleetPage: page,
    fleetLimit: limit,
    fleetSearch: search,
  }),
  clearFleetCache: () => set({
    fleetVehicles: [],
    fleetTotal: 0,
    fleetPage: 1,
    fleetSearch: '',
  }),
}));

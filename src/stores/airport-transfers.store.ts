import { create } from 'zustand';
import { AirportTransferVehicle } from '@/services/airport-transfers/airport-transfers.service';

interface AirportTransfersStore {
  // Fleet cache
  fleetVehicles: AirportTransferVehicle[];
  fleetTotal: number;
  fleetPage: number;
  fleetLimit: number;
  fleetSearch: string;
  setFleetCache: (
    vehicles: AirportTransferVehicle[],
    total: number,
    page: number,
    limit: number,
    search: string
  ) => void;
  clearFleetCache: () => void;
}

export const useAirportTransfersStore = create<AirportTransfersStore>((set) => ({
  fleetVehicles: [],
  fleetTotal: 0,
  fleetPage: 1,
  fleetLimit: 20,
  fleetSearch: '',
  setFleetCache: (vehicles, total, page, limit, search) =>
    set({
      fleetVehicles: vehicles,
      fleetTotal: total,
      fleetPage: page,
      fleetLimit: limit,
      fleetSearch: search,
    }),
  clearFleetCache: () =>
    set({
      fleetVehicles: [],
      fleetTotal: 0,
      fleetPage: 1,
      fleetSearch: '',
    }),
}));

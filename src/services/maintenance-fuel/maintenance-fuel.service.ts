'use client';

import { apiClient } from '@/lib/api-client';
import type { MaintenanceLogEntry, FuelLogEntry } from '@/types';
import { mockGlobalMaintenanceLogs, mockGlobalFuelLogs } from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const maintenanceFuelService = {
  async getMaintenanceLogs(): Promise<MaintenanceLogEntry[]> {
    if (isDevBypassed()) return mockGlobalMaintenanceLogs;

    try {
      // Backend only has per-vehicle endpoints.
      // Fetch all vehicles then aggregate their maintenance logs.
      const vehiclesRes = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
      const vehicles = vehiclesRes.data.data || vehiclesRes.data;
      const all: MaintenanceLogEntry[] = [];

      for (const v of vehicles) {
        const res = await apiClient.get(`/fleet/vehicles/${v.id}/maintenance`, { params: { page: 1, limit: 50 } });
        const logs = res.data.data || res.data;
        for (const log of logs) {
          all.push({
            id: log.id,
            vehicle: v.plateNumber,
            type: log.type,
            date: new Date(log.performedAt).toLocaleDateString('en-CA'),
            mileage: '—',
            cost: log.cost || 0,
            status: log.nextDueAt && new Date(log.nextDueAt) > new Date() ? 'Scheduled' : 'Completed',
          });
        }
      }
      return all;
    } catch {
      return mockGlobalMaintenanceLogs;
    }
  },

  async getFuelLogs(): Promise<FuelLogEntry[]> {
    if (isDevBypassed()) return mockGlobalFuelLogs;

    try {
      const vehiclesRes = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
      const vehicles = vehiclesRes.data.data || vehiclesRes.data;
      const all: FuelLogEntry[] = [];

      for (const v of vehicles) {
        const res = await apiClient.get(`/fleet/vehicles/${v.id}/fuel`, { params: { page: 1, limit: 50 } });
        const logs = res.data.data || res.data;
        for (const log of logs) {
          all.push({
            id: log.id,
            vehicle: v.plateNumber,
            driver: v.assignedDriverName || '—',
            date: new Date(log.filledAt).toLocaleDateString('en-CA'),
            liters: log.liters,
            cost: log.cost,
            mileage: log.odometer ? `${Number(log.odometer).toLocaleString()} Km` : '—',
          });
        }
      }
      return all;
    } catch {
      return mockGlobalFuelLogs;
    }
  },

  async addMaintenanceEntry(vehicleId: string, payload: {
    type: string;
    performedAt: string;
    cost?: number;
    description?: string;
    nextDueAt?: string;
  }): Promise<void> {
    if (isDevBypassed()) return;
    await apiClient.post(`/fleet/vehicles/${vehicleId}/maintenance`, payload);
  },

  async addFuelEntry(vehicleId: string, payload: {
    liters: number;
    cost: number;
    odometer?: number;
    filledAt: string;
  }): Promise<void> {
    if (isDevBypassed()) return;
    await apiClient.post(`/fleet/vehicles/${vehicleId}/fuel`, payload);
  },

  async getVehiclesList(): Promise<{ id: string; plate: string }[]> {
    if (isDevBypassed()) {
      return [
        { id: 'v1', plate: 'ABC-123' },
        { id: 'v2', plate: 'DEF-456' },
        { id: 'v3', plate: 'GHI-789' },
        { id: 'v4', plate: 'MNO-345' },
      ];
    }
    const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    return vehicles.map((v: { id: string; plateNumber: string }) => ({
      id: v.id,
      plate: v.plateNumber,
    }));
  },
};

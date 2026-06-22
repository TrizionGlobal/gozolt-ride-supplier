'use client';

import { apiClient } from '@/lib/api-client';
import type { MaintenanceLogEntry, FuelLogEntry } from '@/types';


export const maintenanceFuelService = {
  async getMaintenanceLogs(page = 1, limit = 10, search = ''): Promise<{ data: MaintenanceLogEntry[], total: number }> {
    try {
      const res = await apiClient.get('/fleet/maintenance', { params: { page, limit, search } });
      const logs = res.data.data || res.data || [];
      const total = res.data.meta?.total || logs.length;
      
      const data = logs.map((log: any) => {
        let status = 'Completed';
        if (log.nextDueAt) {
          const due = new Date(log.nextDueAt);
          if (due < new Date()) {
            status = 'Overdue';
          } else {
            status = 'Scheduled';
          }
        }
        
        return {
          id: log.id,
          vehicle: log.vehiclePlateNumber || '—',
          type: log.type,
          rawDate: log.performedAt,
          date: new Date(log.performedAt).toLocaleDateString('en-GB'),
          nextDueAt: log.nextDueAt ? new Date(log.nextDueAt).toLocaleDateString('en-GB') : undefined,
          mileage: log.odometer ? `${Number(log.odometer).toLocaleString()} Km` : '—',
          cost: log.cost || 0,
          status,
        };
      });
      return { data, total };
    } catch {
      return { data: [], total: 0 };
    }
  },

  async getFuelLogs(page = 1, limit = 10, search = ''): Promise<{ data: FuelLogEntry[], total: number }> {
    try {
      const res = await apiClient.get('/fleet/fuel', { params: { page, limit, search } });
      const logs = res.data.data || res.data || [];
      const total = res.data.meta?.total || logs.length;
      
      const data = logs.map((log: any) => ({
        id: log.id,
        vehicle: log.vehiclePlateNumber || '—',
        rawDate: log.filledAt,
        date: new Date(log.filledAt).toLocaleDateString('en-GB'),
        liters: log.liters,
        cost: log.cost,
        mileage: log.odometer ? `${Number(log.odometer).toLocaleString()} Km` : '—',
      }));
      return { data, total };
    } catch {
      return { data: [], total: 0 };
    }
  },

  async addMaintenanceEntry(vehicleId: string, payload: {
    type: string;
    performedAt: string;
    cost?: number;
    odometer?: number;
    description?: string;
    nextDueAt?: string;
  }): Promise<void> {
    await apiClient.post(`/fleet/vehicles/${vehicleId}/maintenance`, payload);
  },

  async addFuelEntry(vehicleId: string, payload: {
    liters: number;
    cost: number;
    odometer?: number;
    filledAt: string;
  }): Promise<void> {
    await apiClient.post(`/fleet/vehicles/${vehicleId}/fuel`, payload);
  },

  async getVehiclesList(): Promise<{ id: string; plate: string }[]> {
    try {
      const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
      return vehicles.map((v: { id: string; plateNumber: string }) => ({
        id: v.id,
        plate: v.plateNumber,
      }));
    } catch {
      return [];
    }
  },
};

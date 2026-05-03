'use client';

import { apiClient } from '@/lib/api-client';
import type {
  FleetVehicle,
  FleetVehicleDetail,
  MaintenanceLog,
  FuelLog,
  CreateVehiclePayload,
} from '@/types';
import {
  mockFleetVehicles,
  mockFleetVehicleDetail,
  mockMaintenanceLogs,
  mockFuelLogs,
  mockVehicleDocuments,
  mockFleetDriverDetail,
} from '@/lib/mock-data';
import type { SupplierDocument } from '@/types';
import type { FleetDriverDetail } from '@/types';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const fleetService = {
  // Vehicles
  async getVehicles(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{
    data: FleetVehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (isDevBypassed()) {
      let filtered = [...mockFleetVehicles];
      if (params?.status) {
        filtered = filtered.filter((v) => v.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.plateNumber.toLowerCase().includes(s) ||
            v.make.toLowerCase().includes(s) ||
            v.model.toLowerCase().includes(s) ||
            (v.assignedDriverName?.toLowerCase().includes(s) ?? false),
        );
      }
      return {
        data: filtered,
        total: filtered.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 1,
      };
    }
    const res = await apiClient.get('/fleet/vehicles', { params });
    return res.data;
  },

  async getVehicle(id: string): Promise<FleetVehicleDetail> {
    if (isDevBypassed()) {
      return { ...mockFleetVehicleDetail, id };
    }
    const res = await apiClient.get(`/fleet/vehicles/${id}`);
    return res.data;
  },

  async createVehicle(payload: CreateVehiclePayload): Promise<FleetVehicle> {
    if (isDevBypassed()) {
      return {
        ...mockFleetVehicles[0],
        ...payload,
        id: `veh-${Date.now()}`,
        fuelType: payload.fuelType as FleetVehicle['fuelType'],
        type: payload.type as FleetVehicle['type'],
        status: 'PENDING_APPROVAL' as FleetVehicle['status'],
        assignedDriverId: null,
        assignedDriverName: null,
        vin: payload.vin ?? null,
        photoUrls: [],
        createdAt: new Date().toISOString(),
      };
    }
    const res = await apiClient.post('/fleet/vehicles', payload);
    return res.data;
  },

  // Driver for vehicle
  async getDriverDetail(driverId: string): Promise<FleetDriverDetail> {
    if (isDevBypassed()) {
      return { ...mockFleetDriverDetail, id: driverId };
    }
    const res = await apiClient.get(`/suppliers/drivers/${driverId}`);
    return res.data;
  },

  // Documents for vehicle
  async getVehicleDocuments(vehicleId: string): Promise<SupplierDocument[]> {
    if (isDevBypassed()) {
      return mockVehicleDocuments.filter((d) => d.entityId === vehicleId || d.entityId === '1');
    }
    const res = await apiClient.get('/suppliers/documents', { params: { page: 1, limit: 50 } });
    return (res.data.data || res.data).filter(
      (d: SupplierDocument) => d.entityId === vehicleId && d.entityType === 'VEHICLE',
    );
  },

  // Maintenance
  async getMaintenanceLogs(vehicleId: string, params?: { page?: number; limit?: number }): Promise<{
    data: MaintenanceLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (isDevBypassed()) {
      return {
        data: mockMaintenanceLogs,
        total: mockMaintenanceLogs.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 1,
      };
    }
    const res = await apiClient.get(`/fleet/vehicles/${vehicleId}/maintenance`, { params });
    return res.data;
  },

  async createMaintenanceLog(
    vehicleId: string,
    payload: { type: string; description?: string; cost?: number; performedAt: string; nextDueAt?: string },
  ): Promise<MaintenanceLog> {
    if (isDevBypassed()) {
      return {
        id: `mnt-${Date.now()}`,
        type: payload.type,
        description: payload.description ?? null,
        cost: payload.cost ?? null,
        performedAt: payload.performedAt,
        nextDueAt: payload.nextDueAt ?? null,
        createdAt: new Date().toISOString(),
      };
    }
    const res = await apiClient.post(`/fleet/vehicles/${vehicleId}/maintenance`, payload);
    return res.data;
  },

  // Fuel
  async getFuelLogs(vehicleId: string, params?: { page?: number; limit?: number }): Promise<{
    data: FuelLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (isDevBypassed()) {
      return {
        data: mockFuelLogs,
        total: mockFuelLogs.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 1,
      };
    }
    const res = await apiClient.get(`/fleet/vehicles/${vehicleId}/fuel`, { params });
    return res.data;
  },

  async createFuelLog(
    vehicleId: string,
    payload: { liters: number; cost: number; odometer?: number; filledAt: string },
  ): Promise<FuelLog> {
    if (isDevBypassed()) {
      return {
        id: `fuel-${Date.now()}`,
        liters: payload.liters,
        cost: payload.cost,
        odometer: payload.odometer ?? null,
        filledAt: payload.filledAt,
        createdAt: new Date().toISOString(),
      };
    }
    const res = await apiClient.post(`/fleet/vehicles/${vehicleId}/fuel`, payload);
    return res.data;
  },

  // Active drivers (for assignment)
  async getActiveDrivers(): Promise<FleetDriverDetail[]> {
    if (isDevBypassed()) {
      return [mockFleetDriverDetail];
    }
    const res = await apiClient.get('/suppliers/drivers', { params: { status: 'ACTIVE' } });
    return res.data.data || res.data;
  },
};

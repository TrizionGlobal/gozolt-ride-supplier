'use client';

import { apiClient } from '@/lib/api-client';
import type {
  FleetVehicle,
  FleetVehicleDetail,
  MaintenanceLog,
  FuelLog,
  CreateVehiclePayload,
} from '@/types';
import type { SupplierDocument } from '@/types';
import type { FleetDriverDetail } from '@/types';

let cachedVehicles: any = null;
let lastVehiclesParams = '';
let vehiclesCacheTimestamp = 0;
const CACHE_TTL = 300000; // 5 minutes

export const clearVehiclesCache = () => {
  cachedVehicles = null;
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
    const paramsKey = JSON.stringify(params || {});
    if (
      cachedVehicles &&
      lastVehiclesParams === paramsKey &&
      Date.now() - vehiclesCacheTimestamp < CACHE_TTL
    ) {
      return cachedVehicles;
    }

    const res = await apiClient.get('/fleet/vehicles', { params });
    cachedVehicles = res.data;
    lastVehiclesParams = paramsKey;
    vehiclesCacheTimestamp = Date.now();
    return res.data;
  },

  async getVehicle(id: string): Promise<FleetVehicleDetail> {
    const res = await apiClient.get(`/fleet/vehicles/${id}`);
    return res.data;
  },

  async createVehicle(payload: CreateVehiclePayload): Promise<FleetVehicleDetail> {
    const res = await apiClient.post('/fleet/vehicles', payload);
    clearVehiclesCache();
    return res.data;
  },

  async createVehicleWithDocuments(payload: CreateVehiclePayload, docPayloads: any[]): Promise<FleetVehicleDetail> {
    // 1. Create the vehicle directly via proxy (JSON payload)
    const vehicleRes = await apiClient.post('/suppliers/vehicles', payload);
    const vehicle = vehicleRes.data;

    // 2. Upload documents individually via proxy
    if (docPayloads && docPayloads.length > 0) {
      const uploadPromises = docPayloads.map(async (p) => {
        if (!p.file) return null;
        const formData = new FormData();
        formData.append('type', p.type);
        formData.append('entityType', 'SUPPLIER');
        
        const safeLabel = (p.label || p.type).replace(/[^a-zA-Z0-9 -]/g, '').trim();
        const renamedFile = new File([p.file], `${safeLabel} - ${p.file.name}`, { type: p.file.type });
        formData.append('file', renamedFile);
        
        formData.append('vehicleId', vehicle.id);
        if (p.expiresAt) {
          formData.append('expiresAt', p.expiresAt);
        }

        return apiClient.post('/documents/upload', formData, {
          transformRequest: [(data, headers) => {
            delete headers['Content-Type'];
            return data;
          }],
        });
      });
      
      await Promise.all(uploadPromises);
    }

    clearVehiclesCache();
    return vehicle;
  },

  // Driver for vehicle
  async getDriverDetail(driverId: string): Promise<FleetDriverDetail> {
    const res = await apiClient.get(`/suppliers/drivers/${driverId}`);
    return res.data;
  },

  // Documents for vehicle
  async getVehicleDocuments(vehicleId: string): Promise<SupplierDocument[]> {
    const res = await apiClient.get('/suppliers/documents', { 
      params: { 
        page: 1, 
        limit: 50,
        vehicleId: vehicleId
      } 
    });
    return res.data.data || res.data;
  },

  // Maintenance
  async getMaintenanceLogs(vehicleId: string, params?: { page?: number; limit?: number }): Promise<{
    data: MaintenanceLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const res = await apiClient.get(`/fleet/vehicles/${vehicleId}/maintenance`, { params });
    return res.data;
  },

  async createMaintenanceLog(
    vehicleId: string,
    payload: { type: string; description?: string; cost?: number; performedAt: string; nextDueAt?: string },
  ): Promise<MaintenanceLog> {
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
    const res = await apiClient.get(`/fleet/vehicles/${vehicleId}/fuel`, { params });
    return res.data;
  },

  async createFuelLog(
    vehicleId: string,
    payload: { liters: number; cost: number; odometer?: number; filledAt: string },
  ): Promise<FuelLog> {
    const res = await apiClient.post(`/fleet/vehicles/${vehicleId}/fuel`, payload);
    return res.data;
  },

  // Active drivers (for assignment)
  async getActiveDrivers(): Promise<FleetDriverDetail[]> {
    const res = await apiClient.get('/suppliers/drivers', { params: { status: 'ACTIVE' } });
    return res.data.data || res.data;
  },
};

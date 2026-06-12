'use client';

import { apiClient } from '@/lib/api-client';
import type {
  Driver,
  DriverCredentials,
  CreateDriverPayload,
  DriverRide,
  DriverDocument,
  AssignedVehicle,
} from '@/types';


let cachedDriversList: any = null;
let lastDriversParams: string = '';
let cacheTimestamp = 0;
const CACHE_TTL = 30000;

const clearDriversCache = () => {
  cachedDriversList = null;
};

export const driverService = {
  async getDrivers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    data: Driver[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {


    const paramsKey = JSON.stringify(params || {});
    if (cachedDriversList && lastDriversParams === paramsKey && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedDriversList;
    }

    const res = await apiClient.get('/suppliers/drivers', { params });
    
    const mappedResponse = {
      data: res.data.data || res.data,
      total: res.data.meta?.total || res.data.total || 0,
      page: res.data.meta?.page || res.data.page || 1,
      limit: res.data.meta?.limit || res.data.limit || 10,
      totalPages: res.data.meta?.totalPages || res.data.totalPages || 1,
    };

    cachedDriversList = mappedResponse;
    lastDriversParams = paramsKey;
    cacheTimestamp = Date.now();
    
    return mappedResponse;
  },

  async getDriver(id: string): Promise<Driver> {
    const res = await apiClient.get(`/suppliers/drivers/${id}`);
    return res.data;
  },

  async updateDriver(id: string, payload: Partial<Driver>): Promise<Driver> {
    const res = await apiClient.patch(`/suppliers/drivers/${id}`, payload);
    clearDriversCache();
    return res.data;
  },

  async createDriver(payload: CreateDriverPayload): Promise<DriverCredentials> {
    
    const formData = new FormData();
    formData.append('phone', payload.phone);
    formData.append('firstName', payload.firstName);
    formData.append('lastName', payload.lastName);
    if (payload.email) formData.append('email', payload.email);

    if (payload.photo) {
      formData.append('profileImage', payload.photo);
    }
    
    if (payload.docs) {
      payload.docs.forEach((doc) => {
        // We'll normalize the labels to match what backend expects if needed, or just append them directly
        // For now, we'll append them as 'documents' or use specific keys based on label
        formData.append(doc.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(), doc.file);
      });
    }

    const res = await apiClient.post('/suppliers/drivers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    clearDriversCache();
    return res.data;
  },

  async getDriverVehicleMap(): Promise<Record<string, string>> {
    const res = await apiClient.get('/suppliers/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    const map: Record<string, string> = {};
    for (const v of vehicles) {
      if (v.assignedDriverId) {
        map[v.assignedDriverId] = v.plateNumber;
      }
    }
    return map;
  },

  async getAvailableVehicles(): Promise<any[]> {
    const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    return vehicles.filter((v: any) => !v.assignedDriverId && v.status === 'ACTIVE');
  },

  async getAssignedVehicle(driverId: string): Promise<AssignedVehicle | null> {
    try {
      const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
      const vehicles = res.data.data || res.data;
      const found = vehicles.find((v: { assignedDriverId: string }) => v.assignedDriverId === driverId);
      if (!found) return null;
      return {
        plateNumber: found.plateNumber,
        model: found.model,
        type: found.type,
        make: found.make,
      };
    } catch {
      return null;
    }
  },

  async getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
    try {
      const res = await apiClient.get('/suppliers/documents', { params: { page: 1, limit: 50 } });
      const docs = (res.data.data || res.data).filter(
        (d: { entityId: string; entityType: string }) => d.entityId === driverId && d.entityType === 'DRIVER',
      );
      return docs.map((d: { id: string; fileName: string }) => ({
        id: d.id,
        type: d.fileName,
        referenceNumber: `#${d.id.replace(/-/g, '').slice(0, 8)}`,
      }));
    } catch {
      return [];
    }
  },

  async uploadDriverDocument(driverId: string, file: File): Promise<DriverDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', driverId);
    formData.append('entityType', 'DRIVER');
    

    
    const res = await apiClient.post('/suppliers/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      id: res.data.id || `doc-${Date.now()}`,
      type: file.name,
      referenceNumber: res.data.id ? `#${res.data.id.replace(/-/g, '').slice(0, 8)}` : `#mock`,
    };
  },

  async getDriverRides(): Promise<DriverRide[]> {
    // Return empty array since backend endpoint is missing
    return [];
  },

  async supplierApproveDriver(id: string): Promise<Driver> {
    const res = await apiClient.post(`/suppliers/drivers/${id}/supplier-approve`);
    clearDriversCache();
    return res.data;
  },

  async supplierSuspendDriver(id: string): Promise<Driver> {
    const res = await apiClient.post(`/suppliers/drivers/${id}/supplier-suspend`);
    clearDriversCache();
    return res.data;
  },

  async assignVehicle(driverId: string, vehicleId: string): Promise<void> {
    await apiClient.post(`/suppliers/drivers/${driverId}/assign-vehicle`, { vehicleId });
    clearDriversCache();
  },

  async deleteDriver(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/drivers/${id}`);
    clearDriversCache();
  },
};

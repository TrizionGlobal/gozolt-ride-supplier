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
import {
  mockDriverList,
  mockDriverCredentials,
  mockDriverDetailData,
  mockDriverRides,
  mockDriverDocuments,
  mockAssignedVehicle,
  mockDriverVehicleMap,
} from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
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
    if (isDevBypassed()) {
      let filtered = [...mockDriverList];
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter((d) => d.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            `${d.firstName} ${d.lastName}`.toLowerCase().includes(s) ||
            d.phone.toLowerCase().includes(s),
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
    const res = await apiClient.get('/suppliers/drivers', { params });
    return res.data;
  },

  async getDriver(id: string): Promise<Driver> {
    if (isDevBypassed()) {
      const found = mockDriverList.find((d) => d.id === id);
      if (found) return { ...found, ...mockDriverDetailData, id };
      return { ...mockDriverDetailData, id };
    }
    const res = await apiClient.get(`/suppliers/drivers/${id}`);
    return res.data;
  },

  async createDriver(payload: CreateDriverPayload): Promise<DriverCredentials> {
    if (isDevBypassed()) {
      return mockDriverCredentials;
    }
    const res = await apiClient.post('/suppliers/drivers', payload);
    return res.data;
  },

  async getDriverVehicleMap(): Promise<Record<string, string>> {
    if (isDevBypassed()) {
      return mockDriverVehicleMap;
    }
    const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    const map: Record<string, string> = {};
    for (const v of vehicles) {
      if (v.assignedDriverId) {
        map[v.assignedDriverId] = v.plateNumber;
      }
    }
    return map;
  },

  async getAssignedVehicle(driverId: string): Promise<AssignedVehicle | null> {
    if (isDevBypassed()) {
      if (mockDriverVehicleMap[driverId]) return mockAssignedVehicle;
      return null;
    }
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
    if (isDevBypassed()) {
      return mockDriverDocuments;
    }
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

  async getDriverRides(): Promise<DriverRide[]> {
    // No backend endpoint yet — always return mock
    return mockDriverRides;
  },
};

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
const CACHE_TTL = 300000; // 5 minutes

let cachedVehicleMap: Record<string, string> | null = null;
let vehicleMapCacheTimestamp = 0;

const clearDriversCache = () => {
  cachedDriversList = null;
  cachedVehicleMap = null;
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
    // 1. Create the driver directly via proxy (JSON payload)
    const createPayload: Record<string, any> = { ...payload };
    delete createPayload.photo;
    delete createPayload.docs;
    
    // Ensure emergencyContacts is a string if it's not already
    if (typeof createPayload.emergencyContacts === 'object') {
      createPayload.emergencyContacts = JSON.stringify(createPayload.emergencyContacts);
    }
    
    // Remove empty string values for dates to prevent ISO 8601 validation errors
    if (!createPayload.dateOfBirth) delete createPayload.dateOfBirth;
    if (!createPayload.licenseExpiryDate) delete createPayload.licenseExpiryDate;
    if (!createPayload.licenseIssueDate) delete createPayload.licenseIssueDate;
    if (!createPayload.email) delete createPayload.email;

    const res = await apiClient.post('/suppliers/drivers', createPayload);
    const driverCreds = res.data;
    const driverId = driverCreds.driverId || driverCreds.id;

    // 2. Upload documents individually via proxy
    const uploadPromises: any[] = [];

    if (payload.photo) {
      const fd = new FormData();
      fd.append('type', 'PROFILE_PHOTO');
      fd.append('entityType', 'DRIVER');
      fd.append('entityId', driverId);
      fd.append('file', payload.photo);
      uploadPromises.push(
        apiClient.post('/documents/upload', fd, {
          transformRequest: [(data, headers) => { delete headers['Content-Type']; return data; }],
        })
      );
    }

    if (payload.docs && payload.docs.length > 0) {
      payload.docs.forEach((doc) => {
        if (!doc.file) return;
        
        let docType = 'DRIVING_LICENSE';
        const fn = doc.label.toLowerCase();
        if (fn.includes('id') || fn.includes('passport') || fn.includes('residence')) docType = 'ID_CARD';
        if (fn.includes('police')) docType = 'POLICE_CLEARANCE';
        if (fn.includes('tm_tag') || fn.includes('transport') || fn.includes('taxi') || fn.includes('passenger') || fn.includes('permit')) docType = 'TAXI_LICENSE';
        if (fn.includes('driving_license') || fn.includes('license')) docType = 'DRIVING_LICENSE';
        if (fn.includes('cpc')) docType = 'CPC_CERTIFICATE';
        if (fn.includes('insurance')) docType = 'INSURANCE';
        if (fn.includes('medical') || fn.includes('fitness')) docType = 'MEDICAL_CERTIFICATE';
        if (fn.includes('work') || fn.includes('residence permit')) docType = 'WORK_PERMIT';
        if (fn.includes('address') || fn.includes('utility') || fn.includes('bank')) docType = 'PROOF_OF_ADDRESS';

        const fd = new FormData();
        fd.append('type', docType);
        fd.append('entityType', 'DRIVER');
        fd.append('entityId', driverId);
        
        // Rename the file to include the label so it's clearly identifiable (e.g., distinguishing Front/Back ID)
        const safeLabel = doc.label.replace(/[^a-zA-Z0-9 -]/g, '').trim();
        const renamedFile = new File([doc.file], `${safeLabel} - ${doc.file.name}`, { type: doc.file.type });
        fd.append('file', renamedFile);

        uploadPromises.push(
          apiClient.post('/documents/upload', fd, {
            transformRequest: [(data, headers) => { delete headers['Content-Type']; return data; }],
          })
        );
      });
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    clearDriversCache();
    return driverCreds;
  },

  async getDriverVehicleMap(): Promise<Record<string, string>> {
    if (cachedVehicleMap && Date.now() - vehicleMapCacheTimestamp < CACHE_TTL) {
      return cachedVehicleMap;
    }
    const res = await apiClient.get('/suppliers/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    const map: Record<string, string> = {};
    for (const v of vehicles) {
      if (v.assignedDriverId) {
        map[v.assignedDriverId] = v.plateNumber;
      }
    }
    cachedVehicleMap = map;
    vehicleMapCacheTimestamp = Date.now();
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
      const res = await apiClient.get('/suppliers/documents', { 
        params: { 
          page: 1, 
          limit: 50,
          entityId: driverId,
          entityType: 'DRIVER'
        } 
      });
      const docs = res.data.data || res.data;
      return docs.map((d: { id: string; type: string; fileName: string; fileUrl?: string }) => ({
        id: d.id,
        type: d.type,
        fileName: d.fileName,
        referenceNumber: `#${d.id.replace(/-/g, '').slice(0, 8)}`,
        fileUrl: d.fileUrl,
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
      fileUrl: res.data.fileUrl,
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

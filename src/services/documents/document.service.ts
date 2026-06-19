'use client';

import axios from 'axios';
import { apiClient } from '@/lib/api-client';
import type { DocumentCenterItem, UploadDocumentPayload } from '@/types';

export const documentService = {
  async getAllDocuments(): Promise<{
    company: DocumentCenterItem[];
    vehicle: DocumentCenterItem[];
    driver: DocumentCenterItem[];
  }> {
    try {
      const [docsRes, driversRes, vehiclesRes] = await Promise.all([
        apiClient.get('/suppliers/documents', { params: { page: 1, limit: 20 } }),
        apiClient.get('/suppliers/drivers', { params: { page: 1, limit: 20 } }),
        apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 20 } }),
      ]);

      let rawDocs = docsRes.data?.data || docsRes.data;
      if (!Array.isArray(rawDocs)) rawDocs = [];
      const allDocs: any[] = rawDocs.map((d: any) => ({ ...d }));

      let drivers = driversRes.data?.data || driversRes.data;
      if (!Array.isArray(drivers)) drivers = [];

      let vehicles = vehiclesRes.data?.data || vehiclesRes.data;
      if (!Array.isArray(vehicles)) vehicles = [];

      // Extract embedded driver documents
      for (const drv of drivers) {
        if (drv.documents && Array.isArray(drv.documents)) {
          for (const dDoc of drv.documents) {
            if (!allDocs.find(d => d.id === dDoc.id)) {
              allDocs.push({
                ...dDoc,
                entityType: 'DRIVER',
                driverId: drv.id,
                driverName: `${drv.firstName} ${drv.lastName}`.trim()
              });
            }
          }
        }
      }

      // Extract embedded vehicle documents
      for (const v of vehicles) {
        if (v.documents && Array.isArray(v.documents)) {
          for (const vDoc of v.documents) {
            if (!allDocs.find(d => d.id === vDoc.id)) {
              allDocs.push({
                ...vDoc,
                entityType: 'VEHICLE',
                vehicleId: v.id,
                vehiclePlate: v.plateNumber
              });
            }
          }
        }
      }

      const driverMap = new Map(
        drivers.map((d: any) => [d.id, `${d.firstName} ${d.lastName}`.trim()]),
      );
      const vehicleMap = new Map(
        vehicles.map((v: any) => [v.id, v.plateNumber]),
      );

      const vehicleDocTypes = [
        'VEHICLE_REGISTRATION',
        'ROADWORTHINESS',
        'VEHICLE_PHOTO_FRONT',
        'VEHICLE_PHOTO_BACK',
        'VEHICLE_PHOTO_SIDE',
        'VEHICLE_PHOTO_INTERIOR',
        'VEHICLE_PHOTO_INTERIOR_2'
      ];

      const company: DocumentCenterItem[] = [];
      const vehicle: DocumentCenterItem[] = [];
      const driver: DocumentCenterItem[] = [];

      for (const doc of allDocs as (DocumentCenterItem & { entityId?: string, driverId?: string, vehicleId?: string })[]) {
        // First check if it's explicitly a vehicle document by type or vehicleId
        if (vehicleDocTypes.includes(doc.type) || doc.entityType === 'VEHICLE' || doc.vehicleId) {
          doc.vehicleId = doc.vehicleId || (doc.entityType === 'VEHICLE' ? doc.entityId : undefined);
          vehicle.push(doc);
        }
        // Then check if it's a driver document
        else if (doc.entityType === 'DRIVER' || doc.driverId) {
          doc.driverId = doc.driverId || (doc.entityType === 'DRIVER' ? doc.entityId : undefined);
          driver.push(doc);
        }
        // Fallback to company
        else {
          company.push(doc);
        }
      }

      return { company, vehicle, driver };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async getPaginatedDocuments(params: {
    page: number;
    limit: number;
    tab?: string; // 'Company', 'Vehicle', 'Driver'
    search?: string;
    status?: string;
  }): Promise<{
    data: DocumentCenterItem[];
    total: number;
  }> {
    try {
      const backendParams: any = {
        page: params.page,
        limit: params.limit,
      };

      if (params.tab) backendParams.tab = params.tab;
      if (params.search) backendParams.search = params.search;
      if (params.status && params.status !== 'ALL') backendParams.status = params.status;

      const res = await apiClient.get('/suppliers/documents', { params: backendParams });

      let docs: any[] = res.data?.data || res.data;
      if (!Array.isArray(docs)) docs = [];

      return {
        data: docs,
        total: res.data?.meta?.total || docs.length,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async uploadDocument(payload: UploadDocumentPayload): Promise<DocumentCenterItem> {
    const formData = new FormData();
    formData.append('type', payload.type);

    // Determine entityType based on IDs, fallback to payload.entityType or SUPPLIER
    let entityType = payload.entityType || 'SUPPLIER';
    if (payload.driverId) entityType = 'DRIVER';
    if (payload.vehicleId) entityType = 'VEHICLE';

    formData.append('entityType', entityType);

    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.vehicleId) {
      formData.append('vehicleId', payload.vehicleId);
    }
    if (payload.driverId) {
      formData.append('driverId', payload.driverId);
    }
    if (payload.expiresAt) {
      formData.append('expiresAt', payload.expiresAt);
    }

    const res = await apiClient.post('/documents/upload', formData, {
      transformRequest: [(data, headers) => {
        delete headers['Content-Type'];
        return data;
      }],
    });
    return res.data;
  },

  async batchUploadDocuments(payloads: UploadDocumentPayload[]): Promise<any> {
    const formData = new FormData();
    const metadata = payloads.map((p, idx) => {
      if (p.file) {
        formData.append(`file_${idx}`, p.file);
      }
      return {
        type: p.type,
        entityType: p.entityType || 'SUPPLIER',
        vehicleId: p.vehicleId,
        expiresAt: p.expiresAt,
      };
    });
    formData.append('metadata', JSON.stringify(metadata));

    // We use standard axios to hit the Next.js API route directly without the /api/proxy prefix
    const res = await axios.post('/api/documents/batch-upload', formData);
    return res.data;
  },

  async getDriversList(): Promise<{ id: string; name: string }[]> {
    const res = await apiClient.get('/suppliers/drivers', { params: { page: 1, limit: 100 } });
    const drivers = res.data.data || res.data;
    return drivers.map((d: { id: string; firstName: string; lastName: string }) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
    }));
  },

  async getVehiclesList(): Promise<{ id: string; plate: string }[]> {
    const res = await apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } });
    const vehicles = res.data.data || res.data;
    return vehicles.map((v: { id: string; plateNumber: string }) => ({
      id: v.id,
      plate: v.plateNumber,
    }));
  },
};

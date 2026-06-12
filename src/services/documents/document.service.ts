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
        apiClient.get('/suppliers/documents', { params: { page: 1, limit: 100 } }),
        apiClient.get('/suppliers/drivers', { params: { page: 1, limit: 100 } }),
        apiClient.get('/fleet/vehicles', { params: { page: 1, limit: 100 } }),
      ]);

      const allDocs: DocumentCenterItem[] = (docsRes.data.data || docsRes.data).map(
        (d: DocumentCenterItem) => ({ ...d }),
      );
      const drivers = driversRes.data.data || driversRes.data;
      const vehicles = vehiclesRes.data.data || vehiclesRes.data;

      const driverMap = new Map(
        drivers.map((d: { id: string; firstName: string; lastName: string }) => [
          d.id,
          `${d.firstName} ${d.lastName}`,
        ]),
      );
      const vehicleMap = new Map(
        vehicles.map((v: { id: string; plateNumber: string }) => [v.id, v.plateNumber]),
      );

      const vehicleDocTypes = [
        'VEHICLE_REGISTRATION',
        'ROADWORTHINESS',
        'VEHICLE_PHOTO_FRONT',
        'VEHICLE_PHOTO_BACK',
        'VEHICLE_PHOTO_SIDE',
        'VEHICLE_PHOTO_INTERIOR',
      ];

      const company: DocumentCenterItem[] = [];
      const vehicle: DocumentCenterItem[] = [];
      const driver: DocumentCenterItem[] = [];

      for (const doc of allDocs) {
        if (doc.entityType === 'DRIVER') {
          doc.driverName = (driverMap.get(doc.id) as string) || 'Unknown Driver';
          driver.push(doc);
        } else if (vehicleDocTypes.includes(doc.type)) {
          doc.vehiclePlate = (vehicleMap.get(doc.id) as string) || 'Unknown';
          vehicle.push(doc);
        } else {
          company.push(doc);
        }
      }

      return { company, vehicle, driver };
    } catch {
      return { company: [], vehicle: [], driver: [] };
    }
  },

  async uploadDocument(payload: UploadDocumentPayload): Promise<DocumentCenterItem> {
    const formData = new FormData();
    formData.append('type', payload.type);
    formData.append('entityType', 'SUPPLIER'); // Required by backend
    
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.vehicleId) {
      formData.append('vehicleId', payload.vehicleId);
    }

    const res = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

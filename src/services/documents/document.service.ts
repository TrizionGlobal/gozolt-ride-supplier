'use client';

import { apiClient } from '@/lib/api-client';
import type { DocumentCenterItem, UploadDocumentPayload } from '@/types';
import {
  mockCompanyDocuments,
  mockVehicleDocuments2,
  mockDriverDocuments2,
} from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const documentService = {
  async getAllDocuments(): Promise<{
    company: DocumentCenterItem[];
    vehicle: DocumentCenterItem[];
    driver: DocumentCenterItem[];
  }> {
    if (isDevBypassed()) {
      return {
        company: mockCompanyDocuments,
        vehicle: mockVehicleDocuments2,
        driver: mockDriverDocuments2,
      };
    }

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
    if (isDevBypassed()) {
      return {
        id: `doc-${Date.now()}`,
        entityType: payload.driverId ? 'DRIVER' : 'SUPPLIER',
        type: payload.type,
        status: 'PENDING',
        fileName: payload.fileName,
        expiresAt: payload.expiresAt || null,
        createdAt: new Date().toISOString(),
      };
    }
    const res = await apiClient.post('/suppliers/documents', payload);
    return res.data;
  },

  async getDriversList(): Promise<{ id: string; name: string }[]> {
    if (isDevBypassed()) {
      return [
        { id: 'drv-1', name: 'John Borg' },
        { id: 'drv-2', name: 'Mark Vella' },
        { id: 'drv-3', name: 'Jose Camilleri' },
      ];
    }
    const res = await apiClient.get('/suppliers/drivers', { params: { page: 1, limit: 100 } });
    const drivers = res.data.data || res.data;
    return drivers.map((d: { id: string; firstName: string; lastName: string }) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
    }));
  },

  async getVehiclesList(): Promise<{ id: string; plate: string }[]> {
    if (isDevBypassed()) {
      return [
        { id: 'v1', plate: 'ABC-123' },
        { id: 'v2', plate: 'ANS89' },
        { id: 'v3', plate: 'ANS89P' },
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

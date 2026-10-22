'use client';

import { apiClient } from '@/lib/api-client';

export interface AirportTransferVehicle {
  id: string;
  supplierId?: string;
  make: string;
  model: string;
  year?: number | string;
  registrationNo: string;
  vehicleType: string;
  passengerCapacity: number;
  luggageCapacity: number;
  fixedPrice: number;
  pricePerKm?: number;
  minPrice?: number;
  currency: string;
  status: string;
  isApproved?: boolean;
  images: string[];
  features?: string[];
  isMeetAndGreetIncluded?: boolean;
  freeWaitingMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const airportTransfersService = {
  async getVehicles(params?: { page?: number; limit?: number; search?: string }): Promise<{
    items: AirportTransferVehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/airport-transfers/supplier/vehicles', { params });
    return response.data;
  },

  async getVehicle(id: string): Promise<AirportTransferVehicle> {
    const response = await apiClient.get(`/airport-transfers/supplier/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(data: any): Promise<AirportTransferVehicle> {
    const response = await apiClient.post('/airport-transfers/supplier/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: any): Promise<AirportTransferVehicle> {
    const response = await apiClient.put(`/airport-transfers/supplier/vehicles/${id}`, data);
    return response.data;
  },

  async updateVehicleStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.put(`/airport-transfers/supplier/vehicles/${id}`, { status });
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/airport-transfers/supplier/vehicles/${id}`);
  },
};

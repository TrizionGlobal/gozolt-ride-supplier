'use client';

import { apiClient } from '@/lib/api-client';

export interface ProtectionPackage {
  id?: string;
  title: string;
  stars: number;
  deductibleText: string;
  deductibleColorHex?: string;
  pricePerDay: number;
  originalPricePerDay?: number;
  discountText?: string;
  valueIdentifier: string;
  features: Record<string, boolean>;
}

export interface Addon {
  id?: string;
  name: string;
  pricePerDay: number;
  iconIdentifier: string;
}

export interface MileagePackage {
  id?: string;
  type: 'LIMITED' | 'UNLIMITED' | 'PREMIUM_UNLIMITED';
  pricePerDay: number;
  includedKm?: number;
  extraKmCharge?: number;
}

export interface BikeRentalBike {
  id?: string;
  name: string;
  category: string;
  registrationNo?: string;
  year?: string;
  transmission: string;
  fuelType: string;
  seats: number;
  engineCapacityCc?: number;
  mileage?: number;
  pricePerDay: number;
  status?: string;
  images: string[];
  isSelfPickupAllowed?: boolean;
  isSupplierDeliveryAllowed?: boolean;
  isDoorstepDeliveryAllowed?: boolean;
  protectionPackages?: ProtectionPackage[];
  mileagePackages?: MileagePackage[];
  addons?: Addon[];
}

export const bikeRentalsService = {
  async getDashboardMetrics() {
    const response = await apiClient.get('/bike-rentals/supplier/dashboard/metrics');
    return response.data;
  },

  async getBikes(params?: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get('/bike-rentals/supplier/vehicles', { params });
    return response.data;
  },

  async getBike(id: string) {
    const response = await apiClient.get(`/bike-rentals/supplier/vehicles/${id}`);
    return response.data;
  },

  async createBike(data: any) {
    const response = await apiClient.post('/bike-rentals/supplier/vehicles', data);
    return response.data;
  },

  async updateBike(id: string, data: any) {
    const response = await apiClient.put(`/bike-rentals/supplier/vehicles/${id}`, data);
    return response.data;
  },

  async updateBikeStatus(id: string, status: string) {
    const response = await apiClient.patch(`/bike-rentals/supplier/vehicles/${id}/status`, { status });
    return response.data;
  },

  async deleteBike(id: string) {
    await apiClient.delete(`/bike-rentals/supplier/vehicles/${id}`);
  },

  // --- Bookings ---
  
  async getBookings(params?: { page?: number; limit?: number; search?: string; statuses?: string[]; dateFilter?: 'TODAY' | 'UPCOMING' | 'OVERDUE' }): Promise<any> {
    const queryParams: any = { ...params };
    if (params?.statuses && params.statuses.length > 0) {
      queryParams.statuses = params.statuses.join(',');
    }
    const response = await apiClient.get('/bike-rentals/supplier/bookings', { params: queryParams });
    return response.data;
  },

  async updateBookingStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.put(`/bike-rentals/supplier/bookings/${id}/status`, { status });
    return response.data;
  },

  async getBookingDetails(id: string): Promise<any> {
    const response = await apiClient.get(`/bike-rentals/supplier/bookings/${id}`);
    return response.data;
  },

  async handoverBooking(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`/bike-rentals/supplier/bookings/${id}/handover`, data);
    return response.data;
  },

  async returnBooking(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`/bike-rentals/supplier/bookings/${id}/return`, data);
    return response.data;
  },

  // --- Extensions ---

  async getExtensionRequests(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<any> {
    const response = await apiClient.get('/bike-rentals/supplier/dashboard/extension-requests', { params });
    return response.data;
  },

  async approveExtensionRequest(id: string): Promise<any> {
    const response = await apiClient.patch(`/bike-rentals/supplier/dashboard/extension-requests/${id}/approve`);
    return response.data;
  },

  async rejectExtensionRequest(id: string): Promise<any> {
    const response = await apiClient.patch(`/bike-rentals/supplier/dashboard/extension-requests/${id}/reject`);
    return response.data;
  }
};

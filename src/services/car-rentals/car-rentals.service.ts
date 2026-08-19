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

export interface CarRentalVehicle {
  id?: string;
  name: string;
  category: string;
  registrationNo?: string;
  year?: string;
  transmission: string;
  fuelType: string;
  seats: number;
  luggageCapacity: number;
  pricePerDay: number;
  status?: string;
  images: string[];
  isSelfPickupAllowed?: boolean;
  isSupplierDeliveryAllowed?: boolean;
  isDoorstepDeliveryAllowed?: boolean;
  hasAirConditioning?: boolean;
  protectionPackages?: ProtectionPackage[];
  mileagePackages?: MileagePackage[];
  addons?: Addon[];
}

export const carRentalsService = {
  async getDashboardMetrics() {
    const response = await apiClient.get('/car-rentals/supplier/dashboard/metrics');
    return response.data;
  },

  async getVehicles(params?: { page?: number; limit?: number; search?: string }): Promise<{
    data: CarRentalVehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/car-rentals/supplier/vehicles', { params });
    return response.data;
  },

  async getVehicle(id: string): Promise<CarRentalVehicle> {
    const response = await apiClient.get(`/car-rentals/supplier/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(data: CarRentalVehicle): Promise<CarRentalVehicle> {
    const response = await apiClient.post('/car-rentals/supplier/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/car-rentals/supplier/vehicles/${id}`, data);
    return response.data;
  },

  async updateVehicleStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.patch(`/car-rentals/supplier/vehicles/${id}/status`, { status });
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/car-rentals/supplier/vehicles/${id}`);
  },

  // --- Bookings ---
  
  async getBookings(params?: { page?: number; limit?: number; search?: string; statuses?: string[]; dateFilter?: 'TODAY' | 'UPCOMING' | 'OVERDUE' }): Promise<any> {
    const queryParams: any = { ...params };
    if (params?.statuses && params.statuses.length > 0) {
      queryParams.statuses = params.statuses.join(',');
    }
    const response = await apiClient.get('/car-rentals/supplier/bookings', { params: queryParams });
    return response.data;
  },

  async updateBookingStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.put(`/car-rentals/supplier/bookings/${id}/status`, { status });
    return response.data;
  },

  async getBookingDetails(id: string): Promise<any> {
    const response = await apiClient.get(`/car-rentals/supplier/bookings/${id}`);
    return response.data;
  },

  async handoverBooking(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`/car-rentals/supplier/bookings/${id}/handover`, data);
    return response.data;
  },

  async returnBooking(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`/car-rentals/supplier/bookings/${id}/return`, data);
    return response.data;
  },

  // --- Extensions ---

  async getExtensionRequests(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get('/car-rentals/supplier/dashboard/extension-requests', { params });
    return response.data;
  },

  async approveExtensionRequest(id: string): Promise<any> {
    const response = await apiClient.patch(`/car-rentals/supplier/dashboard/extension-requests/${id}/approve`);
    return response.data;
  },

  async rejectExtensionRequest(id: string): Promise<any> {
    const response = await apiClient.patch(`/car-rentals/supplier/dashboard/extension-requests/${id}/reject`);
    return response.data;
  }
};

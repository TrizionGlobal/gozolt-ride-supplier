import { Role, SupplierStatus, SubscriptionTier } from '@/types';
import type { AuthSuccessResponse, RegisterResponse } from './auth.types';
import type { SupplierProfile } from '@/types';

export const authMockData = {
  loginSuccess: {
    accessToken: 'mock-jwt-supplier-access-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    refreshToken: 'mock-supplier-refresh-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    role: Role.SUPPLIER,
  } satisfies AuthSuccessResponse,

  registerSuccess: {
    message: 'Registration successful. Please check your email to verify your account.',
  } satisfies RegisterResponse,

  supplierProfile: {
    id: 'sup-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'supplier@gozolt.in',
    companyName: 'Demo Transport Co.',
    vatNumber: 'VAT123456789',
    contactPhone: '+49 170 1234567',
    status: SupplierStatus.ACTIVE,
    subscription: {
      id: 'sub-001',
      tier: SubscriptionTier.PROFESSIONAL,
      maxDrivers: 50,
      maxVehicles: 30,
      pricePerMonth: 99.99,
      startedAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
    },
    createdAt: '2024-06-15T10:30:00Z',
  } satisfies SupplierProfile,
};

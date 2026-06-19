import { Role } from '@/types';

export interface SupplierLoginPayload {
  email: string;
  password: string;
}



export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
  supplierId: string;
}

export interface SupplierSubscribePayload {
  supplierId: string;
  subscriptionTier: string;
  cardName: string;
  paymentMethodId: string;
  cardBrand?: string;
  cardLast4?: string;
}

export interface SupplierSubscribeResponse {
  message: string;
  paymentDetails?: {
    txnId: string;
    amount: number;
    tier: string;
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface MessageResponse {
  message: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

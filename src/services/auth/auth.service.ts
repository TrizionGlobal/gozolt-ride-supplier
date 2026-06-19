import { apiClient } from '@/lib/api-client';

import type {
  SupplierLoginPayload,
  AuthSuccessResponse,
  RegisterResponse,
  TokenRefreshResponse,
  MessageResponse,
  ChangePasswordPayload,
} from './auth.types';



export async function supplierLogin(payload: SupplierLoginPayload): Promise<AuthSuccessResponse> {

  const { data } = await apiClient.post<AuthSuccessResponse>('/auth/supplier/login', payload);
  return data;
}

export async function supplierRegister(payload: FormData): Promise<RegisterResponse> {

  const { data } = await apiClient.post<RegisterResponse>('/auth/supplier/register', payload);
  return data;
}

export async function refreshToken(token: string): Promise<TokenRefreshResponse> {

  const { data } = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function logout(): Promise<MessageResponse> {

  const { data } = await apiClient.post<MessageResponse>('/auth/logout');
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {

  const { data } = await apiClient.post<MessageResponse>('/auth/change-password', payload);
  return data;
}

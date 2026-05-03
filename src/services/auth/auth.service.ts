import { apiClient } from '@/lib/api-client';
import { authMockData } from './auth.mock';
import type {
  SupplierLoginPayload,
  SupplierRegisterPayload,
  AuthSuccessResponse,
  RegisterResponse,
  TokenRefreshResponse,
  MessageResponse,
  ChangePasswordPayload,
} from './auth.types';

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

export function isDevBypassed(): boolean {
  if (typeof window === 'undefined') return DEV_BYPASS;
  return localStorage.getItem('gozolt-supplier-dev-bypass') === 'true' || DEV_BYPASS;
}

export async function supplierLogin(payload: SupplierLoginPayload): Promise<AuthSuccessResponse> {
  if (isDevBypassed()) {
    await new Promise((r) => setTimeout(r, 800));
    return authMockData.loginSuccess;
  }
  const { data } = await apiClient.post<AuthSuccessResponse>('/auth/supplier/login', payload);
  return data;
}

export async function supplierRegister(payload: SupplierRegisterPayload): Promise<RegisterResponse> {
  if (isDevBypassed()) {
    await new Promise((r) => setTimeout(r, 800));
    return authMockData.registerSuccess;
  }
  const { data } = await apiClient.post<RegisterResponse>('/auth/supplier/register', payload);
  return data;
}

export async function refreshToken(token: string): Promise<TokenRefreshResponse> {
  if (isDevBypassed()) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      accessToken: authMockData.loginSuccess.accessToken,
      refreshToken: authMockData.loginSuccess.refreshToken,
      expiresIn: '15m',
    };
  }
  const { data } = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function logout(): Promise<MessageResponse> {
  if (isDevBypassed()) {
    await new Promise((r) => setTimeout(r, 300));
    return { message: 'Logged out successfully' };
  }
  const { data } = await apiClient.post<MessageResponse>('/auth/logout');
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
  if (isDevBypassed()) {
    await new Promise((r) => setTimeout(r, 500));
    return { message: 'Password changed successfully' };
  }
  const { data } = await apiClient.post<MessageResponse>('/auth/change-password', payload);
  return data;
}

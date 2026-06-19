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

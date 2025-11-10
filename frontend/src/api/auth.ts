import api from './api';
import type {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
} from '../types';

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const refreshToken = async (data: RefreshTokenDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/refresh', data);
  return response.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await api.post('/auth/logout', { refreshToken });
};

export const verifyPassword = async (password: string): Promise<{ valid: boolean }> => {
  const response = await api.post<{ valid: boolean }>(
    '/auth/verify-password',
    { password }
  );
  return response.data;
};

import api from './api';
import type {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
} from '../types';

export const authService = {
  // Register new admin
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login admin
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh access token
  refresh: async (data: RefreshTokenDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  },

  // Logout admin
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  // Verify password (for delete confirmation)
  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    const response = await api.post<{ valid: boolean }>(
      '/auth/verify-password',
      { password }
    );
    return response.data;
  },
};

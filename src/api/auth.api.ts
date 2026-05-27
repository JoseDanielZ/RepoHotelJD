import apiClient from './client';
import type { ApiResponse, LoginApiData, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
  login: (req: LoginRequest) =>
    apiClient.post<ApiResponse<LoginApiData>>('/auth/login', req),

  register: (req: RegisterRequest) =>
    apiClient.post<ApiResponse<LoginApiData>>('/auth/register-cliente', req),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  cambiarPassword: (passwordActual: string, passwordNuevo: string) =>
    apiClient.post('/auth/cambiar-password', { passwordActual, passwordNuevo }),
};

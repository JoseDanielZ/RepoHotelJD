import apiClient from './client';
import type { UsuarioDTO, RolDTO, PermisoDTO, PagedResponse } from '../types';

export const seguridadApi = {
  // ── Usuarios ────────────────────────────────────────────────────────────────
  listUsuarios: (params?: { page?: number; pageSize?: number; estado?: string }) =>
    apiClient.get('/internal/usuarios', { params }),

  getUsuarios: (params?: { page?: number; pageSize?: number; estado?: string }) =>
    apiClient.get<PagedResponse<UsuarioDTO>>('/internal/usuarios', { params }),

  getUsuario: (idOrGuid: number | string) =>
    apiClient.get<UsuarioDTO>(`/internal/usuarios/${idOrGuid}`),

  createUsuario: (data: {
    username?: string;
    nombres?: string;
    apellidos?: string;
    email?: string;
    correo?: string;
    password: string;
    roleNames?: string[];
    roles?: RolDTO[];
    estadoUsuario?: string;
    activo?: boolean;
  }) =>
    apiClient.post<UsuarioDTO>('/internal/usuarios', data),

  updateUsuario: (idOrGuid: number | string, data: object) =>
    apiClient.put<UsuarioDTO>(`/internal/usuarios/${idOrGuid}`, data),

  inhabilitarUsuario: (idOrGuid: number | string, motivo: string) =>
    apiClient.patch(`/internal/usuarios/${idOrGuid}/inhabilitar`, { motivo }),

  deleteUsuario: (id: number) =>
    apiClient.delete(`/internal/usuarios/${id}`),

  // ── Roles ───────────────────────────────────────────────────────────────────
  listRoles: (params?: { estado?: string }) =>
    apiClient.get('/internal/roles', { params }),

  getRoles: (estado?: string) =>
    apiClient.get<RolDTO[]>('/internal/roles', { params: { estado } }),

  getRol: (idOrGuid: number | string) =>
    apiClient.get<RolDTO>(`/internal/roles/${idOrGuid}`),

  createRol: (data: { nombre?: string; nombreRol?: string; descripcion?: string; descripcionRol?: string }) =>
    apiClient.post<RolDTO>('/internal/roles', data),

  updateRol: (idOrGuid: number | string, data: object) =>
    apiClient.put<RolDTO>(`/internal/roles/${idOrGuid}`, data),

  deleteRol: (id: number) =>
    apiClient.delete(`/internal/roles/${id}`),

  asignarPermisos: (rolGuid: string, permisos: string[]) =>
    apiClient.post(`/internal/roles/${rolGuid}/permisos`, { permisos }),

  // ── Permisos ────────────────────────────────────────────────────────────────
  getPermisos: () =>
    apiClient.get<PermisoDTO[]>('/internal/permisos'),

  // ── Auditoría ───────────────────────────────────────────────────────────────
  getAuditoria: (tabla?: string) =>
    apiClient.get('/internal/auditoria', { params: { tabla } }),
};

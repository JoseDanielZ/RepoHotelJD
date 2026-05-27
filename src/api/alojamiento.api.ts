import apiClient from './client';
import type {
  AccommodationSearchParams, AccommodationSearchItemDTO,
  AccommodationDetailDTO,
  HabitacionPublicDto, SucursalDto,
  HabitacionDto, TipoHabitacionDto,
} from '../types';

export const alojamientoApi = {
  // ── Público ────────────────────────────────────────────────────────────────
  search: (params: AccommodationSearchParams) =>
    apiClient.get<{ items: AccommodationSearchItemDTO[]; totalCount: number }>('/accommodations/search', { params }),

  getDetail: (sucursalGuid: string, params?: { fechaInicio?: string; fechaFin?: string }) =>
    apiClient.get<AccommodationDetailDTO>(`/accommodations/${sucursalGuid}`, { params }),

  getSucursalPublic: (sucursalGuid: string, fechaInicio?: string, fechaFin?: string) =>
    apiClient.get<SucursalDto>(`/accommodations/${sucursalGuid}`, {
      params: { fechaInicio, fechaFin },
    }),

  getHabitacionesPublic: (params?: { fechaInicio?: string; fechaFin?: string; sucursalGuid?: string }) =>
    apiClient.get<HabitacionPublicDto[]>('/public/habitaciones', { params }),

  getHabitacionPublic: (habitacionGuid: string) =>
    apiClient.get<HabitacionPublicDto>(`/public/habitaciones/${habitacionGuid}`),

  getTipoHabitacionPublic: (tipoHabitacionGuid: string) =>
    apiClient.get<TipoHabitacionDto>(`/public/tipos-habitacion/${tipoHabitacionGuid}`),

  // ── Interno — Sucursales ────────────────────────────────────────────────────
  listSucursales: (params?: { estado?: string }) =>
    apiClient.get<SucursalDto[]>('/internal/sucursales', { params }),

  getSucursales: (estado?: string) =>
    apiClient.get<SucursalDto[]>('/internal/sucursales', { params: { estado } }),

  getSucursal: (id: number) =>
    apiClient.get<SucursalDto>(`/internal/sucursales/${id}`),

  createSucursal: (data: object) =>
    apiClient.post<SucursalDto>('/internal/sucursales', data),

  updateSucursal: (idOrGuid: number | string, data: object) =>
    apiClient.put<SucursalDto>(`/internal/sucursales/${idOrGuid}`, data),

  deleteSucursal: (id: number) =>
    apiClient.delete(`/internal/sucursales/${id}`),

  // ── Interno — Habitaciones ─────────────────────────────────────────────────
  listHabitaciones: (params?: { sucursalGuid?: string; estado?: string }) =>
    apiClient.get<HabitacionDto[]>('/internal/habitaciones', { params }),

  getHabitaciones: (estado?: string) =>
    apiClient.get<HabitacionDto[]>('/internal/habitaciones', { params: { estado } }),

  createHabitacion: (data: object) =>
    apiClient.post<HabitacionDto>('/internal/habitaciones', data),

  updateHabitacion: (idOrGuid: number | string, data: object) =>
    apiClient.put<HabitacionDto>(`/internal/habitaciones/${idOrGuid}`, data),

  cambiarEstadoHabitacion: (id: number, nuevoEstado: string) =>
    apiClient.patch(`/internal/habitaciones/${id}/estado`, { nuevoEstado }),

  deleteHabitacion: (id: number) =>
    apiClient.delete(`/internal/habitaciones/${id}`),

  // ── Interno — Tipos habitación ─────────────────────────────────────────────
  listTiposHabitacion: (params?: { sucursalGuid?: string; estado?: string }) =>
    apiClient.get<TipoHabitacionDto[]>('/internal/tipos-habitacion', { params }),

  getTiposHabitacion: (estado?: string) =>
    apiClient.get<TipoHabitacionDto[]>('/internal/tipos-habitacion', { params: { estado } }),

  createTipoHabitacion: (data: object) =>
    apiClient.post<TipoHabitacionDto>('/internal/tipos-habitacion', data),

  updateTipoHabitacion: (idOrGuid: number | string, data: object) =>
    apiClient.put<TipoHabitacionDto>(`/internal/tipos-habitacion/${idOrGuid}`, data),

  deleteTipoHabitacion: (id: number) =>
    apiClient.delete(`/internal/tipos-habitacion/${id}`),
};

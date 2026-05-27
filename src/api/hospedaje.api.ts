import apiClient from './client';
import type { EstadiaDTO, CargoEstadiaDTO } from '../types';

export const hospedajeApi = {
  listEstadias: (params?: { estado?: string; pagina?: number; limite?: number }) =>
    apiClient.get('/internal/estadias', { params }),

  getEstadias: () =>
    apiClient.get<EstadiaDTO[]>('/internal/estadias'),

  getEstadia: (idOrGuid: number | string) =>
    apiClient.get<EstadiaDTO>(`/internal/estadias/${idOrGuid}`),

  checkIn: (idReserva: number | string) =>
    apiClient.post<EstadiaDTO>(`/internal/estadias/checkin/${idReserva}`),

  checkOut: (idOrGuid: number | string, data: { observaciones: string | null; requiereMantenimiento: boolean }) =>
    apiClient.patch<EstadiaDTO>(`/internal/estadias/${idOrGuid}/checkout`, data),

  getCargos: (idOrGuid: number | string) =>
    apiClient.get<CargoEstadiaDTO[]>(`/internal/estadias/${idOrGuid}/cargos`),

  addCargo: (idOrGuid: number | string, data: { concepto?: string; descripcion?: string; monto: number; detalle?: string; categoria?: string }) =>
    apiClient.post<CargoEstadiaDTO>(`/internal/estadias/${idOrGuid}/cargos`, data),
};

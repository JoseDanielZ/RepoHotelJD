import apiClient from './client';
import type {
  ReservaPublicDto, CreateReservaPublicRequest,
  InternalReservaDto, ClientePublicDto, PagedResponse,
  IntegratedBookingRequest, IntegratedBookingResultDTO,
  IntegratedCheckInResultDTO, IntegratedCheckOutResultDTO,
} from '../types';

export const reservasApi = {
  // ── Público ────────────────────────────────────────────────────────────────
  createReservaPublic: (data: CreateReservaPublicRequest) =>
    apiClient.post<ReservaPublicDto>('/accommodations/reservas', data),

  calcularPrecio: (data: object) =>
    apiClient.post('/public/reservas/calcular-precio', data),

  getMisReservas: (params?: { page?: number; limit?: number; estado?: string }) =>
    apiClient.get('/public/reservas', { params }),

  getMiReserva: (reservaGuid: string, clienteGuid?: string) =>
    apiClient.get(`/accommodations/reservas/${reservaGuid}`, { params: clienteGuid ? { clienteGuid } : undefined }),

  cancelarReservaPublic: (reservaGuid: string, motivo: string) =>
    apiClient.patch(`/public/reservas/${reservaGuid}/cancelar`, { motivo }),

  buscarPorCodigo: async (codigoReserva: string) => {
    const res = await apiClient.get('/internal/reservas', { params: { codigoReserva, limite: 1 } });
    const items = Array.isArray(res.data)
      ? res.data
      : (res.data as any).items ?? (res.data as any).data ?? [];
    if (!items.length) return Promise.reject(new Error('Reserva no encontrada'));
    return { ...res, data: items[0] };
  },

  getClienteByEmail: (correo: string) =>
    apiClient.get<ClientePublicDto>('/public/clientes/by-email', { params: { correo } }),

  getClienteByGuid: (clienteGuid: string) =>
    apiClient.get<ClientePublicDto>(`/public/clientes/${clienteGuid}`),

  createClientePublic: (data: Partial<ClientePublicDto>) =>
    apiClient.post<ClientePublicDto>('/public/clientes', data),

  // ── Interno ────────────────────────────────────────────────────────────────
  list: (params?: {
    codigoReserva?: string;
    estadoReserva?: string;
    clienteGuid?: string;
    sucursalGuid?: string;
    pagina?: number;
    limite?: number;
  }) =>
    apiClient.get('/internal/reservas', { params }),

  getReservas: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<InternalReservaDto>>('/internal/reservas', { params }),

  getReserva: (idOrGuid: number | string) =>
    apiClient.get(`/internal/reservas/${idOrGuid}`),

  createReservaInternal: (data: object) =>
    apiClient.post<InternalReservaDto>('/internal/reservas', data),

  confirmarReserva: (idOrGuid: number | string) =>
    apiClient.patch(`/internal/reservas/${idOrGuid}/confirmar`),

  cancelarReserva: (idOrGuid: number | string, data?: { motivo?: string }) =>
    apiClient.patch(`/internal/reservas/${idOrGuid}/cancelar`, data),

  cancelarReservaInternal: (id: number, motivo: string) =>
    apiClient.patch(`/internal/reservas/${id}/cancelar`, { motivo }),

  getClientes: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<ClientePublicDto>>('/internal/clientes', { params }),

  getCliente: (id: number) =>
    apiClient.get<ClientePublicDto>(`/internal/clientes/${id}`),

  // ── Flujos ─────────────────────────────────────────────────────────────────
  bookingIntegrado: (data: IntegratedBookingRequest) =>
    apiClient.post<IntegratedBookingResultDTO>('/internal/flujos/booking/reservas', data),

  pagarReserva: (reservaGuid: string, data: object) =>
    apiClient.post<IntegratedBookingResultDTO>(`/internal/flujos/booking/reservas/${reservaGuid}/pagar`, data),

  checkIn: (reservaGuid: string) =>
    apiClient.post<IntegratedCheckInResultDTO>(`/internal/flujos/operacion/check-in/${reservaGuid}`),

  checkOut: (reservaGuid: string, data?: {
    observaciones?: string | null;
    requiereMantenimiento?: boolean;
    generarFacturaFinal?: boolean;
  }) =>
    apiClient.patch<IntegratedCheckOutResultDTO>(
      `/internal/flujos/operacion/check-out/${reservaGuid}`,
      data ?? { generarFacturaFinal: true, requiereMantenimiento: false, observaciones: null }
    ),
};

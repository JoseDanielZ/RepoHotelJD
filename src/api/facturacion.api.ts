import apiClient from './client';
import type { FacturaDTO, PagoDTO, CreatePagoRequest, PagedResponse } from '../types';

export const facturacionApi = {
  listFacturas: (params?: { estado?: string; pagina?: number; limite?: number }) =>
    apiClient.get('/internal/facturas', { params }),

  listMisFacturas: (params?: { estado?: string; limite?: number }) =>
    apiClient.get<FacturaDTO[]>('/public/facturas', { params }),

  getFacturas: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<FacturaDTO>>('/internal/facturas', { params }),

  getFactura: (idOrGuid: number | string) =>
    apiClient.get<FacturaDTO>(`/internal/facturas/${idOrGuid}`),

  generarFacturaReserva: (idReserva: number) =>
    apiClient.post<FacturaDTO>(`/internal/facturas/generar-reserva/${idReserva}`),

  generarFacturaFinal: (idEstadia: number) =>
    apiClient.post<FacturaDTO>(`/internal/facturas/generar-final/${idEstadia}`),

  anularFactura: (idOrGuid: number | string, motivo: string) =>
    apiClient.patch(`/internal/facturas/${idOrGuid}/anular`, { motivo }),

  listPagos: (params?: { pagina?: number; limite?: number; facturaGuid?: string }) =>
    apiClient.get('/internal/pagos', { params }),

  getPagos: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResponse<PagoDTO>>('/internal/pagos', { params }),

  getPagosByFactura: (facturaId: number | string) =>
    apiClient.get<PagoDTO[]>(`/internal/pagos/factura/${facturaId}`),

  getPago: (idOrGuid: number | string) =>
    apiClient.get<PagoDTO>(`/internal/pagos/${idOrGuid}`),

  createPago: (data: CreatePagoRequest) =>
    apiClient.post<PagoDTO>('/internal/pagos', data),

  cambiarEstadoPago: (idOrGuid: number | string, nuevoEstado: string) =>
    apiClient.patch(`/internal/pagos/${idOrGuid}/estado`, { nuevoEstado }),

  simularPago: (data: object) =>
    apiClient.post('/public/pagos/simular', data),
};

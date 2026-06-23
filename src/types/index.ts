// ─── API Envelope ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  errors: Record<string, string[]> | null;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: Record<string, string[]> | null;
  traceId?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginApiData {
  token: string;
  refreshToken: string;
  expiration: string;
  usuarioId: number;
  usuarioGuid: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  nombres: string;
  apellidos?: string;
  correo: string;
}

// ─── Alojamiento ──────────────────────────────────────────────────────────────
export interface AccommodationSearchParams {
  Destino?: string;
  fechaInicio?: string;
  fechaFin?: string;
  NumAdultos?: number;
  NumNinos?: number;
  NumHabitaciones?: number;
  TipoAlojamiento?: string;
  PrecioMin?: number;
  PrecioMax?: number;
  OrdenarPor?: string;
  Pagina?: number;
  Limite?: number;
}

export interface TipoHabitacionPublicDTO {
  tipoHabitacionGuid: string;
  nombre: string;
  tipoCama?: string;
  capacidadAdultos: number;
  capacidadNinos: number;
  areaM2?: number;
  precioBase: number;
  imagenes: string[];
  amenities: string[];
  disponiblesEnRango: number | null;
}

export interface AccommodationDetailDTO {
  sucursalGuid: string;
  nombre: string;
  descripcion: string;
  descripcionCompleta?: string;
  ciudad: string;
  provincia: string;
  pais: string;
  direccion: string;
  tipoAlojamiento: string;
  estrellas?: number;
  imagenes: string[];
  amenities: string[];
  promedioValoracion: number | null;
  totalValoraciones: number;
  tiposHabitacion: TipoHabitacionPublicDTO[];
  politicas?: {
    horaCheckIn: string;
    horaCheckOut: string;
    aceptaNinos: boolean;
    permiteMascotas: boolean;
  };
}

export interface ReservaSummaryDTO {
  reservaGuid: string;
  clienteGuid: string;
  codigoReserva: string;
  nombreCliente: string;
  nombreSucursal: string;
  fechaInicio: string;
  fechaFin: string;
  estadoReserva: string;
  montoTotal: number;
}

export interface ReservaHabitacionDetailDTO {
  reservaHabitacionGuid: string;
  habitacionGuid: string;
  fechaInicio: string;
  fechaFin: string;
  numAdultos: number;
  numNinos: number;
  precioNocheAplicado: number;
  subtotalLinea: number;
  valorIvaLinea: number;
  descuentoLinea: number;
  totalLinea: number;
  estadoDetalle: string;
}

export interface ReservaDetailDTO {
  reservaGuid: string;
  codigoReserva: string;
  clienteGuid: string;
  sucursalGuid: string;
  fechaReservaUtc: string;
  fechaInicio: string;
  fechaFin: string;
  subtotalReserva: number;
  valorIva: number;
  totalReserva: number;
  descuentoAplicado: number;
  saldoPendiente: number;
  origenCanalReserva: string;
  estadoReserva: string;
  fechaConfirmacionUtc: string | null;
  observaciones: string | null;
  esWalkin: boolean;
  habitaciones: ReservaHabitacionDetailDTO[];
}

export interface AccommodationSearchItemDTO {
  sucursalGuid: string;
  nombre: string;
  descripcion: string;
  ciudad: string;
  provincia: string;
  pais: string;
  tipoAlojamiento: string;
  estrellas?: number;
  precioDesde: number | null;
  habitacionesDisponibles: number;
  imagenPrincipalUrl: string | null;
  promedioValoracion: number | null;
  totalValoraciones: number;
  aceptaNinos: boolean;
  permiteMascotas: boolean;
}

export interface HabitacionPublicDto {
  habitacionGuid: string;
  numeroHabitacion: string;
  piso: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion: string;
  estadoHabitacion: string;
  imagenes: ImagenDto[];
  tipoHabitacion: TipoHabitacionPublicDto | null;
}

export interface TipoHabitacionPublicDto {
  tipoHabitacionGuid: string;
  nombreTipoHabitacion: string;
  descripcion: string;
  capacidadAdultos: number;
  capacidadNinos: number;
  capacidadTotal: number;
  permitReservaPublica: boolean;
  estadoTipoHabitacion: string;
}

export interface ImagenDto {
  url: string;
  descripcion?: string;
}

export interface SucursalDto {
  idSucursal: number;
  sucursalGuid: string;
  nombreSucursal: string;
  descripcion: string;
  destino: string;
  tipoAlojamiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: string;
  capacidadMaxima?: number;
  puntuacionPromedio?: number;
  totalValoraciones?: number;
}

export interface SucursalUpsertRequest {
  nombreSucursal: string;
  descripcion: string;
  destino: string;
  tipoAlojamiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: string;
}

export interface HabitacionDto {
  idHabitacion: number;
  habitacionGuid: string;
  numeroHabitacion: string;
  piso: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion: string;
  estadoHabitacion: string;
  idTipoHabitacion?: number;
  idSucursal?: number;
}

export interface TipoHabitacionDto {
  idTipoHabitacion: number;
  tipoHabitacionGuid: string;
  nombreTipoHabitacion: string;
  descripcion: string;
  capacidadAdultos: number;
  capacidadNinos: number;
  capacidadTotal: number;
  permitReservaPublica: boolean;
  estadoTipoHabitacion: string;
}

// ─── Reservas ─────────────────────────────────────────────────────────────────
export interface ReservaPublicDto {
  reservaGuid: string;
  codigoReserva: string;
  clienteGuid: string;
  sucursalGuid: string;
  fechaReservaUtc: string;
  fechaInicio: string;
  fechaFin: string;
  subtotalReserva: number;
  valorIva: number;
  totalReserva: number;
  descuentoAplicado: number;
  saldoPendiente: number;
  origenCanalReserva: string;
  estadoReserva: string;
  fechaConfirmacionUtc: string | null;
  observaciones: string | null;
  esWalkin: boolean;
  habitaciones: ReservaHabitacionPublicDto[];
}

export interface ReservaHabitacionPublicDto {
  reservaHabitacionGuid: string;
  habitacionGuid: string;
  fechaInicio: string;
  fechaFin: string;
  numAdultos: number;
  numNinos: number;
  precioNocheAplicado: number;
  subtotalLinea: number;
  valorIvaLinea: number;
  descuentoLinea: number;
  totalLinea: number;
  estadoDetalle: string;
}

export interface ClientePublicDto {
  clienteGuid: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  estado: string;
}

export interface CreateReservaPublicRequest {
  sucursalGuid: string;
  fechaInicio: string;
  fechaFin: string;
  origenCanalReserva: string;
  observaciones: string | null;
  cliente: {
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    direccion: string | null;
  };
  habitaciones: {
    tipoHabitacionGuid: string;
    habitacionGuid?: string;
    numHabitaciones: number;
    numAdultos: number;
    numNinos: number;
  }[];
}

export interface InternalReservaDto {
  idReserva: number;
  reservaGuid: string;
  codigoReserva: string;
  idCliente: number;
  clienteGuid?: string;
  idSucursal: number;
  sucursalGuid?: string;
  fechaReservaUtc: string;
  fechaInicio: string;
  fechaFin: string;
  subtotalReserva: number;
  valorIva: number;
  totalReserva: number;
  descuentoAplicado: number;
  saldoPendiente: number;
  origenCanalReserva: string;
  estadoReserva: string;
  fechaConfirmacionUtc: string | null;
  observaciones: string | null;
  esWalkin: boolean;
}

export interface ReservaPrecioRequest {
  sucursalGuid: string;
  fechaInicio: string;
  fechaFin: string;
  habitaciones: {
    tipoHabitacionGuid: string;
    numHabitaciones: number;
    numAdultos: number;
    numNinos: number;
  }[];
}

// ─── Hospedaje ────────────────────────────────────────────────────────────────
export interface EstadiaDTO {
  idEstadia: number;
  estadiaGuid: string;
  idReservaHabitacion: number;
  idCliente: number;
  idHabitacion: number;
  checkinUtc: string | null;
  checkoutUtc: string | null;
  estadoEstadia: string;
  observacionesCheckin: string;
  observacionesCheckout: string;
  requiereMantenimiento: boolean;
  cargos: CargoEstadiaDTO[];
}

export interface CargoEstadiaDTO {
  idCargo: number;
  idEstadia: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fechaRegistroUtc: string;
}

// ─── Facturación ──────────────────────────────────────────────────────────────
export interface FacturaDTO {
  idFactura: number;
  guidFactura: string;
  idCliente: number;
  idReserva: number;
  idSucursal: number;
  numeroFactura: string;
  tipoFactura: string;
  fechaEmision: string;
  subtotal: number;
  valorIva: number;
  descuentoTotal: number;
  total: number;
  saldoPendiente: number;
  moneda: string;
  estado: string;
  detalles?: FacturaDetalleDTO[];
}

export interface FacturaDetalleDTO {
  idDetalle: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PagoDTO {
  idPago: number;
  pagoGuid: string;
  idFactura: number;
  idReserva: number;
  monto: number;
  metodoPago: string;
  esPagoElectronico: boolean;
  proveedorPasarela: string;
  transaccionExterna: string;
  codigoAutorizacion: string;
  referencia: string;
  estadoPago: string;
  fechaPagoUtc: string;
  moneda: string;
  tipoCambio: number;
}

export interface CreatePagoRequest {
  idFactura: number;
  idReserva: number;
  monto: number;
  metodoPago: string;
  esPagoElectronico: boolean;
  proveedorPasarela: string;
  transaccionExterna: string;
  codigoAutorizacion: string;
  referencia: string;
  moneda: string;
  tipoCambio: number;
}

// ─── Seguridad ────────────────────────────────────────────────────────────────
export interface UsuarioDTO {
  idUsuario: number;
  usuarioGuid: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  estadoUsuario: string;
  activo: boolean;
  roles: RolDTO[];
}

export interface RolDTO {
  idRol: number;
  rolGuid: string;
  nombreRol: string;
  descripcionRol: string;
  estadoRol: string;
  permisos?: PermisoDTO[];
}

export interface PermisoDTO {
  idPermiso: number;
  nombrePermiso: string;
  descripcionPermiso: string;
}

export interface CreateUsuarioRequest {
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  password: string;
  estadoUsuario: string;
  activo: boolean;
  roles: RolDTO[];
}

// ─── Flujos Integrados ────────────────────────────────────────────────────────
export interface IntegratedBookingRequest {
  reserva: {
    sucursalGuid: string;
    fechaInicio: string;
    fechaFin: string;
    observaciones: string | null;
    esWalkin: boolean;
    origenCanalReserva: string;
    cliente: {
      tipoIdentificacion: string;
      numeroIdentificacion: string;
      nombres: string;
      apellidos: string | null;
      correo: string;
      telefono: string;
      direccion: string | null;
    };
    habitaciones: {
      tipoHabitacionGuid: string;
      numHabitaciones: number;
      numAdultos: number;
      numNinos: number;
    }[];
  };
  generarFacturaInicial: boolean;
  pagoInicial: {
    monto: number;
    metodoPago: string;
    esPagoElectronico: boolean;
    proveedorPasarela: string;
    transaccionExterna: string;
    codigoAutorizacion: string;
    referencia: string;
    moneda: string;
    tipoCambio: number;
    simularPago: boolean;
  } | null;
}

export interface IntegratedBookingResultDTO {
  reserva: ReservaPublicDto;
  factura: FacturaDTO | null;
  pago: PagoDTO | null;
}

export interface IntegratedCheckInResultDTO {
  reservaGuid: string;
  estadias: EstadiaDTO[];
}

export interface IntegratedCheckOutResultDTO {
  estadia: EstadiaDTO;
  factura: FacturaDTO | null;
}

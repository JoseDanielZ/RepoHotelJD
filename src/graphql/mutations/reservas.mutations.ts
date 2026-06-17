import { gql } from '@apollo/client';

export const CREAR_RESERVA = gql`
  mutation CrearReserva($input: ReservationCreateDTOInput!) {
    crearReserva(input: $input) {
      reservaGuid
      codigoReserva
      clienteGuid
      sucursalGuid
      fechaReservaUtc
      fechaInicio
      fechaFin
      subtotalReserva
      valorIva
      totalReserva
      saldoPendiente
      estadoReserva
      habitaciones {
        reservaHabitacionGuid
        habitacionGuid
        precioNocheAplicado
        totalLinea
        estadoDetalle
      }
    }
  }
`;

export const CANCELAR_RESERVA = gql`
  mutation CancelarReserva($reservaGuid: UUID!, $motivo: String) {
    cancelarReserva(reservaGuid: $reservaGuid, motivo: $motivo)
  }
`;

export const CALCULAR_PRECIO_RESERVA = gql`
  mutation CalcularPrecioReserva($input: ReservationPriceRequestDTOInput!) {
    calcularPrecioReserva(input: $input) {
      habitacionGuid
      precioNocheAplicado
      subtotalLinea
      valorIvaLinea
      totalLinea
      origenPrecio
    }
  }
`;

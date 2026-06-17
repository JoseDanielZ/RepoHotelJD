import { gql } from '@apollo/client';

const RESERVA_FIELDS = gql`
  fragment ReservaFields on ReservationDTO {
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
    descuentoAplicado
    saldoPendiente
    origenCanalReserva
    estadoReserva
    fechaConfirmacionUtc
    fechaCancelacionUtc
    motivoCancelacion
    observaciones
    esWalkin
    habitaciones {
      reservaHabitacionGuid
      habitacionGuid
      fechaInicio
      fechaFin
      numAdultos
      numNinos
      precioNocheAplicado
      subtotalLinea
      valorIvaLinea
      descuentoLinea
      totalLinea
      estadoDetalle
    }
  }
`;

export const GET_RESERVA_BY_GUID = gql`
  ${RESERVA_FIELDS}
  query ReservaByGuid($reservaGuid: UUID!) {
    reservaByGuid(reservaGuid: $reservaGuid) {
      ...ReservaFields
    }
  }
`;

export const GET_RESERVA_BY_CODIGO = gql`
  ${RESERVA_FIELDS}
  query ReservaByCodigo($codigo: String!) {
    reservaByCodigo(codigo: $codigo) {
      ...ReservaFields
    }
  }
`;

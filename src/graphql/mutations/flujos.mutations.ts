import { gql } from '@apollo/client';

export const CREAR_BOOKING_INTEGRADO = gql`
  mutation CrearBookingIntegrado($input: IntegratedBookingCreateDTOInput!) {
    crearBookingIntegrado(input: $input) {
      reserva {
        reservaGuid
        codigoReserva
        fechaInicio
        fechaFin
        totalReserva
        saldoPendiente
        estadoReserva
      }
      facturaInicial {
        facturaGuid
        numeroFactura
        total
        saldoPendiente
        moneda
        estado
      }
      pago {
        pagoGuid
        monto
        estadoPago
        metodoPago
        fechaPagoUtc
      }
      pagoSimulado {
        codigoReserva
        monto
        estadoPago
        estadoReserva
        mensaje
        fechaPagoUtc
      }
    }
  }
`;

export const PAGAR_BOOKING = gql`
  mutation PagarBooking($reservaGuid: UUID!, $input: IntegratedPaymentDTOInput!) {
    pagarBooking(reservaGuid: $reservaGuid, input: $input) {
      reserva {
        reservaGuid
        codigoReserva
        estadoReserva
        saldoPendiente
      }
      pago {
        pagoGuid
        monto
        estadoPago
        metodoPago
        fechaPagoUtc
      }
      pagoSimulado {
        codigoReserva
        monto
        estadoPago
        mensaje
        fechaPagoUtc
      }
    }
  }
`;

export const CHECK_IN_INTEGRADO = gql`
  mutation CheckInIntegrado($reservaGuid: UUID!) {
    checkInIntegrado(reservaGuid: $reservaGuid) {
      reserva {
        reservaGuid
        codigoReserva
        estadoReserva
      }
      estadia {
        estadiaGuid
        checkinUtc
        estadoEstadia
        observacionesCheckin
        fechaRegistroUtc
      }
    }
  }
`;

export const CHECK_OUT_INTEGRADO = gql`
  mutation CheckOutIntegrado($estadiaGuid: UUID!, $input: IntegratedCheckOutDTOInput!) {
    checkOutIntegrado(estadiaGuid: $estadiaGuid, input: $input) {
      estadia {
        estadiaGuid
        checkoutUtc
        estadoEstadia
        observacionesCheckout
        requiereMantenimiento
      }
      facturaFinal {
        facturaGuid
        numeroFactura
        total
        saldoPendiente
        moneda
        estado
      }
    }
  }
`;

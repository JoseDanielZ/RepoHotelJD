import { gql } from '@apollo/client';

const FACTURA_FIELDS = gql`
  fragment FacturaFields on FacturaDTO {
    facturaGuid
    idReserva
    numeroFactura
    tipoFactura
    fechaEmision
    subtotal
    valorIva
    descuentoTotal
    total
    saldoPendiente
    moneda
    estado
    fechaRegistroUtc
  }
`;

export const GENERAR_FACTURA_RESERVA = gql`
  ${FACTURA_FIELDS}
  mutation GenerarFacturaReserva($reservaGuid: UUID!) {
    generarFacturaReserva(reservaGuid: $reservaGuid) {
      ...FacturaFields
    }
  }
`;

export const GENERAR_FACTURA_FINAL = gql`
  ${FACTURA_FIELDS}
  mutation GenerarFacturaFinal($reservaGuid: UUID!) {
    generarFacturaFinal(reservaGuid: $reservaGuid) {
      ...FacturaFields
    }
  }
`;

export const REGISTRAR_PAGO = gql`
  mutation RegistrarPago($input: PagoCreateDTOInput!) {
    registrarPago(input: $input) {
      pagoGuid
      monto
      metodoPago
      esPagoElectronico
      proveedorPasarela
      transaccionExterna
      codigoAutorizacion
      referencia
      estadoPago
      fechaPagoUtc
      moneda
      tipoCambio
      respuestaPasarela
      fechaRegistroUtc
    }
  }
`;

export const SIMULAR_PAGO = gql`
  mutation SimularPago($input: PagoSimularDTOInput!) {
    simularPago(input: $input) {
      codigoReserva
      monto
      estadoPago
      estadoReserva
      transaccionExterna
      codigoAutorizacion
      mensaje
      fechaPagoUtc
    }
  }
`;

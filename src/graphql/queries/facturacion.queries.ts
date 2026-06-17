import { gql } from '@apollo/client';

export const GET_FACTURA_BY_GUID = gql`
  query FacturaByGuid($facturaGuid: UUID!) {
    facturaByGuid(facturaGuid: $facturaGuid) {
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
      observacionesFactura
      estado
      fechaRegistroUtc
      detalles {
        facturaDetalleGuid
        tipoItem
        referenciaTipo
        referenciaId
        descripcionItem
        cantidad
        precioUnitario
        subtotalLinea
        valorIvaLinea
        descuentoLinea
        totalLinea
        fechaRegistroUtc
      }
    }
  }
`;

export const GET_FACTURA_SALDO = gql`
  query FacturaSaldo($facturaGuid: UUID!) {
    facturaSaldo(facturaGuid: $facturaGuid) {
      facturaGuid
      total
      saldoPendiente
      moneda
      estado
    }
  }
`;

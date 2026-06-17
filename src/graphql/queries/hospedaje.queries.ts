import { gql } from '@apollo/client';

export const GET_ESTADIA_BY_GUID = gql`
  query EstadiaByGuid($estadiaGuid: UUID!) {
    estadiaByGuid(estadiaGuid: $estadiaGuid) {
      estadiaGuid
      checkinUtc
      checkoutUtc
      estadoEstadia
      observacionesCheckin
      observacionesCheckout
      requiereMantenimiento
      fechaRegistroUtc
      cargos {
        cargoGuid
        descripcionCargo
        cantidad
        precioUnitario
        subtotal
        valorIva
        totalCargo
        fechaConsumoUtc
        estadoCargo
        fechaRegistroUtc
      }
    }
  }
`;

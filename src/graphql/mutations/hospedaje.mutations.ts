import { gql } from '@apollo/client';

export const CHECK_IN = gql`
  mutation CheckIn($reservaGuid: UUID!) {
    checkIn(reservaGuid: $reservaGuid) {
      estadiaGuid
      checkinUtc
      estadoEstadia
      observacionesCheckin
      fechaRegistroUtc
      cargos {
        cargoGuid
        descripcionCargo
        totalCargo
        estadoCargo
      }
    }
  }
`;

export const CHECK_OUT = gql`
  mutation CheckOut(
    $estadiaGuid: UUID!
    $observaciones: String
    $requiereMantenimiento: Boolean
  ) {
    checkOut(
      estadiaGuid: $estadiaGuid
      observaciones: $observaciones
      requiereMantenimiento: $requiereMantenimiento
    )
  }
`;

export const AGREGAR_CARGO = gql`
  mutation AgregarCargo($estadiaGuid: UUID!, $input: CargoHospedajeCreateDTOInput!) {
    agregarCargo(estadiaGuid: $estadiaGuid, input: $input) {
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
`;

export const ANULAR_CARGO = gql`
  mutation AnularCargo($cargoGuid: UUID!) {
    anularCargo(cargoGuid: $cargoGuid)
  }
`;

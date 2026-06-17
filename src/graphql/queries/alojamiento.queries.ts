import { gql } from '@apollo/client';

export const SEARCH_ALOJAMIENTOS = gql`
  query SearchAlojamientos(
    $destino: String
    $fechaEntrada: DateTime
    $fechaSalida: DateTime
    $numAdultos: Int
    $numNinos: Int
    $numHabitaciones: Int
    $tipoAlojamiento: String
    $precioMin: Decimal
    $precioMax: Decimal
    $categoriaViaje: String
    $ordenarPor: String
    $pagina: Int
    $limite: Int
  ) {
    searchAlojamientos(
      destino: $destino
      fechaEntrada: $fechaEntrada
      fechaSalida: $fechaSalida
      numAdultos: $numAdultos
      numNinos: $numNinos
      numHabitaciones: $numHabitaciones
      tipoAlojamiento: $tipoAlojamiento
      precioMin: $precioMin
      precioMax: $precioMax
      categoriaViaje: $categoriaViaje
      ordenarPor: $ordenarPor
      pagina: $pagina
      limite: $limite
    ) {
      items {
        sucursalGuid
        nombre
        ciudad
        provincia
        pais
        direccion
        descripcion
        categoria
        estrellas
        tipoAlojamiento
        precioDesde
        moneda
        imagenPrincipalUrl
        promedioValoracion
        totalValoraciones
        habitacionesDisponibles
        serviciosDestacados
        horaCheckIn
        horaCheckOut
        aceptaNinos
        permiteMascotas
      }
      pagina
      limite
      totalResultados
      totalPaginas
      tieneSiguiente
      tieneAnterior
    }
  }
`;

export const GET_ALOJAMIENTO_DETAIL = gql`
  query AlojamientoDetail(
    $sucursalGuid: UUID!
    $fechaEntrada: DateTime
    $fechaSalida: DateTime
  ) {
    alojamientoDetail(
      sucursalGuid: $sucursalGuid
      fechaEntrada: $fechaEntrada
      fechaSalida: $fechaSalida
    ) {
      sucursalGuid
      nombre
      ciudad
      provincia
      pais
      direccion
      descripcion
      descripcionCompleta
      categoria
      estrellas
      tipoAlojamiento
      precioDesde
      moneda
      imagenPrincipalUrl
      promedioValoracion
      totalValoraciones
      habitacionesDisponibles
      serviciosDestacados
      horaCheckIn
      horaCheckOut
      aceptaNinos
      permiteMascotas
      amenities
      imagenes
      tiposHabitacion {
        tipoHabitacionGuid
        nombre
        tipoCama
        capacidadAdultos
        capacidadNinos
        areaM2
        precioBase
        imagenes
        amenities
        servicios
        disponiblesEnRango
      }
      tarifasActivas {
        tarifaGuid
        nombre
        precioPorNoche
        moneda
        fechaInicio
        fechaFin
        minNoches
        tipoHabitacionGuid
      }
      politicas {
        horaCheckIn
        horaCheckOut
        aceptaNinos
        permiteMascotas
        politicas
      }
    }
  }
`;

export const GET_ALOJAMIENTO_HABITACIONES = gql`
  query AlojamientoHabitaciones(
    $sucursalGuid: UUID!
    $tipoHabitacionGuid: UUID
    $fechaInicio: DateTime
    $fechaFin: DateTime
  ) {
    alojamientoHabitaciones(
      sucursalGuid: $sucursalGuid
      tipoHabitacionGuid: $tipoHabitacionGuid
      fechaInicio: $fechaInicio
      fechaFin: $fechaFin
    ) {
      habitacionGuid
      tipoHabitacionGuid
      tipoNombre
      numeroHabitacion
      piso
      capacidadAdultos
      capacidadNinos
      precioBase
      moneda
      estadoHabitacion
      disponibleEnRango
    }
  }
`;

export const GET_ALOJAMIENTO_REVIEWS = gql`
  query AlojamientoReviews(
    $sucursalGuid: UUID!
    $pagina: Int
    $limite: Int
  ) {
    alojamientoReviews(
      sucursalGuid: $sucursalGuid
      pagina: $pagina
      limite: $limite
    ) {
      items {
        valoracionGuid
        puntuacion
        comentarioPositivo
        comentarioNegativo
        tipoViaje
        fecha
        nombreVisibleCliente
        respuestaPropiedad
      }
      pagina
      limite
      totalResultados
      totalPaginas
    }
  }
`;

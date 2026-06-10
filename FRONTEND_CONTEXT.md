# Contexto Completo del Backend — Hotel Kairos
> Documento generado el 2026-06-08. Incluye todos los contratos API existentes + la nueva capa de Bus de Eventos con RabbitMQ.

---

## Infraestructura actual

| Servicio | Tecnología | Cómo corre | Puerto |
|---|---|---|---|
| Middleware.HotelJJ (ESB) | ASP.NET Core 10 | `dotnet run` | 5000 |
| Microservicio.Reservas | ASP.NET Core 10 | `dotnet run` | 5102 |
| Microservicio.Alojamiento | ASP.NET Core 10 | `dotnet run` | variable |
| Microservicio.Facturacion | ASP.NET Core 10 | `dotnet run` | variable |
| Microservicio.Hospedaje | ASP.NET Core 10 | `dotnet run` | variable |
| Microservicio.Seguridad | ASP.NET Core 10 | `dotnet run` | variable |
| RabbitMQ | Docker (`rabbitmq:3.13-management`) | `docker compose` | 5672 / 15672 |
| Frontend | React Native / Expo | `npm run dev` | 8081 |

**Variable de entorno base del frontend:**
```
EXPO_PUBLIC_API_BASE = URL del Middleware.HotelJJ
```

**RabbitMQ Management UI:** `http://localhost:15672`  
Usuario: `hotelkairos` / Contraseña: `hotelkairos123` / VHost: `/hotelkairos`

---

## Qué cambió en esta fase (Bus de Eventos)

Los **endpoints HTTP existentes NO cambiaron**. El bus de eventos es una capa adicional **backend-to-backend** para integración con plataformas de Booking externas. El frontend sigue consumiendo exactamente los mismos endpoints de siempre.

Lo nuevo que el frontend debe saber:
- `origenCanalReserva` ahora puede tener el valor `"BOOKING"` además de `"MARKETPLACE"`, `"FRONT_DESK"`, `"DIRECTO"`.
- Las reservas con origen `"BOOKING"` son creadas de forma asíncrona por el bus de eventos — pueden aparecer en la BD sin haber pasado por el formulario del frontend.
- El estado inicial de estas reservas es siempre `"PEN"`.

---

## Configuración global

| Parámetro | Valor esperado |
|-----------|---------------|
| Variable de entorno | `EXPO_PUBLIC_API_BASE` |
| Prefijo de todas las rutas | `/api/v1` |
| Ejemplo base URL | `https://middlewarejd-xxx.azurewebsites.net` |
| Timeout cliente | 30 s |
| Content-Type | `application/json` |

---

## Envelope estándar de respuesta

**Todas** las respuestas exitosas deben envolver el dato en este envelope:

```json
{
  "success": true,
  "message": "string",
  "statusCode": 200,
  "data": "<payload>",
  "errors": null
}
```

**Errores:**
```json
{
  "success": false,
  "message": "Descripción legible del error",
  "statusCode": 400,
  "errors": { "campo": ["mensaje de validación"] },
  "traceId": "0HNM...",
  "timestamp": "2026-06-09T01:17:59Z"
}
```

> El frontend extrae `data.message` primero, luego aplana `data.errors` si `message` está vacío.

---

## Paginación

```json
{
  "items": [],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 20
}
```

Query params aceptados: `page` / `pageSize` **ó** `pagina` / `limite`.

---

## 1. Microservicio de Seguridad

**Base:** `EXPO_PUBLIC_API_BASE/api/v1`

### Claims JWT requeridos

| Claim | Tipo | Descripción |
|-------|------|-------------|
| `nameidentifier` | `string` | ID numérico del usuario |
| `unique_name` | `string` | Username |
| `email` | `string` | Correo del usuario |
| `usuarioGuid` | `string` (UUID) | GUID del usuario |
| `nombres` | `string` | Nombres del usuario |
| `apellidos` | `string` | Apellidos del usuario |
| `role` | `string` o `string[]` | Rol(es) asignados |
| **`idCliente`** | `string` o `number` | **REQUERIDO para HUESPED.** Sin este claim `/public/reservas` devuelve 401. |

### `POST /auth/login`

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response `200`:**
```json
{
  "token": "eyJ...",
  "refreshToken": "string",
  "expiration": "2026-06-09T02:17:58Z",
  "usuarioId": 1,
  "usuarioGuid": "bd000001-0000-0000-0000-000000000001",
  "username": "administrativoJD",
  "email": "admin@hotel.com",
  "roles": ["ADMINISTRADOR"]
}
```

### `POST /auth/register-cliente`

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "nombres": "string",
  "correo": "string"
}
```

**Response `200`:** mismo shape que login (con `idCliente` en JWT si es HUESPED).

### `POST /auth/logout`
```json
{ "refreshToken": "string" }
```
Response: `200` (el frontend ignora el body).

### `POST /auth/refresh`
```json
{ "refreshToken": "string" }
```
Response `200`: `{ "token": "eyJ...", "refreshToken": "string" }`

> Si el refresh expiró → `401`. El frontend redirige a login automáticamente.

### `POST /auth/cambiar-password`
```json
{ "passwordActual": "string", "passwordNuevo": "string" }
```

### Usuarios — interno (rol ADMINISTRADOR)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/usuarios` | Lista paginada. Query: `page`, `pageSize`, `estado` |
| `GET` | `/internal/usuarios/:idOrGuid` | Detalle |
| `POST` | `/internal/usuarios` | Crear usuario |
| `PUT` | `/internal/usuarios/:idOrGuid` | Actualizar |
| `PATCH` | `/internal/usuarios/:idOrGuid/inhabilitar` | Body: `{ "motivo": "string" }` |
| `DELETE` | `/internal/usuarios/:id` | Eliminar |

**Shape `UsuarioDTO`:**
```json
{
  "idUsuario": 1,
  "usuarioGuid": "uuid",
  "nombres": "string",
  "apellidos": "string",
  "usuario": "string",
  "correo": "string",
  "estadoUsuario": "ACT",
  "activo": true,
  "roles": [{ "idRol": 1, "rolGuid": "uuid", "nombreRol": "ADMINISTRADOR", "descripcionRol": "string", "estadoRol": "ACT" }]
}
```

**Request crear usuario:**
```json
{
  "username": "string",
  "nombres": "string",
  "apellidos": "string",
  "email": "string",
  "password": "string",
  "roleNames": ["RECEPCIONISTA"],
  "estadoUsuario": "ACT",
  "activo": true
}
```

### Roles y Permisos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/roles` | Lista roles. Query: `estado` |
| `GET` | `/internal/roles/:idOrGuid` | Detalle |
| `POST` | `/internal/roles` | Body: `{ "nombreRol": "string", "descripcionRol": "string" }` |
| `PUT` | `/internal/roles/:idOrGuid` | Actualizar |
| `DELETE` | `/internal/roles/:id` | Eliminar |
| `POST` | `/internal/roles/:rolGuid/permisos` | Body: `{ "permisos": ["string"] }` |
| `GET` | `/internal/permisos` | Lista todos los permisos |
| `GET` | `/internal/auditoria` | Query: `tabla` (opcional) |

---

## 2. Microservicio de Alojamiento

**Prefijo público:** `/accommodations` y `/public`  
**Prefijo interno:** `/internal`

### `GET /accommodations/search`

**Query params:**

| Param | Tipo |
|-------|------|
| `Destino` | string |
| `fechaInicio` | string (ISO date) |
| `fechaFin` | string (ISO date) |
| `NumAdultos` | number |
| `NumNinos` | number |
| `NumHabitaciones` | number |
| `TipoAlojamiento` | string |
| `PrecioMin` | number |
| `PrecioMax` | number |
| `OrdenarPor` | string |
| `Pagina` | number |
| `Limite` | number |

**Response `200`** *(sin envelope — acceso directo)*:
```json
{
  "items": [
    {
      "sucursalGuid": "uuid",
      "nombre": "string",
      "descripcion": "string",
      "ciudad": "string",
      "provincia": "string",
      "pais": "string",
      "tipoAlojamiento": "HOTEL",
      "estrellas": 4,
      "precioDesde": 80.00,
      "habitacionesDisponibles": 5,
      "imagenPrincipalUrl": "https://...",
      "promedioValoracion": 4.5,
      "totalValoraciones": 12,
      "aceptaNinos": true,
      "permiteMascotas": false
    }
  ],
  "totalCount": 10
}
```

### `GET /accommodations/:sucursalGuid`

Query params opcionales: `fechaInicio`, `fechaFin`.

**Response `200`:**
```json
{
  "sucursalGuid": "uuid",
  "nombre": "string",
  "descripcion": "string",
  "descripcionCompleta": "string",
  "ciudad": "string",
  "provincia": "string",
  "pais": "string",
  "direccion": "string",
  "tipoAlojamiento": "HOTEL",
  "estrellas": 4,
  "imagenes": ["https://..."],
  "amenities": ["WiFi", "Piscina"],
  "promedioValoracion": 4.5,
  "totalValoraciones": 12,
  "tiposHabitacion": [
    {
      "tipoHabitacionGuid": "uuid",
      "nombre": "Suite Ejecutiva",
      "tipoCama": "King",
      "capacidadAdultos": 2,
      "capacidadNinos": 1,
      "areaM2": 45,
      "precioBase": 120.00,
      "imagenes": ["https://..."],
      "amenities": ["AC", "TV"],
      "disponiblesEnRango": 3
    }
  ],
  "politicas": {
    "horaCheckIn": "15:00",
    "horaCheckOut": "12:00",
    "aceptaNinos": true,
    "permiteMascotas": false
  }
}
```

### Habitaciones y Tipos — público

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/public/habitaciones` | Query: `fechaInicio`, `fechaFin`, `sucursalGuid` |
| `GET` | `/public/habitaciones/:habitacionGuid` | Detalle |
| `GET` | `/public/tipos-habitacion/:tipoHabitacionGuid` | Detalle |

**Shape `HabitacionPublicDto`:**
```json
{
  "habitacionGuid": "uuid",
  "numeroHabitacion": "101",
  "piso": 1,
  "capacidadHabitacion": 2,
  "precioBase": 90.00,
  "descripcionHabitacion": "string",
  "estadoHabitacion": "DISPONIBLE",
  "imagenes": [{ "url": "https://...", "descripcion": "string" }],
  "tipoHabitacion": {
    "tipoHabitacionGuid": "uuid",
    "nombreTipoHabitacion": "string",
    "descripcion": "string",
    "capacidadAdultos": 2,
    "capacidadNinos": 1,
    "capacidadTotal": 3,
    "permitReservaPublica": true,
    "estadoTipoHabitacion": "ACT"
  }
}
```

### Sucursales — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/sucursales` | Query: `estado` |
| `GET` | `/internal/sucursales/:id` | — |
| `POST` | `/internal/sucursales` | `SucursalUpsertRequest` |
| `PUT` | `/internal/sucursales/:idOrGuid` | `SucursalUpsertRequest` |
| `DELETE` | `/internal/sucursales/:id` | — |

**Shape `SucursalDto`:**
```json
{
  "idSucursal": 1,
  "sucursalGuid": "uuid",
  "nombreSucursal": "string",
  "descripcion": "string",
  "destino": "Quito",
  "tipoAlojamiento": "HOTEL",
  "direccion": "string",
  "telefono": "string",
  "correo": "string",
  "estado": "ACT",
  "capacidadMaxima": 50,
  "puntuacionPromedio": 4.2,
  "totalValoraciones": 8
}
```

### Habitaciones — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/habitaciones` | Query: `sucursalGuid`, `estado` |
| `POST` | `/internal/habitaciones` | Crear |
| `PUT` | `/internal/habitaciones/:idOrGuid` | Actualizar |
| `PATCH` | `/internal/habitaciones/:id/estado` | Body: `{ "nuevoEstado": "string" }` |
| `DELETE` | `/internal/habitaciones/:id` | — |

### Tipos de habitación — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/tipos-habitacion` | Query: `sucursalGuid`, `estado` |
| `POST` | `/internal/tipos-habitacion` | Crear |
| `PUT` | `/internal/tipos-habitacion/:idOrGuid` | Actualizar |
| `DELETE` | `/internal/tipos-habitacion/:id` | — |

---

## 3. Microservicio de Reservas

### `POST /accommodations/reservas` — crear reserva pública (sin auth)

**Request:**
```json
{
  "sucursalGuid": "uuid",
  "fechaInicio": "2026-07-10",
  "fechaFin": "2026-07-13",
  "origenCanalReserva": "MARKETPLACE",
  "observaciones": null,
  "cliente": {
    "tipoIdentificacion": "CC",
    "numeroIdentificacion": "1234567890",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "correo": "juan@email.com",
    "telefono": "0991234567",
    "direccion": null
  },
  "habitaciones": [
    {
      "tipoHabitacionGuid": "uuid",
      "numHabitaciones": 1,
      "numAdultos": 2,
      "numNinos": 0
    }
  ]
}
```

**Valores válidos de `origenCanalReserva`:** `"MARKETPLACE"` · `"FRONT_DESK"` · `"DIRECTO"` · `"BOOKING"`

**Response `201`:**
```json
{
  "reservaGuid": "uuid",
  "codigoReserva": "RES-XXXXXXXX",
  "clienteGuid": "uuid",
  "sucursalGuid": "uuid",
  "fechaReservaUtc": "2026-06-09T01:00:00Z",
  "fechaInicio": "2026-07-10",
  "fechaFin": "2026-07-13",
  "subtotalReserva": 300.00,
  "valorIva": 36.00,
  "totalReserva": 336.00,
  "descuentoAplicado": 0,
  "saldoPendiente": 336.00,
  "origenCanalReserva": "MARKETPLACE",
  "estadoReserva": "PEN",
  "fechaConfirmacionUtc": null,
  "observaciones": null,
  "esWalkin": false,
  "habitaciones": []
}
```

### `GET /public/reservas` — mis reservas (HUESPED autenticado)

> Requiere claim `idCliente` en el JWT.

Query params opcionales: `page`, `limit`, `estado`

**Response `200`:**
```json
[
  {
    "reservaGuid": "uuid",
    "codigoReserva": "RES-XXXXXXXX",
    "nombreCliente": "Juan Pérez",
    "nombreSucursal": "Hotel Kairos Centro",
    "fechaInicio": "2026-07-10",
    "fechaFin": "2026-07-13",
    "estadoReserva": "CON",
    "montoTotal": 336.00
  }
]
```

### `PATCH /public/reservas/:reservaGuid/cancelar`
```json
{ "motivo": "string" }
```

### `GET /internal/reservas/by-codigo`

Query: `?codigoReserva=RES-XXXXXXXX`

**Response `200`:**
```json
{
  "reservaGuid": "uuid",
  "codigoReserva": "RES-XXXXXXXX",
  "nombreCliente": "Juan Pérez",
  "nombreSucursal": "Hotel Kairos Centro",
  "fechaInicio": "2026-07-10",
  "fechaFin": "2026-07-13",
  "estadoReserva": "CON",
  "montoTotal": 336.00
}
```

### Reservas internas (backoffice)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/reservas` | Query: `codigoReserva`, `estadoReserva`, `clienteGuid`, `sucursalGuid`, `pagina`, `limite` |
| `GET` | `/internal/reservas/:idOrGuid` | Detalle |
| `POST` | `/internal/reservas` | Crear reserva interna |
| `PATCH` | `/internal/reservas/:idOrGuid/confirmar` | — |
| `PATCH` | `/internal/reservas/:idOrGuid/cancelar` | Body: `{ "motivo": "string" }` |

**Shape `InternalReservaDto`:**
```json
{
  "idReserva": 1,
  "reservaGuid": "uuid",
  "codigoReserva": "RES-XXXXXXXX",
  "idCliente": 1,
  "clienteGuid": "uuid",
  "idSucursal": 1,
  "sucursalGuid": "uuid",
  "fechaReservaUtc": "2026-06-09T01:00:00Z",
  "fechaInicio": "2026-07-10",
  "fechaFin": "2026-07-13",
  "subtotalReserva": 300.00,
  "valorIva": 36.00,
  "totalReserva": 336.00,
  "descuentoAplicado": 0,
  "saldoPendiente": 336.00,
  "origenCanalReserva": "MARKETPLACE",
  "estadoReserva": "CON",
  "fechaConfirmacionUtc": "2026-06-09T02:00:00Z",
  "observaciones": null,
  "esWalkin": false
}
```

### `POST /internal/flujos/booking/reservas` — flujo integrado backoffice

**Request:**
```json
{
  "reserva": {
    "sucursalGuid": "uuid",
    "fechaInicio": "2026-07-10",
    "fechaFin": "2026-07-13",
    "observaciones": null,
    "esWalkin": false,
    "origenCanalReserva": "FRONT_DESK",
    "cliente": {
      "tipoIdentificacion": "CC",
      "numeroIdentificacion": "1234567890",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "correo": "juan@email.com",
      "telefono": "0991234567",
      "direccion": null
    },
    "habitaciones": [
      {
        "tipoHabitacionGuid": "uuid",
        "numHabitaciones": 1,
        "numAdultos": 2,
        "numNinos": 0
      }
    ]
  },
  "generarFacturaInicial": true,
  "pagoInicial": {
    "monto": 336.00,
    "metodoPago": "EFECTIVO",
    "esPagoElectronico": false,
    "proveedorPasarela": "",
    "transaccionExterna": "",
    "codigoAutorizacion": "",
    "referencia": "",
    "moneda": "USD",
    "tipoCambio": 1,
    "simularPago": true
  }
}
```

**Response `200`:** `{ "reserva": ReservaPublicDto, "factura": FacturaDTO | null, "pago": PagoDTO | null }`

### Check-in y Check-out

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/internal/flujos/operacion/check-in/:reservaGuid` | Registra el check-in |
| `PATCH` | `/internal/flujos/operacion/check-out/:reservaGuid` | Registra el check-out |

**Request check-out:**
```json
{ "observaciones": null, "requiereMantenimiento": false, "generarFacturaFinal": true }
```

**Response check-in:** `{ "reservaGuid": "uuid", "estadias": [ EstadiaDTO ] }`  
**Response check-out:** `{ "estadia": EstadiaDTO, "factura": FacturaDTO | null }`

### Estados de reserva

| Código | Significado | Acción disponible |
|--------|-------------|-------------------|
| `PEN` | Pendiente | — |
| `CON` | Confirmada | Check-in habilitado |
| `CHI` | Check-in realizado | Check-out habilitado |
| `CHO` | Check-out realizado | — |
| `CAN` | Cancelada | — |

### Clientes — público

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/public/clientes/by-email` | Query: `correo=email@...` |
| `GET` | `/public/clientes/:clienteGuid` | Detalle |
| `POST` | `/public/clientes` | Crear cliente |

---

## 4. Microservicio de Hospedaje

### Estadías

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/estadias` | Query: `estado`, `pagina`, `limite` |
| `GET` | `/internal/estadias/:idOrGuid` | Detalle |

**Shape `EstadiaDTO`:**
```json
{
  "idEstadia": 1,
  "estadiaGuid": "uuid",
  "idReservaHabitacion": 1,
  "idCliente": 1,
  "idHabitacion": 1,
  "checkinUtc": "2026-07-10T15:00:00Z",
  "checkoutUtc": null,
  "estadoEstadia": "ACTIVA",
  "observacionesCheckin": "",
  "observacionesCheckout": "",
  "requiereMantenimiento": false,
  "cargos": []
}
```

### Cargos de estadía

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/estadias/:idOrGuid/cargos` | Lista cargos |
| `POST` | `/internal/estadias/:idOrGuid/cargos` | Agregar cargo |

**Request agregar cargo:**
```json
{ "descripcion": "Minibar", "monto": 15.00, "categoria": "CONSUMO" }
```

---

## 5. Microservicio de Facturación

### Facturas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/facturas` | Query: `estado`, `pagina`, `limite` |
| `GET` | `/internal/facturas/:idOrGuid` | Detalle |
| `POST` | `/internal/facturas/generar-reserva/:idReserva` | Genera factura inicial |
| `POST` | `/internal/facturas/generar-final/:idEstadia` | Genera factura final |
| `PATCH` | `/internal/facturas/:idOrGuid/anular` | Body: `{ "motivo": "string" }` |

**Shape `FacturaDTO`:**
```json
{
  "idFactura": 1,
  "guidFactura": "uuid",
  "idCliente": 1,
  "idReserva": 1,
  "idSucursal": 1,
  "numeroFactura": "FAC-000001",
  "tipoFactura": "INICIAL",
  "fechaEmision": "2026-07-10T15:00:00Z",
  "subtotal": 300.00,
  "valorIva": 36.00,
  "descuentoTotal": 0,
  "total": 336.00,
  "saldoPendiente": 0,
  "moneda": "USD",
  "estado": "EMITIDA",
  "detalles": [
    {
      "idDetalle": 1,
      "descripcion": "Suite Ejecutiva x 3 noches",
      "cantidad": 3,
      "precioUnitario": 100.00,
      "subtotal": 300.00
    }
  ]
}
```

### Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/pagos` | Query: `pagina`, `limite`, `facturaGuid` |
| `GET` | `/internal/pagos/:idOrGuid` | Detalle |
| `GET` | `/internal/pagos/factura/:facturaId` | Pagos por factura |
| `POST` | `/internal/pagos` | Registrar pago |
| `PATCH` | `/internal/pagos/:idOrGuid/estado` | Body: `{ "nuevoEstado": "string" }` |
| `POST` | `/public/pagos/simular` | Simular pago (sin auth) |

**Request crear pago:**
```json
{
  "idFactura": 1,
  "idReserva": 1,
  "monto": 336.00,
  "metodoPago": "EFECTIVO",
  "esPagoElectronico": false,
  "proveedorPasarela": "",
  "transaccionExterna": "",
  "codigoAutorizacion": "",
  "referencia": "",
  "moneda": "USD",
  "tipoCambio": 1
}
```

---

## 6. Bus de Eventos RabbitMQ (backend-to-backend)

> Esta sección es contexto arquitectónico. El frontend NO interactúa directamente con RabbitMQ.

### Qué hace el bus de eventos

Permite que una plataforma de Booking externa envíe reservas de forma asíncrona al sistema. El flujo es invisible para el frontend — la reserva simplemente aparece en la BD con `origenCanalReserva = "BOOKING"` y `estadoReserva = "PEN"`.

### Eventos del bus

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `BookingReservaSolicitada` | Booking → Reservas | Plataforma externa solicita una reserva |
| `DisponibilidadConfirmada` | Reservas → Booking | Reserva creada exitosamente |
| `DisponibilidadRechazada` | Reservas → Booking | No hay disponibilidad |
| `PagoBookingConfirmado` | Booking → Reservas + Facturación | Pago externo procesado |
| `ReservaCancelada` | Reservas → Booking | Reserva cancelada |
| `HabitacionesActualizadas` | Alojamiento → Booking | Inventario de habitaciones sincronizado |

### Colas activas en RabbitMQ

| Cola | Consumidor |
|------|-----------|
| `q.reservas.booking-reserva-solicitada` | Microservicio.Reservas |
| `q.reservas.pago-booking-confirmado` | Microservicio.Reservas |
| `q.facturacion.pago-booking-confirmado` | Microservicio.Facturación |

### Impacto en el frontend

- Las reservas con `origenCanalReserva = "BOOKING"` son válidas y aparecen en `/internal/reservas` y en `/public/reservas` del cliente.
- El estado inicial siempre es `"PEN"` — pueden confirmarse automáticamente si llega el evento `PagoBookingConfirmado`.
- El frontend debe mostrar correctamente el valor `"BOOKING"` en el campo `origenCanalReserva`.

---

## 7. Comportamientos de autenticación

| Situación | Backend | Frontend |
|-----------|---------|----------|
| Token válido | `200` | Muestra datos normalmente |
| Token expirado | `401` | Intenta refresh automático |
| Refresh válido | `200` con nuevos tokens | Reintenta la petición original |
| Refresh inválido/expirado | `401` | Redirige a `/login` |
| Sin token en ruta protegida | `401` | Redirige a `/login` |
| Sin `idCliente` en `/public/reservas` | `401` | Muestra error del backend |
| Rol insuficiente | `403` | Muestra error |

---

## 8. Rutas del frontend por rol

| Ruta | Rol requerido | API principal |
|------|---------------|---------------|
| `/(public)/` | Sin auth | `/accommodations/search` |
| `/(public)/alojamiento/:sucursalGuid` | Sin auth | `/accommodations/:guid` |
| `/(public)/booking` | Sin auth | `POST /accommodations/reservas` |
| `/(auth)/login` | Sin auth | `POST /auth/login` |
| `/(auth)/register` | Sin auth | `POST /auth/register-cliente` |
| `/(cliente)/reservas` | HUESPED (con `idCliente`) | `GET /public/reservas` |
| `/(cliente)/reservas/:guid` | HUESPED | `GET /accommodations/reservas/:guid` |
| `/(backoffice)/` | ADMINISTRADOR / RECEPCIONISTA | — |
| `/(backoffice)/checkin` | ADMINISTRADOR / RECEPCIONISTA | `/internal/reservas/by-codigo`, flujos check-in/out |
| `/(backoffice)/reservas` | ADMINISTRADOR / RECEPCIONISTA | `GET /internal/reservas` |
| `/(backoffice)/estadias` | ADMINISTRADOR / RECEPCIONISTA | `GET /internal/estadias` |
| `/(backoffice)/facturas` | ADMINISTRADOR | `GET /internal/facturas` |
| `/(backoffice)/pagos` | ADMINISTRADOR | `GET /internal/pagos` |
| `/(backoffice)/alojamiento/sucursales` | ADMINISTRADOR | `/internal/sucursales` |
| `/(backoffice)/alojamiento/habitaciones` | ADMINISTRADOR | `/internal/habitaciones` |
| `/(backoffice)/alojamiento/tipos` | ADMINISTRADOR | `/internal/tipos-habitacion` |
| `/(backoffice)/seguridad/usuarios` | ADMINISTRADOR | `/internal/usuarios` |
| `/(backoffice)/seguridad/roles` | ADMINISTRADOR | `/internal/roles`, `/internal/permisos` |

---

## 9. Checklist de verificación backend

- [ ] `POST /auth/login` devuelve `idCliente` en JWT para usuarios HUESPED
- [ ] `GET /public/reservas` lee `idCliente` del JWT y filtra reservas del cliente
- [ ] `GET /accommodations/search` responde con `{ items, totalCount }` sin envelope adicional
- [ ] `GET /accommodations/:sucursalGuid` incluye `tiposHabitacion[].disponiblesEnRango` cuando se pasan fechas
- [ ] `GET /internal/reservas/by-codigo` acepta `?codigoReserva=RES-XXX`
- [ ] Estados de reserva usan exactamente: `PEN`, `CON`, `CHI`, `CHO`, `CAN`
- [ ] El flujo `/internal/flujos/booking/reservas` retorna `{ reserva, factura, pago }`
- [ ] Check-in retorna `{ reservaGuid, estadias }`
- [ ] Check-out retorna `{ estadia, factura }`
- [ ] `POST /auth/refresh` retorna `{ data: { token, refreshToken } }`
- [ ] CORS configurado para `https://repo-hotel-jd.vercel.app`
- [ ] Reservas con `origenCanalReserva = "BOOKING"` visibles en `/internal/reservas`
- [ ] RabbitMQ corriendo en Docker con las 3 colas activas antes de arrancar los servicios

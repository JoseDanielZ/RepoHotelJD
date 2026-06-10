# Contrato Frontend → Backend — Hotel Kairos

> **Propósito:** Este documento detalla exactamente qué necesita el frontend de cada microservicio para funcionar correctamente. Cada sección especifica rutas, métodos, shapes de request/response, claims JWT requeridos y comportamientos esperados. **Cualquier desviación rompe el frontend.**

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
  "data": <payload>,
  "errors": null
}
```

**Errores** deben responder con:

```json
{
  "success": false,
  "message": "Descripción legible del error",
  "statusCode": 400,
  "errors": {
    "campo": ["mensaje de validación"]
  },
  "traceId": "0HNM...",
  "timestamp": "2026-06-09T01:17:59Z"
}
```

> El frontend extrae `data.message` primero, luego aplana `data.errors` si `message` está vacío.

---

## Paginación

Cuando un endpoint retorna listas paginadas, el shape esperado es:

```json
{
  "items": [],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 20
}
```

Query params de paginación aceptados: `page` / `pageSize` **ó** `pagina` / `limite`.

---

## 1. Microservicio de Seguridad

**Base:** `EXPO_PUBLIC_API_BASE/api/v1`

### 1.1 JWT — Claims requeridos

El token JWT emitido por este microservicio **debe incluir** los siguientes claims para que el frontend funcione:

| Claim | Tipo | Descripción |
|-------|------|-------------|
| `nameidentifier` | `string` | ID numérico del usuario |
| `unique_name` | `string` | Username |
| `email` | `string` | Correo del usuario |
| `usuarioGuid` | `string` (UUID) | GUID del usuario |
| `nombres` | `string` | Nombres del usuario |
| `apellidos` | `string` | Apellidos del usuario |
| `role` | `string` o `string[]` | Rol(es) asignados |
| **`idCliente`** | `string` o `number` | **REQUERIDO para usuarios HUESPED/cliente.** ID del cliente asociado en el microservicio de Reservas. Sin este claim, el endpoint `/public/reservas` devuelve 401. |

> **Crítico:** Los usuarios con rol `HUESPED` deben tener `id_cliente` enlazado en `USUARIO_APP`. El security microservice debe incluir `idCliente` en el JWT al hacer login. Los usuarios `ADMINISTRADOR` / `RECEPCIONISTA` no necesitan este claim.

### 1.2 `POST /auth/login`

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response `200`** — envelope con `data`:
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

### 1.3 `POST /auth/register-cliente`

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

**Response `200`** — mismo shape que login (incluyendo `idCliente` en el JWT si el usuario es HUESPED).

### 1.4 `POST /auth/logout`

**Request:**
```json
{ "refreshToken": "string" }
```

**Response:** `200` con cualquier body (el frontend ignora el body).

### 1.5 `POST /auth/refresh`

**Request:**
```json
{ "refreshToken": "string" }
```

**Response `200`** — envelope con `data`:
```json
{ "token": "eyJ...", "refreshToken": "string" }
```

> Si el refresh token expiró o es inválido → `401`. El frontend redirige a login automáticamente.

### 1.6 `POST /auth/cambiar-password`

**Request:**
```json
{ "passwordActual": "string", "passwordNuevo": "string" }
```

---

### 1.7 Usuarios — rutas internas (rol ADMINISTRADOR)

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
  "roles": [ { "idRol": 1, "rolGuid": "uuid", "nombreRol": "ADMINISTRADOR", "descripcionRol": "string", "estadoRol": "ACT" } ]
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

---

### 1.8 Roles y Permisos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/roles` | Lista roles. Query: `estado` |
| `GET` | `/internal/roles/:idOrGuid` | Detalle |
| `POST` | `/internal/roles` | Crear rol. Body: `{ "nombreRol": "string", "descripcionRol": "string" }` |
| `PUT` | `/internal/roles/:idOrGuid` | Actualizar |
| `DELETE` | `/internal/roles/:id` | Eliminar |
| `POST` | `/internal/roles/:rolGuid/permisos` | Asignar permisos. Body: `{ "permisos": ["string"] }` |
| `GET` | `/internal/permisos` | Lista todos los permisos disponibles |
| `GET` | `/internal/auditoria` | Query: `tabla` (opcional) |

**Shape `RolDTO`:**
```json
{
  "idRol": 1,
  "rolGuid": "uuid",
  "nombreRol": "ADMINISTRADOR",
  "descripcionRol": "string",
  "estadoRol": "ACT",
  "permisos": []
}
```

**Shape `PermisoDTO`:**
```json
{ "idPermiso": 1, "nombrePermiso": "string", "descripcionPermiso": "string" }
```

---

## 2. Microservicio de Alojamiento

**Prefijo público:** `/accommodations` y `/public`  
**Prefijo interno:** `/internal`

### 2.1 Búsqueda pública de alojamientos

`GET /accommodations/search`

**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `Destino` | string | Ciudad o nombre |
| `fechaInicio` | string (ISO date) | Check-in |
| `fechaFin` | string (ISO date) | Check-out |
| `NumAdultos` | number | |
| `NumNinos` | number | |
| `NumHabitaciones` | number | |
| `TipoAlojamiento` | string | |
| `PrecioMin` | number | |
| `PrecioMax` | number | |
| `OrdenarPor` | string | |
| `Pagina` | number | |
| `Limite` | number | |

**Response `200`:**
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

> **Nota:** No está envuelto en el envelope estándar — el frontend accede directamente a `{ items, totalCount }`.

---

### 2.2 Detalle de alojamiento

`GET /accommodations/:sucursalGuid`

**Query params opcionales:** `fechaInicio`, `fechaFin` (para calcular disponibilidad).

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

---

### 2.3 Habitaciones y Tipos — público

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

---

### 2.4 Sucursales — interno

| Método | Ruta | Body / Params |
|--------|------|---------------|
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

**`SucursalUpsertRequest`:**
```json
{
  "nombreSucursal": "string",
  "descripcion": "string",
  "destino": "string",
  "tipoAlojamiento": "string",
  "direccion": "string",
  "telefono": "string",
  "correo": "string",
  "estado": "ACT"
}
```

---

### 2.5 Habitaciones — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/habitaciones` | Query: `sucursalGuid`, `estado` |
| `POST` | `/internal/habitaciones` | Crear |
| `PUT` | `/internal/habitaciones/:idOrGuid` | Actualizar |
| `PATCH` | `/internal/habitaciones/:id/estado` | Body: `{ "nuevoEstado": "string" }` |
| `DELETE` | `/internal/habitaciones/:id` | — |

**Shape `HabitacionDto`:**
```json
{
  "idHabitacion": 1,
  "habitacionGuid": "uuid",
  "numeroHabitacion": "101",
  "piso": 1,
  "capacidadHabitacion": 2,
  "precioBase": 90.00,
  "descripcionHabitacion": "string",
  "estadoHabitacion": "DISPONIBLE",
  "idTipoHabitacion": 1,
  "idSucursal": 1
}
```

---

### 2.6 Tipos de habitación — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/tipos-habitacion` | Query: `sucursalGuid`, `estado` |
| `POST` | `/internal/tipos-habitacion` | Crear |
| `PUT` | `/internal/tipos-habitacion/:idOrGuid` | Actualizar |
| `DELETE` | `/internal/tipos-habitacion/:id` | — |

**Shape `TipoHabitacionDto`:**
```json
{
  "idTipoHabitacion": 1,
  "tipoHabitacionGuid": "uuid",
  "nombreTipoHabitacion": "Suite Ejecutiva",
  "descripcion": "string",
  "capacidadAdultos": 2,
  "capacidadNinos": 1,
  "capacidadTotal": 3,
  "permitReservaPublica": true,
  "estadoTipoHabitacion": "ACT"
}
```

---

## 3. Microservicio de Reservas

### 3.1 Crear reserva pública (sin auth)

`POST /accommodations/reservas`

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

**Response `201`** — envelope con `data` de tipo `ReservaPublicDto`:
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

---

### 3.2 Mis reservas (cliente autenticado)

`GET /public/reservas`

> **Requiere claim `idCliente` en el JWT.** El middleware extrae el `idCliente` del token para filtrar las reservas del cliente autenticado.

**Query params opcionales:** `page`, `limit`, `estado`

**Response `200`** — el frontend acepta `data` como array directo **o** `{ data: [], items: [] }`:
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

---

### 3.3 Cancelar reserva (cliente)

`PATCH /public/reservas/:reservaGuid/cancelar`

**Request:**
```json
{ "motivo": "string" }
```

---

### 3.4 Buscar por código (backoffice — check-in)

`GET /internal/reservas/by-codigo`

**Query:** `codigoReserva=RES-XXXXXXXX`

**Response `200`** — envelope con `data` de tipo `ReservaSummaryDTO`:
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

---

### 3.5 Reservas internas (backoffice)

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

---

### 3.6 Clientes — público

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/public/clientes/by-email` | Query: `correo=email@...` |
| `GET` | `/public/clientes/:clienteGuid` | Detalle por GUID |
| `POST` | `/public/clientes` | Crear cliente |

**Shape `ClientePublicDto`:**
```json
{
  "clienteGuid": "uuid",
  "tipoIdentificacion": "CC",
  "numeroIdentificacion": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "correo": "juan@email.com",
  "telefono": "0991234567",
  "direccion": null,
  "estado": "ACT"
}
```

---

### 3.7 Clientes — interno

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/clientes` | Query: `page`, `pageSize` |
| `GET` | `/internal/clientes/:id` | Detalle por ID |

---

### 3.8 Flujo de booking integrado

`POST /internal/flujos/booking/reservas`

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

**Response `200`:**
```json
{
  "reserva": { /* ReservaPublicDto */ },
  "factura": { /* FacturaDTO | null */ },
  "pago": { /* PagoDTO | null */ }
}
```

---

### 3.9 Check-in y Check-out (flujo integrado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/internal/flujos/operacion/check-in/:reservaGuid` | Registra el check-in |
| `PATCH` | `/internal/flujos/operacion/check-out/:reservaGuid` | Registra el check-out |

**Request check-out:**
```json
{
  "observaciones": null,
  "requiereMantenimiento": false,
  "generarFacturaFinal": true
}
```

**Response check-in** — `IntegratedCheckInResultDTO`:
```json
{
  "reservaGuid": "uuid",
  "estadias": [ /* EstadiaDTO[] */ ]
}
```

**Response check-out** — `IntegratedCheckOutResultDTO`:
```json
{
  "estadia": { /* EstadiaDTO */ },
  "factura": { /* FacturaDTO | null */ }
}
```

---

### 3.10 Estados de reserva usados por el frontend

| Código | Significado | Acción disponible |
|--------|-------------|-------------------|
| `PEN` | Pendiente | — |
| `CON` | Confirmada | Check-in habilitado |
| `CHI` | Check-in realizado | Check-out habilitado |
| `CHO` | Check-out realizado | — |
| `CAN` | Cancelada | — |

---

## 4. Microservicio de Hospedaje

### 4.1 Estadías

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

---

### 4.2 Cargos de estadía

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/estadias/:idOrGuid/cargos` | Lista cargos |
| `POST` | `/internal/estadias/:idOrGuid/cargos` | Agregar cargo |

**Request agregar cargo:**
```json
{
  "descripcion": "Minibar",
  "monto": 15.00,
  "categoria": "CONSUMO"
}
```

**Shape `CargoEstadiaDTO`:**
```json
{
  "idCargo": 1,
  "idEstadia": 1,
  "descripcion": "Minibar",
  "monto": 15.00,
  "categoria": "CONSUMO",
  "fechaRegistroUtc": "2026-07-11T20:00:00Z"
}
```

---

## 5. Microservicio de Facturación

### 5.1 Facturas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/facturas` | Query: `estado`, `pagina`, `limite` (o `page`, `pageSize`) |
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

---

### 5.2 Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/pagos` | Query: `pagina`, `limite`, `facturaGuid` (o `page`, `pageSize`) |
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

**Shape `PagoDTO`:**
```json
{
  "idPago": 1,
  "pagoGuid": "uuid",
  "idFactura": 1,
  "idReserva": 1,
  "monto": 336.00,
  "metodoPago": "EFECTIVO",
  "esPagoElectronico": false,
  "proveedorPasarela": "",
  "transaccionExterna": "",
  "codigoAutorizacion": "",
  "referencia": "",
  "estadoPago": "APROBADO",
  "fechaPagoUtc": "2026-07-10T15:05:00Z",
  "moneda": "USD",
  "tipoCambio": 1
}
```

---

## 6. Comportamientos de autenticación esperados

| Situación | Comportamiento del backend | Comportamiento del frontend |
|-----------|--------------------------|----------------------------|
| Token válido | `200` con datos | Muestra datos normalmente |
| Token expirado | `401` | Intenta refresh automático |
| Refresh token válido | `200` con nuevos tokens | Reintenta la petición original |
| Refresh token inválido/expirado | `401` | Redirige a `/login` |
| Sin token en ruta protegida | `401` | Redirige a `/login` |
| Token sin `idCliente` en ruta `/public/reservas` | `401` | Muestra el mensaje de error del backend |
| Rol insuficiente | `403` | Muestra error |

---

## 7. Rutas del frontend por rol

| Ruta web | Rol requerido | API principal que consume |
|----------|---------------|--------------------------|
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

## 8. Checklist de verificación para el backend

- [ ] El endpoint `POST /auth/login` devuelve `idCliente` en el JWT para usuarios con rol `HUESPED`
- [ ] La tabla `USUARIO_APP` enlaza correctamente `id_cliente` al registrar un cliente via `/auth/register-cliente`
- [ ] `GET /public/reservas` lee `idCliente` del JWT y filtra las reservas de ese cliente
- [ ] `GET /accommodations/search` responde con `{ items, totalCount }` (sin envelope adicional)
- [ ] `GET /accommodations/:sucursalGuid` incluye `tiposHabitacion[].disponiblesEnRango` cuando se pasan fechas
- [ ] `GET /internal/reservas/by-codigo` acepta `?codigoReserva=RES-XXX` y retorna los campos de `ReservaSummaryDTO`
- [ ] Los estados de reserva usan exactamente los códigos: `PEN`, `CON`, `CHI`, `CHO`, `CAN`
- [ ] El flujo `/internal/flujos/booking/reservas` retorna `{ reserva, factura, pago }`
- [ ] El flujo check-in `POST /internal/flujos/operacion/check-in/:reservaGuid` retorna `{ reservaGuid, estadias }`
- [ ] El flujo check-out `PATCH /internal/flujos/operacion/check-out/:reservaGuid` retorna `{ estadia, factura }`
- [ ] `POST /auth/refresh` retorna `{ data: { token, refreshToken } }`
- [ ] Todos los endpoints de `/internal/*` requieren token JWT con rol apropiado y retornan `403` si el rol no alcanza
- [ ] CORS configurado para aceptar el origen del frontend en producción (`https://repo-hotel-jd.vercel.app`)

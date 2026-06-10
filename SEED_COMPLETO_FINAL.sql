-- ============================================================
-- SEED MAESTRO UNIFICADO - SISTEMA HOTELERO MICROSERVICIOS
-- Version: FINAL v3 - Coherencia total verificada
-- Fecha: 2026-05-19
--
-- ERRORES CORREGIDOS vs version anterior:
--   VALORACIONES: referenciaban estadias ACT (sin checkout).
--   Solo se puede valorar una estadia FIN (con checkout).
--   Correccion aplicada:
--     V1 Ana/Quito     -> E3(AD000003) FIN  OK
--     V2 Valeria/Cuenca-> E4(AD000004) FIN  OK
--     V3 Sofia/Otavalo -> E6(AD000006) FIN  OK
--     V4 Maria/GYE     -> E3(AD000003) FIN  (ref logica hotel distinto)
--     V5 Carlos/Banos  -> E8(AD000008) FIN  (ref logica hotel distinto)
--     V6 Roberto/Manta -> E4(AD000004) FIN  (ref logica hotel distinto)
--
-- VERIFICACION DE COHERENCIA (TODAS OK):
--   Clientes Seguridad    -> Reservas     FF000001-FF000008  OK
--   Habitaciones Hospedaje-> Alojamiento  CC000002,3,6,8,9,11,15,17 OK
--   Catalogos Hospedaje   -> Alojamiento  DD000001-3,7-9,13-15 OK
--   Reservas Facturacion  -> Reservas     AB000001-AB000009 OK
--   Estadias Valoraciones -> Hospedaje    solo estadias FIN OK
--
-- ORDEN DE EJECUCION INTERNO:
--   [1] alojamientojd
--   [2] MicroservicioReservas
--   [3] MicroservicioHospedaje
--   [4] MicroservicioFacturacion
--   [5] microservicioSeguridad
-- ============================================================


-- ============================================================
-- [1] BASE: alojamientojd
-- ============================================================

USE alojamientojd;
GO

DELETE FROM alojamiento.TIPO_HABITACION_CATALOGO;
DELETE FROM alojamiento.VALORACIONES;
DELETE FROM alojamiento.TARIFA;
DELETE FROM alojamiento.CATALOGO_SERVICIOS;
DELETE FROM alojamiento.HABITACION;
DELETE FROM alojamiento.TIPO_HABITACION_IMAGEN;
DELETE FROM alojamiento.TIPO_HABITACION;
DELETE FROM alojamiento.SUCURSAL_IMAGEN;
DELETE FROM alojamiento.SUCURSAL;
GO

DBCC CHECKIDENT ('alojamiento.VALORACIONES',           RESEED, 0);
DBCC CHECKIDENT ('alojamiento.TARIFA',                 RESEED, 0);
DBCC CHECKIDENT ('alojamiento.CATALOGO_SERVICIOS',     RESEED, 0);
DBCC CHECKIDENT ('alojamiento.HABITACION',             RESEED, 0);
DBCC CHECKIDENT ('alojamiento.TIPO_HABITACION_IMAGEN', RESEED, 0);
DBCC CHECKIDENT ('alojamiento.TIPO_HABITACION',        RESEED, 0);
DBCC CHECKIDENT ('alojamiento.SUCURSAL_IMAGEN',        RESEED, 0);
DBCC CHECKIDENT ('alojamiento.SUCURSAL',               RESEED, 0);
GO

SET IDENTITY_INSERT alojamiento.SUCURSAL ON;
INSERT INTO alojamiento.SUCURSAL (
    id_sucursal, sucursal_guid, codigo_sucursal, nombre_sucursal,
    descripcion_sucursal, descripcion_corta,
    tipo_alojamiento, estrellas, categoria_viaje,
    pais, provincia, ciudad, ubicacion, direccion,
    codigo_postal, telefono, correo,
    latitud, longitud, hora_checkin, hora_checkout,
    checkin_anticipado, checkout_tardio,
    acepta_ninos, edad_minima_huesped, permite_mascotas, se_permite_fumar,
    estado_sucursal, es_eliminado, creado_por_usuario
) VALUES
(1,'AA000001-0000-0000-0000-000000000001','SUC-QUI-001','Hotel Quito Centro',
 'Hotel de lujo ubicado en el corazon historico de Quito con vista al Pichincha.',
 'Hotel 5 estrellas en el centro historico de Quito',
 'hotel',5,'cultural','Ecuador','Pichincha','Quito',
 'Centro Historico, frente a la Plaza Grande','Av. Venezuela N1-12 y Sucre',
 '170401','022561234','reservas@hotelquitocentro.com',
 -0.2201600,-78.5123500,'14:00','12:00',1,0,1,NULL,0,0,'ACT',0,'administrativoJD'),
(2,'AA000002-0000-0000-0000-000000000002','SUC-GYE-001','Hotel Guayaquil Plaza',
 'Hotel moderno frente al Malecon 2000 con vista al Rio Guayas y acceso directo al centro financiero.',
 'Hotel 4 estrellas frente al Malecon de Guayaquil',
 'hotel',4,'ciudad','Ecuador','Guayas','Guayaquil',
 'Malecon 2000, zona financiera','Av. Malecon Simon Bolivar 100 y Pichincha',
 '090101','042345678','reservas@hotelguayaquilplaza.com',
 -2.1894200,-79.8890800,'15:00','12:00',1,0,0,NULL,0,0,'ACT',0,'administrativoJD'),
(3,'AA000003-0000-0000-0000-000000000003','SUC-CUE-001','Hotel Cuenca Colonial',
 'Encantador hotel boutique instalado en una casona republicana del siglo XIX en el centro historico de Cuenca.',
 'Boutique hotel 4 estrellas en casona colonial de Cuenca',
 'hotel',4,'cultural','Ecuador','Azuay','Cuenca',
 'Centro historico, Patrimonio de la Humanidad','Calle Gran Colombia 9-52 y Padre Aguirre',
 '010101','072987654','reservas@hotelcuencacolonial.com',
 -2.9001200,-79.0058900,'14:00','11:00',1,0,0,NULL,0,0,'ACT',0,'administrativoJD'),
(4,'AA000004-0000-0000-0000-000000000004','SUC-BAN-001','Resort Banos Volcan',
 'Resort de aventura y relajacion a los pies del volcan Tungurahua, con aguas termales naturales y spa.',
 'Resort 4 estrellas con termas naturales en Banos',
 'resort',4,'aventura','Ecuador','Tungurahua','Banos de Agua Santa',
 'Zona termal, acceso al Tungurahua','Via a Puyo Km 2, sector Las Penas',
 '180201','032741234','reservas@resortbanosvolcan.com',
 -1.3928400,-78.4267100,'15:00','12:00',1,0,1,NULL,0,0,'ACT',0,'administrativoJD'),
(5,'AA000005-0000-0000-0000-000000000005','SUC-OTA-001','Hotel Otavalo Lago',
 'Hotel con vista privilegiada a la laguna de San Pablo y acceso a mercados indigenas y artesanias.',
 'Hotel 3 estrellas con vista a la laguna en Otavalo',
 'hotel',3,'cultural','Ecuador','Imbabura','Otavalo',
 'Orillas de la laguna de San Pablo','Via Otavalo - Lago San Pablo Km 1',
 '100501','062920987','reservas@hotelostavalo.com',
 0.2541500,-78.2606300,'13:00','11:00',1,5,1,NULL,0,0,'ACT',0,'administrativoJD'),
(6,'AA000006-0000-0000-0000-000000000006','SUC-MAN-001','Hostal Manta Playa',
 'Hostal frente al mar en la playa de Tarqui, ideal para surfistas y amantes del sol con ambiente relajado.',
 'Hostal 3 estrellas frente al mar en Manta',
 'hostal',3,'playa','Ecuador','Manabi','Manta',
 'Playa de Tarqui, zona costera','Av. Flavio Reyes y Calle 20, Tarqui',
 '130601','052621234','reservas@hostalmantaplaya.com',
 -0.9481700,-80.7137400,'14:00','11:00',1,0,0,NULL,0,1,'ACT',0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.SUCURSAL OFF;
GO

SET IDENTITY_INSERT alojamiento.SUCURSAL_IMAGEN ON;
INSERT INTO alojamiento.SUCURSAL_IMAGEN (
    id_sucursal_imagen, id_sucursal, url_imagen, descripcion_imagen,
    tipo_imagen, orden_visualizacion, es_principal, creado_por_usuario
) VALUES
(1, 1,'https://images.hotel/quito-centro/fachada.jpg',    'Fachada colonial Hotel Quito Centro',          'exterior',1,1,'administrativoJD'),
(2, 1,'https://images.hotel/quito-centro/lobby.jpg',      'Lobby principal con arte ecuatoriano',          'interior',2,0,'administrativoJD'),
(3, 2,'https://images.hotel/guayaquil-plaza/fachada.jpg', 'Fachada moderna frente al Malecon',             'exterior',1,1,'administrativoJD'),
(4, 2,'https://images.hotel/guayaquil-plaza/piscina.jpg', 'Piscina rooftop con vista al rio Guayas',       'amenidad',2,0,'administrativoJD'),
(5, 3,'https://images.hotel/cuenca-colonial/patio.jpg',   'Patio interior de la casona republicana',       'interior',1,1,'administrativoJD'),
(6, 3,'https://images.hotel/cuenca-colonial/fachada.jpg', 'Fachada colonial en el centro historico',       'exterior',2,0,'administrativoJD'),
(7, 4,'https://images.hotel/banos-volcan/termas.jpg',     'Piscinas termales con vista al Tungurahua',     'amenidad',1,1,'administrativoJD'),
(8, 4,'https://images.hotel/banos-volcan/cabanas.jpg',    'Cabanas de madera en el bosque',                'exterior',2,0,'administrativoJD'),
(9, 5,'https://images.hotel/otavalo-lago/lago.jpg',       'Vista a la laguna de San Pablo desde el hotel', 'exterior',1,1,'administrativoJD'),
(10,5,'https://images.hotel/otavalo-lago/mercado.jpg',    'Acceso al mercado artesanal de Otavalo',        'entorno', 2,0,'administrativoJD'),
(11,6,'https://images.hotel/manta-playa/playa.jpg',       'Vista frontal a la playa de Tarqui',            'exterior',1,1,'administrativoJD'),
(12,6,'https://images.hotel/manta-playa/terraza.jpg',     'Terraza con hamacas frente al mar',             'amenidad',2,0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.SUCURSAL_IMAGEN OFF;
GO

SET IDENTITY_INSERT alojamiento.TIPO_HABITACION ON;
INSERT INTO alojamiento.TIPO_HABITACION (
    id_tipo_habitacion, tipo_habitacion_guid, codigo_tipo_habitacion,
    nombre_tipo_habitacion, descripcion,
    capacidad_adultos, capacidad_ninos, capacidad_total,
    tipo_cama, area_m2, permite_eventos, permite_reserva_publica,
    estado_tipo_habitacion, es_eliminado, creado_por_usuario
) VALUES
(1,'BB000001-0000-0000-0000-000000000001','TH-SIMPLE',
 'Habitacion Simple','Habitacion individual con cama simple y bano privado.',
 1,0,1,'Simple',18.00,0,1,'ACT',0,'administrativoJD'),
(2,'BB000002-0000-0000-0000-000000000002','TH-DOBLE',
 'Habitacion Doble','Habitacion con cama matrimonial, bano privado y amplio espacio.',
 2,1,3,'Matrimonial',28.00,0,1,'ACT',0,'administrativoJD'),
(3,'BB000003-0000-0000-0000-000000000003','TH-SUITE',
 'Suite Presidencial','Suite de lujo con sala de estar, jacuzzi y vista panoramica.',
 2,2,4,'King',55.00,0,1,'ACT',0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.TIPO_HABITACION OFF;
GO

SET IDENTITY_INSERT alojamiento.TIPO_HABITACION_IMAGEN ON;
INSERT INTO alojamiento.TIPO_HABITACION_IMAGEN (
    id_tipo_habitacion_imagen, id_tipo_habitacion,
    url_imagen, descripcion_imagen,
    orden_visualizacion, es_principal, creado_por_usuario
) VALUES
(1,1,'https://images.hotel/tipos/simple.jpg','Habitacion simple estandar',  1,1,'administrativoJD'),
(2,2,'https://images.hotel/tipos/doble.jpg', 'Habitacion doble matrimonial',1,1,'administrativoJD'),
(3,3,'https://images.hotel/tipos/suite.jpg', 'Suite presidencial de lujo',  1,1,'administrativoJD');
SET IDENTITY_INSERT alojamiento.TIPO_HABITACION_IMAGEN OFF;
GO

SET IDENTITY_INSERT alojamiento.HABITACION ON;
INSERT INTO alojamiento.HABITACION (
    id_habitacion, habitacion_guid, id_sucursal, id_tipo_habitacion,
    numero_habitacion, piso, capacidad_habitacion, precio_base,
    descripcion_habitacion, estado_habitacion, es_eliminado, creado_por_usuario
) VALUES
(1, 'CC000001-0000-0000-0000-000000000001',1,1,'101',1,1, 75.00,'Habitacion simple tranquila con vista al patio interior.',   'DIS',0,'administrativoJD'),
(2, 'CC000002-0000-0000-0000-000000000002',1,2,'201',2,3,120.00,'Habitacion doble con vista al Pichincha.',                    'OCU',0,'administrativoJD'),
(3, 'CC000003-0000-0000-0000-000000000003',1,3,'301',3,4,280.00,'Suite presidencial con jacuzzi y vista panoramica.',          'DIS',0,'administrativoJD'),
(4, 'CC000004-0000-0000-0000-000000000004',2,1,'101',1,1, 85.00,'Habitacion simple con aire acondicionado y vista al patio.',  'DIS',0,'administrativoJD'),
(5, 'CC000005-0000-0000-0000-000000000005',2,2,'201',2,3,145.00,'Habitacion doble con vista al rio Guayas.',                   'DIS',0,'administrativoJD'),
(6, 'CC000006-0000-0000-0000-000000000006',2,3,'501',5,4,320.00,'Suite ejecutiva con salon privado y acceso al rooftop.',      'OCU',0,'administrativoJD'),
(7, 'CC000007-0000-0000-0000-000000000007',3,1,'101',1,1, 70.00,'Habitacion simple con decoracion colonial y patio interior.', 'DIS',0,'administrativoJD'),
(8, 'CC000008-0000-0000-0000-000000000008',3,2,'201',2,3,110.00,'Habitacion doble con balcon y vista a la catedral.',          'DIS',0,'administrativoJD'),
(9, 'CC000009-0000-0000-0000-000000000009',3,3,'301',3,4,250.00,'Suite con sala privada y bano con ducha de lluvia.',          'DIS',0,'administrativoJD'),
(10,'CC000010-0000-0000-0000-000000000010',4,1,'101',1,1, 90.00,'Cabana simple con vista al rio Pastaza.',                    'DIS',0,'administrativoJD'),
(11,'CC000011-0000-0000-0000-000000000011',4,2,'201',2,3,160.00,'Cabana doble con chimenea y acceso directo a termas.',       'OCU',0,'administrativoJD'),
(12,'CC000012-0000-0000-0000-000000000012',4,3,'301',3,4,350.00,'Suite volcanica con jacuzzi exterior y vista al Tungurahua.','DIS',0,'administrativoJD'),
(13,'CC000013-0000-0000-0000-000000000013',5,1,'101',1,1, 55.00,'Habitacion simple con artesanias locales y vista al lago.',  'DIS',0,'administrativoJD'),
(14,'CC000014-0000-0000-0000-000000000014',5,2,'201',2,3, 90.00,'Habitacion doble con terraza y vista a la laguna.',          'DIS',0,'administrativoJD'),
(15,'CC000015-0000-0000-0000-000000000015',5,3,'301',3,4,180.00,'Suite con sala de estar y panoramica 180 grados al lago.',   'DIS',0,'administrativoJD'),
(16,'CC000016-0000-0000-0000-000000000016',6,1,'101',1,1, 45.00,'Habitacion simple con ventilador y acceso a playa.',         'DIS',0,'administrativoJD'),
(17,'CC000017-0000-0000-0000-000000000017',6,2,'201',2,3, 75.00,'Habitacion doble con balcon y vista directa al mar.',        'OCU',0,'administrativoJD'),
(18,'CC000018-0000-0000-0000-000000000018',6,3,'301',3,4,150.00,'Suite playa con terraza privada y hamacas sobre el mar.',    'DIS',0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.HABITACION OFF;
GO

SET IDENTITY_INSERT alojamiento.CATALOGO_SERVICIOS ON;
INSERT INTO alojamiento.CATALOGO_SERVICIOS (
    id_catalogo, catalogo_guid, id_sucursal,
    codigo_catalogo, nombre_catalogo,
    tipo_catalogo, categoria_catalogo, descripcion_catalogo,
    precio_base, aplica_iva, disponible_24h,
    hora_inicio, hora_fin, icono_url,
    estado_catalogo, es_eliminado, creado_por_usuario
) VALUES
(1, 'DD000001-0000-0000-0000-000000000001',1,'QUI-RS',   'Room Service',      'SRV','Alimentacion',    'Servicio de comida 24h.',                  25.00,1,1,NULL,   NULL,   NULL,'ACT',0,'administrativoJD'),
(2, 'DD000002-0000-0000-0000-000000000002',1,'QUI-LAV',  'Lavanderia',        'SRV','Limpieza',        'Lavado y planchado de ropa.',              15.00,1,0,'08:00','20:00',NULL,'ACT',0,'administrativoJD'),
(3, 'DD000003-0000-0000-0000-000000000003',1,'QUI-PARK', 'Parqueadero',       'SRV','Transporte',      'Parqueadero cubierto 24h.',                 8.00,0,1,NULL,   NULL,   NULL,'ACT',0,'administrativoJD'),
(4, 'DD000004-0000-0000-0000-000000000004',2,'GYE-RS',   'Room Service',      'SRV','Alimentacion',    'Room service con menu internacional.',      30.00,1,1,NULL,   NULL,   NULL,'ACT',0,'administrativoJD'),
(5, 'DD000005-0000-0000-0000-000000000005',2,'GYE-SPA',  'Spa y Masajes',     'SRV','Bienestar',       'Masajes y tratamientos de spa.',            60.00,1,0,'09:00','21:00',NULL,'ACT',0,'administrativoJD'),
(6, 'DD000006-0000-0000-0000-000000000006',2,'GYE-ROOF', 'Acceso Rooftop',    'SRV','Entretenimiento', 'Acceso a piscina y bar rooftop.',           20.00,1,0,'10:00','23:00',NULL,'ACT',0,'administrativoJD'),
(7, 'DD000007-0000-0000-0000-000000000007',3,'CUE-DES',  'Desayuno Colonial', 'SRV','Alimentacion',    'Desayuno buffet con productos locales.',    18.00,1,0,'07:00','10:30',NULL,'ACT',0,'administrativoJD'),
(8, 'DD000008-0000-0000-0000-000000000008',3,'CUE-TOUR', 'Tour Ciudad',       'SRV','Turismo',         'Tour guiado por el centro historico.',      35.00,1,0,'09:00','17:00',NULL,'ACT',0,'administrativoJD'),
(9, 'DD000009-0000-0000-0000-000000000009',3,'CUE-LAV',  'Lavanderia',        'SRV','Limpieza',        'Servicio de lavanderia.',                  12.00,1,0,'08:00','18:00',NULL,'ACT',0,'administrativoJD'),
(10,'DD000010-0000-0000-0000-000000000010',4,'BAN-TERM', 'Acceso Termas',     'SRV','Bienestar',       'Acceso ilimitado a piscinas termales.',     25.00,1,1,NULL,   NULL,   NULL,'ACT',0,'administrativoJD'),
(11,'DD000011-0000-0000-0000-000000000011',4,'BAN-AVE',  'Aventura',          'SRV','Deportes',        'Canopy, rafting y ciclismo.',               45.00,1,0,'07:00','17:00',NULL,'ACT',0,'administrativoJD'),
(12,'DD000012-0000-0000-0000-000000000012',4,'BAN-RS',   'Room Service',      'SRV','Alimentacion',    'Room service con comida tipica de Banos.',  20.00,1,0,'07:00','22:00',NULL,'ACT',0,'administrativoJD'),
(13,'DD000013-0000-0000-0000-000000000013',5,'OTA-DES',  'Desayuno Andino',   'SRV','Alimentacion',    'Desayuno con productos organicos andinos.', 15.00,1,0,'07:00','10:00',NULL,'ACT',0,'administrativoJD'),
(14,'DD000014-0000-0000-0000-000000000014',5,'OTA-MERC', 'Tour Mercado',      'SRV','Turismo',         'Tour al mercado artesanal sabado.',          20.00,1,0,'08:00','14:00',NULL,'ACT',0,'administrativoJD'),
(15,'DD000015-0000-0000-0000-000000000015',5,'OTA-KAY',  'Kayak en Lago',     'SRV','Deportes',        'Alquiler de kayak en laguna San Pablo.',    18.00,1,0,'08:00','17:00',NULL,'ACT',0,'administrativoJD'),
(16,'DD000016-0000-0000-0000-000000000016',6,'MAN-SURF', 'Clases de Surf',    'SRV','Deportes',        'Clases de surf para principiantes.',        30.00,1,0,'07:00','12:00',NULL,'ACT',0,'administrativoJD'),
(17,'DD000017-0000-0000-0000-000000000017',6,'MAN-PESC', 'Tour de Pesca',     'SRV','Turismo',         'Pesca deportiva en el Pacifico.',           50.00,1,0,'05:00','12:00',NULL,'ACT',0,'administrativoJD'),
(18,'DD000018-0000-0000-0000-000000000018',6,'MAN-BAR',  'Bar de Playa',      'AME','Entretenimiento', 'Cocteles y snacks frente al mar.',           0.00,0,0,'11:00','23:00',NULL,'ACT',0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.CATALOGO_SERVICIOS OFF;
GO

SET IDENTITY_INSERT alojamiento.TARIFA ON;
INSERT INTO alojamiento.TARIFA (
    id_tarifa, tarifa_guid, codigo_tarifa, id_sucursal, id_tipo_habitacion,
    nombre_tarifa, canal_tarifa, fecha_inicio, fecha_fin,
    precio_por_noche, porcentaje_iva, min_noches, max_noches,
    permite_portal_publico, prioridad, estado_tarifa, es_eliminado, creado_por_usuario
) VALUES
(1, 'EE000001-0000-0000-0000-000000000001','TAR-QUI-SIMPLE-2025',1,1,'Tarifa Simple Quito 2025', 'TODOS','2025-01-01','2025-12-31', 75.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(2, 'EE000002-0000-0000-0000-000000000002','TAR-QUI-DOBLE-2025', 1,2,'Tarifa Doble Quito 2025',  'TODOS','2025-01-01','2025-12-31',120.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(3, 'EE000003-0000-0000-0000-000000000003','TAR-QUI-SUITE-2025', 1,3,'Tarifa Suite Quito 2025',  'TODOS','2025-01-01','2025-12-31',280.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD'),
(4, 'EE000004-0000-0000-0000-000000000004','TAR-GYE-SIMPLE-2025',2,1,'Tarifa Simple GYE 2025',  'TODOS','2025-01-01','2025-12-31', 85.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(5, 'EE000005-0000-0000-0000-000000000005','TAR-GYE-DOBLE-2025', 2,2,'Tarifa Doble GYE 2025',   'TODOS','2025-01-01','2025-12-31',145.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(6, 'EE000006-0000-0000-0000-000000000006','TAR-GYE-SUITE-2025', 2,3,'Tarifa Suite GYE 2025',   'TODOS','2025-01-01','2025-12-31',320.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD'),
(7, 'EE000007-0000-0000-0000-000000000007','TAR-CUE-SIMPLE-2025',3,1,'Tarifa Simple CUE 2025',  'TODOS','2025-01-01','2025-12-31', 70.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(8, 'EE000008-0000-0000-0000-000000000008','TAR-CUE-DOBLE-2025', 3,2,'Tarifa Doble CUE 2025',   'TODOS','2025-01-01','2025-12-31',110.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(9, 'EE000009-0000-0000-0000-000000000009','TAR-CUE-SUITE-2025', 3,3,'Tarifa Suite CUE 2025',   'TODOS','2025-01-01','2025-12-31',250.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD'),
(10,'EE000010-0000-0000-0000-000000000010','TAR-BAN-SIMPLE-2025',4,1,'Tarifa Simple BAN 2025',  'TODOS','2025-01-01','2025-12-31', 90.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(11,'EE000011-0000-0000-0000-000000000011','TAR-BAN-DOBLE-2025', 4,2,'Tarifa Doble BAN 2025',   'TODOS','2025-01-01','2025-12-31',160.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(12,'EE000012-0000-0000-0000-000000000012','TAR-BAN-SUITE-2025', 4,3,'Tarifa Suite BAN 2025',   'TODOS','2025-01-01','2025-12-31',350.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD'),
(13,'EE000013-0000-0000-0000-000000000013','TAR-OTA-SIMPLE-2025',5,1,'Tarifa Simple OTA 2025',  'TODOS','2025-01-01','2025-12-31', 55.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(14,'EE000014-0000-0000-0000-000000000014','TAR-OTA-DOBLE-2025', 5,2,'Tarifa Doble OTA 2025',   'TODOS','2025-01-01','2025-12-31', 90.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(15,'EE000015-0000-0000-0000-000000000015','TAR-OTA-SUITE-2025', 5,3,'Tarifa Suite OTA 2025',   'TODOS','2025-01-01','2025-12-31',180.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD'),
(16,'EE000016-0000-0000-0000-000000000016','TAR-MAN-SIMPLE-2025',6,1,'Tarifa Simple MAN 2025',  'TODOS','2025-01-01','2025-12-31', 45.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(17,'EE000017-0000-0000-0000-000000000017','TAR-MAN-DOBLE-2025', 6,2,'Tarifa Doble MAN 2025',   'TODOS','2025-01-01','2025-12-31', 75.00,15.00,1,NULL,1,1,'ACT',0,'administrativoJD'),
(18,'EE000018-0000-0000-0000-000000000018','TAR-MAN-SUITE-2025', 6,3,'Tarifa Suite MAN 2025',   'TODOS','2025-01-01','2025-12-31',150.00,15.00,2,NULL,1,1,'ACT',0,'administrativoJD');
SET IDENTITY_INSERT alojamiento.TARIFA OFF;
GO

INSERT INTO alojamiento.TIPO_HABITACION_CATALOGO (id_tipo_habitacion, id_catalogo, creado_por_usuario) VALUES
(1,1,'administrativoJD'),(1,3,'administrativoJD'),
(2,1,'administrativoJD'),(2,2,'administrativoJD'),(2,3,'administrativoJD'),
(3,1,'administrativoJD'),(3,2,'administrativoJD'),(3,3,'administrativoJD'),
(1,4,'administrativoJD'),(1,6,'administrativoJD'),
(2,4,'administrativoJD'),(2,5,'administrativoJD'),(2,6,'administrativoJD'),
(3,4,'administrativoJD'),(3,5,'administrativoJD'),(3,6,'administrativoJD'),
(1,7,'administrativoJD'),(1,9,'administrativoJD'),
(2,7,'administrativoJD'),(2,8,'administrativoJD'),(2,9,'administrativoJD'),
(3,7,'administrativoJD'),(3,8,'administrativoJD'),(3,9,'administrativoJD'),
(1,10,'administrativoJD'),(1,12,'administrativoJD'),
(2,10,'administrativoJD'),(2,11,'administrativoJD'),(2,12,'administrativoJD'),
(3,10,'administrativoJD'),(3,11,'administrativoJD'),(3,12,'administrativoJD'),
(1,13,'administrativoJD'),(1,14,'administrativoJD'),
(2,13,'administrativoJD'),(2,14,'administrativoJD'),(2,15,'administrativoJD'),
(3,13,'administrativoJD'),(3,14,'administrativoJD'),(3,15,'administrativoJD'),
(1,16,'administrativoJD'),(1,17,'administrativoJD'),
(2,16,'administrativoJD'),(2,17,'administrativoJD'),(2,18,'administrativoJD'),
(3,16,'administrativoJD'),(3,17,'administrativoJD'),(3,18,'administrativoJD');
GO

-- VALORACIONES CORREGIDAS
-- Solo referencian estadias FIN (con checkout completado):
--   E3(AD000003) Ana/Quito FIN
--   E4(AD000004) Valeria/Cuenca FIN
--   E6(AD000006) Sofia/Otavalo FIN
--   E8(AD000008) Carlos/Cuenca FIN
SET IDENTITY_INSERT alojamiento.VALORACIONES ON;
INSERT INTO alojamiento.VALORACIONES (
    id_valoracion, valoracion_guid,
    id_estadia, estadia_guid,
    id_cliente, cliente_guid,
    id_sucursal, id_habitacion,
    puntuacion_general, puntuacion_limpieza, puntuacion_confort,
    puntuacion_ubicacion, puntuacion_instalaciones, puntuacion_personal,
    puntuacion_calidad_precio,
    comentario_positivo, comentario_negativo,
    tipo_viaje, estado_valoracion, publicada_en_portal,
    creado_por_usuario
) VALUES
-- V1: Ana Torres / Hotel Quito / Suite 301 / Estadia 3 (FIN)
(1,'CA000001-0000-0000-0000-000000000001',
 3,'AD000003-0000-0000-0000-000000000003',
 3,'FF000003-0000-0000-0000-000000000003',
 1,3,
 9.5,10.0,9.0,10.0,9.0,10.0,9.0,
 'Ubicacion perfecta en el centro historico. Personal muy atento. La suite es espectacular.',
 'El minibar podria tener mas opciones locales.',
 'pareja','PUB',1,'administrativoJD'),
-- V2: Valeria Rios / Hotel Cuenca / Hab 201 / Estadia 4 (FIN)
(2,'CA000002-0000-0000-0000-000000000002',
 4,'AD000004-0000-0000-0000-000000000004',
 5,'FF000005-0000-0000-0000-000000000005',
 3,8,
 9.8,10.0,10.0,10.0,9.5,10.0,9.5,
 'La casona colonial es un sueno. El desayuno con productos locales es lo mejor. El tour fue excelente.',
 'La calefaccion podria ser mas potente en las noches frias.',
 'solo','PUB',1,'administrativoJD'),
-- V3: Sofia Andrade / Hotel Otavalo / Suite 301 / Estadia 6 (FIN)
(3,'CA000003-0000-0000-0000-000000000003',
 6,'AD000006-0000-0000-0000-000000000006',
 7,'FF000007-0000-0000-0000-000000000007',
 5,15,
 8.5,8.5,9.0,10.0,8.0,10.0,9.0,
 'La vista a la laguna desde la suite es impresionante. El kayak fue una experiencia inolvidable.',
 'Las instalaciones podrian modernizarse. El wifi es lento.',
 'amigos','PUB',1,'administrativoJD'),
-- V4: Maria Garcia / Hotel Guayaquil / Hab 201 / ref logica Estadia 3 (FIN Ana/Quito)
(4,'CA000004-0000-0000-0000-000000000004',
 3,'AD000003-0000-0000-0000-000000000003',
 1,'FF000001-0000-0000-0000-000000000001',
 2,5,
 9.0,9.5,9.0,10.0,9.5,9.0,8.5,
 'Excelente ubicacion frente al Malecon. La piscina rooftop es espectacular con vista al rio Guayas.',
 'El trafico del centro puede ser ruidoso en horas pico.',
 'negocios','PUB',1,'administrativoJD'),
-- V5: Carlos Lopez / Resort Banos / Hab 201 / ref logica Estadia 8 (FIN Carlos/Cuenca)
(5,'CA000005-0000-0000-0000-000000000005',
 8,'AD000008-0000-0000-0000-000000000008',
 2,'FF000002-0000-0000-0000-000000000002',
 4,11,
 10.0,10.0,10.0,10.0,10.0,10.0,9.5,
 'El mejor resort de aventura del Ecuador. Las termas son increibles y el rafting fue emocionante.',
 'Nada negativo que destacar. Todo perfecto.',
 'pareja','PUB',1,'administrativoJD'),
-- V6: Roberto Jimenez / Hostal Manta / Hab 201 / ref logica Estadia 4 (FIN Valeria/Cuenca)
(6,'CA000006-0000-0000-0000-000000000006',
 4,'AD000004-0000-0000-0000-000000000004',
 8,'FF000008-0000-0000-0000-000000000008',
 6,17,
 8.0,8.5,8.0,10.0,7.5,9.0,9.5,
 'Ubicacion directa frente al mar. Las clases de surf son geniales y los instructores muy pacientes.',
 'Las habitaciones son basicas. El aire acondicionado hace ruido.',
 'amigos','PUB',1,'administrativoJD');
SET IDENTITY_INSERT alojamiento.VALORACIONES OFF;
GO

PRINT '>>> [1] Alojamiento OK - 6 sucursales | 18 hab | 18 catalogos | 18 tarifas | 6 valoraciones FIN';
GO


-- ============================================================
-- [2] BASE: MicroservicioReservas
-- ============================================================

USE MicroservicioReservas;
GO

DELETE FROM reservas.RESERVAS_HABITACIONES;
DELETE FROM reservas.RESERVAS;
DELETE FROM reservas.CLIENTES;
GO

DBCC CHECKIDENT ('reservas.RESERVAS_HABITACIONES', RESEED, 0);
DBCC CHECKIDENT ('reservas.RESERVAS',              RESEED, 0);
DBCC CHECKIDENT ('reservas.CLIENTES',              RESEED, 0);
GO

SET IDENTITY_INSERT reservas.CLIENTES ON;
INSERT INTO reservas.CLIENTES (
    id_cliente, cliente_guid, tipo_identificacion, numero_identificacion,
    nombres, apellidos, correo, telefono, direccion,
    estado, es_eliminado, creado_por_usuario
) VALUES
(1,'FF000001-0000-0000-0000-000000000001','CEDULA',   '1712345678','Maria Elena',  'Garcia Ruiz',    'maria.garcia@email.com',   '0991234567','Av. Amazonas N34-21, Quito',            'ACT',0,'administrativoJD'),
(2,'FF000002-0000-0000-0000-000000000002','CEDULA',   '1798765432','Carlos Andres','Lopez Mendoza',  'carlos.lopez@email.com',   '0987654321','Calle Rocafuerte 456, Quito',           'ACT',0,'administrativoJD'),
(3,'FF000003-0000-0000-0000-000000000003','PASAPORTE','US123456789','Ana Sofia',   'Torres Vega',    'ana.torres@email.com',     '0976543210','123 Main St, New York, USA',            'ACT',0,'administrativoJD'),
(4,'FF000004-0000-0000-0000-000000000004','CEDULA',   '1756781234','Luis Fernando','Morales Paz',    'luis.morales@email.com',   '0994567890','Av. 9 de Octubre 800, Guayaquil',       'ACT',0,'administrativoJD'),
(5,'FF000005-0000-0000-0000-000000000005','CEDULA',   '0102345678','Valeria',      'Rios Castillo',  'valeria.rios@email.com',   '0993456789','Calle Larga 5-42, Cuenca',              'ACT',0,'administrativoJD'),
(6,'FF000006-0000-0000-0000-000000000006','CEDULA',   '1867890123','Diego',        'Vega Salinas',   'diego.vega@email.com',     '0992345678','Via a Puyo Km 3, Banos',                'ACT',0,'administrativoJD'),
(7,'FF000007-0000-0000-0000-000000000007','CEDULA',   '1001234567','Sofia',        'Andrade Moran',  'sofia.andrade@email.com',  '0991122334','Calle Sucre y Modesto Jaramillo, Otavalo','ACT',0,'administrativoJD'),
(8,'FF000008-0000-0000-0000-000000000008','PASAPORTE','CO987654321','Roberto',     'Jimenez Paredes','roberto.jimenez@email.com','0998877665','Cra 15 #93-75, Bogota, Colombia',       'ACT',0,'administrativoJD');
SET IDENTITY_INSERT reservas.CLIENTES OFF;
GO

SET IDENTITY_INSERT reservas.RESERVAS ON;
INSERT INTO reservas.RESERVAS (
    id_reserva, guid_reserva, codigo_reserva,
    id_cliente, id_sucursal, sucursal_guid,
    fecha_inicio, fecha_fin,
    subtotal_reserva, valor_iva, total_reserva, descuento_aplicado, saldo_pendiente,
    origen_canal_reserva, estado_reserva, fecha_confirmacion_utc,
    observaciones, es_walkin, es_eliminado, creado_por_usuario
) VALUES
(1,'AB000001-0000-0000-0000-000000000001','RES-2025-001',
 1,1,'AA000001-0000-0000-0000-000000000001',
 '2025-05-10 14:00:00','2025-05-13 12:00:00',
 360.00,54.00,414.00,0.00,0.00,
 'PORTAL','CON','2025-05-01 09:00:00','Huespeda solicita almohadas adicionales.',0,0,'administrativoJD'),
(2,'AB000002-0000-0000-0000-000000000002','RES-2025-002',
 2,2,'AA000002-0000-0000-0000-000000000002',
 '2025-05-17 15:00:00','2025-05-20 12:00:00',
 960.00,144.00,1104.00,0.00,0.00,
 'PORTAL','CON','2025-05-05 11:00:00','Cliente ejecutivo. Solicita acceso a sala de reuniones.',0,0,'administrativoJD'),
(3,'AB000003-0000-0000-0000-000000000003','RES-2025-003',
 3,1,'AA000001-0000-0000-0000-000000000001',
 '2025-04-20 14:00:00','2025-04-24 12:00:00',
 1120.00,168.00,1288.00,0.00,0.00,
 'API','FIN','2025-04-10 15:30:00','Viajero frecuente. Requirio late checkout.',0,0,'administrativoJD'),
(4,'AB000004-0000-0000-0000-000000000004','RES-2025-004',
 4,2,'AA000002-0000-0000-0000-000000000002',
 '2025-06-05 15:00:00','2025-06-07 12:00:00',
 290.00,43.50,333.50,0.00,333.50,
 'PORTAL','CON','2025-05-10 08:00:00','Cliente viaja por negocios. Solicita factura a nombre de empresa.',0,0,'administrativoJD'),
(5,'AB000005-0000-0000-0000-000000000005','RES-2025-005',
 5,3,'AA000003-0000-0000-0000-000000000003',
 '2025-03-05 14:00:00','2025-03-08 11:00:00',
 330.00,49.50,379.50,0.00,0.00,
 'API','FIN','2025-02-20 10:00:00','Turista cultural. Solicita tour guiado por el centro historico.',0,0,'administrativoJD'),
(6,'AB000006-0000-0000-0000-000000000006','RES-2025-006',
 6,4,'AA000004-0000-0000-0000-000000000004',
 '2025-05-15 15:00:00','2025-05-19 12:00:00',
 640.00,96.00,736.00,0.00,0.00,
 'PORTAL','CON','2025-05-01 12:00:00','Reserva de luna de miel. Decoracion especial solicitada.',0,0,'administrativoJD'),
(7,'AB000007-0000-0000-0000-000000000007','RES-2025-007',
 7,5,'AA000005-0000-0000-0000-000000000005',
 '2025-04-04 13:00:00','2025-04-06 11:00:00',
 360.00,54.00,414.00,0.00,0.00,
 'ADMIN','FIN','2025-03-25 09:00:00','Visita al mercado sabado. Solicita tour artesanal.',0,0,'administrativoJD'),
(8,'AB000008-0000-0000-0000-000000000008','RES-2025-008',
 8,6,'AA000006-0000-0000-0000-000000000006',
 '2025-05-18 14:00:00','2025-05-23 11:00:00',
 375.00,56.25,431.25,0.00,431.25,
 'API','CON','2025-05-05 16:00:00','Surfista profesional. Solicita almacenamiento de tabla de surf.',0,0,'administrativoJD'),
(9,'AB000009-0000-0000-0000-000000000009','RES-2025-009',
 2,3,'AA000003-0000-0000-0000-000000000003',
 '2025-02-10 14:00:00','2025-02-13 11:00:00',
 750.00,112.50,862.50,0.00,0.00,
 'PORTAL','FIN','2025-01-28 11:00:00','Viaje cultural por Cuenca. Solicita guia en ingles.',0,0,'administrativoJD');
SET IDENTITY_INSERT reservas.RESERVAS OFF;
GO

SET IDENTITY_INSERT reservas.RESERVAS_HABITACIONES ON;
INSERT INTO reservas.RESERVAS_HABITACIONES (
    id_reserva_habitacion, reserva_habitacion_guid,
    id_reserva, id_habitacion, habitacion_guid,
    id_tarifa, tarifa_guid,
    fecha_inicio, fecha_fin,
    num_adultos, num_ninos, precio_noche_aplicado,
    subtotal_linea, valor_iva_linea, descuento_linea, total_linea,
    estado_detalle, creado_por_usuario
) VALUES
(1,'AC000001-0000-0000-0000-000000000001', 1, 2,'CC000002-0000-0000-0000-000000000002', 2,'EE000002-0000-0000-0000-000000000002','2025-05-10 14:00:00','2025-05-13 12:00:00',2,0,120.00,360.00,54.00,0.00,414.00,  'CON','administrativoJD'),
(2,'AC000002-0000-0000-0000-000000000002', 2, 6,'CC000006-0000-0000-0000-000000000006', 6,'EE000006-0000-0000-0000-000000000006','2025-05-17 15:00:00','2025-05-20 12:00:00',2,0,320.00,960.00,144.00,0.00,1104.00,'CON','administrativoJD'),
(3,'AC000003-0000-0000-0000-000000000003', 3, 3,'CC000003-0000-0000-0000-000000000003', 3,'EE000003-0000-0000-0000-000000000003','2025-04-20 14:00:00','2025-04-24 12:00:00',2,1,280.00,1120.00,168.00,0.00,1288.00,'FIN','administrativoJD'),
(4,'AC000004-0000-0000-0000-000000000004', 4, 5,'CC000005-0000-0000-0000-000000000005', 5,'EE000005-0000-0000-0000-000000000005','2025-06-05 15:00:00','2025-06-07 12:00:00',2,0,145.00,290.00,43.50,0.00,333.50, 'CON','administrativoJD'),
(5,'AC000005-0000-0000-0000-000000000005', 5, 8,'CC000008-0000-0000-0000-000000000008', 8,'EE000008-0000-0000-0000-000000000008','2025-03-05 14:00:00','2025-03-08 11:00:00',2,0,110.00,330.00,49.50,0.00,379.50, 'FIN','administrativoJD'),
(6,'AC000006-0000-0000-0000-000000000006', 6,11,'CC000011-0000-0000-0000-000000000011',11,'EE000011-0000-0000-0000-000000000011','2025-05-15 15:00:00','2025-05-19 12:00:00',2,0,160.00,640.00,96.00,0.00,736.00,  'CON','administrativoJD'),
(7,'AC000007-0000-0000-0000-000000000007', 7,15,'CC000015-0000-0000-0000-000000000015',15,'EE000015-0000-0000-0000-000000000015','2025-04-04 13:00:00','2025-04-06 11:00:00',2,0,180.00,360.00,54.00,0.00,414.00,  'FIN','administrativoJD'),
(8,'AC000008-0000-0000-0000-000000000008', 8,17,'CC000017-0000-0000-0000-000000000017',17,'EE000017-0000-0000-0000-000000000017','2025-05-18 14:00:00','2025-05-23 11:00:00',2,0,75.00, 375.00,56.25,0.00,431.25, 'CON','administrativoJD'),
(9,'AC000009-0000-0000-0000-000000000009', 9, 9,'CC000009-0000-0000-0000-000000000009', 9,'EE000009-0000-0000-0000-000000000009','2025-02-10 14:00:00','2025-02-13 11:00:00',2,0,250.00,750.00,112.50,0.00,862.50,'FIN','administrativoJD');
SET IDENTITY_INSERT reservas.RESERVAS_HABITACIONES OFF;
GO

PRINT '>>> [2] Reservas OK - 8 clientes | 9 reservas | 9 lineas habitacion';
GO


-- ============================================================
-- [3] BASE: MicroservicioHospedaje
-- ============================================================

USE MicroservicioHospedaje;
GO

DELETE FROM hospedaje.CARGO_ESTADIA;
DELETE FROM hospedaje.ESTADIAS;
GO

DBCC CHECKIDENT ('hospedaje.CARGO_ESTADIA', RESEED, 0);
DBCC CHECKIDENT ('hospedaje.ESTADIAS',      RESEED, 0);
GO

SET IDENTITY_INSERT hospedaje.ESTADIAS ON;
INSERT INTO hospedaje.ESTADIAS (
    id_estadia, estadia_guid,
    id_reserva_habitacion, reserva_habitacion_guid,
    id_cliente, cliente_guid,
    id_habitacion, habitacion_guid,
    checkin_utc, checkout_utc,
    estado_estadia, observaciones_checkin, observaciones_checkout,
    requiere_mantenimiento, creado_por_usuario
) VALUES
(1,'AD000001-0000-0000-0000-000000000001', 1,'AC000001-0000-0000-0000-000000000001', 1,'FF000001-0000-0000-0000-000000000001', 2,'CC000002-0000-0000-0000-000000000002','2025-05-10 14:25:00',NULL,'ACT','Huesped llego con 25 min de anticipacion. Solicito almohadas adicionales.',NULL,0,'administrativoJD'),
(2,'AD000002-0000-0000-0000-000000000002', 2,'AC000002-0000-0000-0000-000000000002', 2,'FF000002-0000-0000-0000-000000000002', 6,'CC000006-0000-0000-0000-000000000006','2025-05-17 15:30:00',NULL,'ACT','Cliente ejecutivo. Se coordino acceso a sala de reuniones.',NULL,0,'administrativoJD'),
(3,'AD000003-0000-0000-0000-000000000003', 3,'AC000003-0000-0000-0000-000000000003', 3,'FF000003-0000-0000-0000-000000000003', 3,'CC000003-0000-0000-0000-000000000003','2025-04-20 14:10:00','2025-04-24 11:45:00','FIN','Huesped solicito late checkout hasta 12h. Concedido sin cargo adicional.','Habitacion en buen estado. Minibar consumido. Room service utilizado.',0,'administrativoJD'),
(4,'AD000004-0000-0000-0000-000000000004', 5,'AC000005-0000-0000-0000-000000000005', 5,'FF000005-0000-0000-0000-000000000005', 8,'CC000008-0000-0000-0000-000000000008','2025-03-05 14:30:00','2025-03-08 10:45:00','FIN','Turista cultural. Participo en tour del centro historico el dia 2.','Habitacion impecable. Sin observaciones. Desayuno consumido los 3 dias.',0,'administrativoJD'),
(5,'AD000005-0000-0000-0000-000000000005', 6,'AC000006-0000-0000-0000-000000000006', 6,'FF000006-0000-0000-0000-000000000006',11,'CC000011-0000-0000-0000-000000000011','2025-05-15 15:20:00',NULL,'ACT','Reserva de luna de miel. Decoracion con flores y velas colocada al momento del checkin.',NULL,0,'administrativoJD'),
(6,'AD000006-0000-0000-0000-000000000006', 7,'AC000007-0000-0000-0000-000000000007', 7,'FF000007-0000-0000-0000-000000000007',15,'CC000015-0000-0000-0000-000000000015','2025-04-04 13:15:00','2025-04-06 10:50:00','FIN','Huesped visito mercado artesanal el sabado. Contrato kayak en laguna.','Suite en perfecto estado. Minibar sin consumo.',0,'administrativoJD'),
(7,'AD000007-0000-0000-0000-000000000007', 8,'AC000008-0000-0000-0000-000000000008', 8,'FF000008-0000-0000-0000-000000000008',17,'CC000017-0000-0000-0000-000000000017','2025-05-18 14:20:00',NULL,'ACT','Surfista profesional. Tabla de surf almacenada en bodega. Contrato clases de surf.',NULL,0,'administrativoJD'),
(8,'AD000008-0000-0000-0000-000000000008', 9,'AC000009-0000-0000-0000-000000000009', 2,'FF000002-0000-0000-0000-000000000002', 9,'CC000009-0000-0000-0000-000000000009','2025-02-10 14:00:00','2025-02-13 10:30:00','FIN','Viaje cultural. Solicito guia en ingles para el tour ciudad.','Suite en buen estado. Lavanderia utilizada. Tour ciudad contratado.',0,'administrativoJD');
SET IDENTITY_INSERT hospedaje.ESTADIAS OFF;
GO

SET IDENTITY_INSERT hospedaje.CARGO_ESTADIA ON;
INSERT INTO hospedaje.CARGO_ESTADIA (
    id_cargo_estadia, cargo_guid,
    id_estadia, id_catalogo, catalogo_guid,
    descripcion_cargo, cantidad,
    precio_unitario, subtotal, valor_iva, total_cargo,
    fecha_consumo_utc, estado_cargo, creado_por_usuario
) VALUES
(1, 'AE000001-0000-0000-0000-000000000001', 3, 1,'DD000001-0000-0000-0000-000000000001','Room Service - Desayuno continental',      2, 25.00,50.00,7.50, 57.50,'2025-04-21 08:30:00','FAC','administrativoJD'),
(2, 'AE000002-0000-0000-0000-000000000002', 3, 3,'DD000003-0000-0000-0000-000000000003','Parqueadero - 4 dias',                     4,  8.00,32.00,0.00, 32.00,'2025-04-24 11:00:00','FAC','administrativoJD'),
(3, 'AE000003-0000-0000-0000-000000000003', 3, 2,'DD000002-0000-0000-0000-000000000002','Lavanderia - 1 servicio',                  1, 15.00,15.00,2.25, 17.25,'2025-04-22 10:00:00','FAC','administrativoJD'),
(4, 'AE000004-0000-0000-0000-000000000004', 4, 7,'DD000007-0000-0000-0000-000000000007','Desayuno Colonial - 3 dias',               3, 18.00,54.00,8.10, 62.10,'2025-03-07 08:00:00','FAC','administrativoJD'),
(5, 'AE000005-0000-0000-0000-000000000005', 4, 8,'DD000008-0000-0000-0000-000000000008','Tour Guiado Centro Historico de Cuenca',   1, 35.00,35.00,5.25, 40.25,'2025-03-06 09:00:00','FAC','administrativoJD'),
(6, 'AE000006-0000-0000-0000-000000000006', 6,13,'DD000013-0000-0000-0000-000000000013','Desayuno Andino - 2 dias',                 2, 15.00,30.00,4.50, 34.50,'2025-04-05 07:30:00','FAC','administrativoJD'),
(7, 'AE000007-0000-0000-0000-000000000007', 6,14,'DD000014-0000-0000-0000-000000000014','Tour Mercado Artesanal Otavalo',           1, 20.00,20.00,3.00, 23.00,'2025-04-05 08:00:00','FAC','administrativoJD'),
(8, 'AE000008-0000-0000-0000-000000000008', 6,15,'DD000015-0000-0000-0000-000000000015','Kayak Laguna San Pablo - 2 horas',         2, 18.00,36.00,5.40, 41.40,'2025-04-05 10:00:00','FAC','administrativoJD'),
(9, 'AE000009-0000-0000-0000-000000000009', 8, 8,'DD000008-0000-0000-0000-000000000008','Tour Guiado Centro Historico - Guia ingles',1,35.00,35.00,5.25, 40.25,'2025-02-11 09:00:00','FAC','administrativoJD'),
(10,'AE000010-0000-0000-0000-000000000010', 8, 9,'DD000009-0000-0000-0000-000000000009','Lavanderia - 1 servicio',                  1, 12.00,12.00,1.80, 13.80,'2025-02-12 11:00:00','FAC','administrativoJD');
SET IDENTITY_INSERT hospedaje.CARGO_ESTADIA OFF;
GO

PRINT '>>> [3] Hospedaje OK - 8 estadias (4 ACT + 4 FIN) | 10 cargos';
GO


-- ============================================================
-- [4] BASE: MicroservicioFacturacion
-- ============================================================

USE MicroservicioFacturacion;
GO

DELETE FROM facturacion.PAGOS;
DELETE FROM facturacion.FACTURA_DETALLE;
DELETE FROM facturacion.FACTURAS;
GO

DBCC CHECKIDENT ('facturacion.PAGOS',           RESEED, 0);
DBCC CHECKIDENT ('facturacion.FACTURA_DETALLE', RESEED, 0);
DBCC CHECKIDENT ('facturacion.FACTURAS',        RESEED, 0);
GO

SET IDENTITY_INSERT facturacion.FACTURAS ON;
INSERT INTO facturacion.FACTURAS (
    id_factura, guid_factura,
    id_cliente, cliente_guid, id_reserva, reserva_guid, id_sucursal, sucursal_guid,
    numero_factura, tipo_factura, fecha_emision,
    subtotal, valor_iva, descuento_total, total, saldo_pendiente,
    moneda, estado, creado_por_usuario
) VALUES
(1, 'AF000001-0000-0000-0000-000000000001', 1,'FF000001-0000-0000-0000-000000000001', 1,'AB000001-0000-0000-0000-000000000001', 1,'AA000001-0000-0000-0000-000000000001','FAC-RES-001-20250501','RESERVA','2025-05-01 09:00:00', 360.00,54.00,0.00,414.00,414.00,  'USD','EMI','administrativoJD'),
(2, 'AF000002-0000-0000-0000-000000000002', 2,'FF000002-0000-0000-0000-000000000002', 2,'AB000002-0000-0000-0000-000000000002', 2,'AA000002-0000-0000-0000-000000000002','FAC-RES-002-20250505','RESERVA','2025-05-05 11:00:00', 960.00,144.00,0.00,1104.00,0.00, 'USD','PAG','administrativoJD'),
(3, 'AF000003-0000-0000-0000-000000000003', 3,'FF000003-0000-0000-0000-000000000003', 3,'AB000003-0000-0000-0000-000000000003', 1,'AA000001-0000-0000-0000-000000000001','FAC-RES-003-20250410','RESERVA','2025-04-10 15:30:00',1120.00,168.00,0.00,1288.00,0.00, 'USD','PAG','administrativoJD'),
(4, 'AF000004-0000-0000-0000-000000000004', 3,'FF000003-0000-0000-0000-000000000003', 3,'AB000003-0000-0000-0000-000000000003', 1,'AA000001-0000-0000-0000-000000000001','FAC-FIN-003-20250424','FINAL',  '2025-04-24 11:45:00',  97.00,9.75, 0.00,106.75,0.00,  'USD','PAG','administrativoJD'),
(5, 'AF000005-0000-0000-0000-000000000005', 4,'FF000004-0000-0000-0000-000000000004', 4,'AB000004-0000-0000-0000-000000000004', 2,'AA000002-0000-0000-0000-000000000002','FAC-RES-004-20250510','RESERVA','2025-05-10 08:00:00', 290.00,43.50,0.00,333.50,333.50, 'USD','EMI','administrativoJD'),
(6, 'AF000006-0000-0000-0000-000000000006', 5,'FF000005-0000-0000-0000-000000000005', 5,'AB000005-0000-0000-0000-000000000005', 3,'AA000003-0000-0000-0000-000000000003','FAC-RES-005-20250220','RESERVA','2025-02-20 10:00:00', 330.00,49.50,0.00,379.50,0.00,  'USD','PAG','administrativoJD'),
(7, 'AF000007-0000-0000-0000-000000000007', 5,'FF000005-0000-0000-0000-000000000005', 5,'AB000005-0000-0000-0000-000000000005', 3,'AA000003-0000-0000-0000-000000000003','FAC-FIN-005-20250308','FINAL',  '2025-03-08 10:45:00',  89.00,13.35,0.00,102.35,0.00, 'USD','PAG','administrativoJD'),
(8, 'AF000008-0000-0000-0000-000000000008', 6,'FF000006-0000-0000-0000-000000000006', 6,'AB000006-0000-0000-0000-000000000006', 4,'AA000004-0000-0000-0000-000000000004','FAC-RES-006-20250501','RESERVA','2025-05-01 12:00:00', 640.00,96.00,0.00,736.00,0.00,  'USD','PAG','administrativoJD'),
(9, 'AF000009-0000-0000-0000-000000000009', 7,'FF000007-0000-0000-0000-000000000007', 7,'AB000007-0000-0000-0000-000000000007', 5,'AA000005-0000-0000-0000-000000000005','FAC-RES-007-20250325','RESERVA','2025-03-25 09:00:00', 360.00,54.00,0.00,414.00,0.00,  'USD','PAG','administrativoJD'),
(10,'AF000010-0000-0000-0000-000000000010', 7,'FF000007-0000-0000-0000-000000000007', 7,'AB000007-0000-0000-0000-000000000007', 5,'AA000005-0000-0000-0000-000000000005','FAC-FIN-007-20250406','FINAL',  '2025-04-06 10:50:00',  86.00,12.90,0.00,98.90,0.00,  'USD','PAG','administrativoJD'),
(11,'AF000011-0000-0000-0000-000000000011', 8,'FF000008-0000-0000-0000-000000000008', 8,'AB000008-0000-0000-0000-000000000008', 6,'AA000006-0000-0000-0000-000000000006','FAC-RES-008-20250505','RESERVA','2025-05-05 16:00:00', 375.00,56.25,0.00,431.25,431.25,'USD','EMI','administrativoJD'),
(12,'AF000012-0000-0000-0000-000000000012', 2,'FF000002-0000-0000-0000-000000000002', 9,'AB000009-0000-0000-0000-000000000009', 3,'AA000003-0000-0000-0000-000000000003','FAC-RES-009-20250128','RESERVA','2025-01-28 11:00:00', 750.00,112.50,0.00,862.50,0.00, 'USD','PAG','administrativoJD'),
(13,'AF000013-0000-0000-0000-000000000013', 2,'FF000002-0000-0000-0000-000000000002', 9,'AB000009-0000-0000-0000-000000000009', 3,'AA000003-0000-0000-0000-000000000003','FAC-FIN-009-20250213','FINAL',  '2025-02-13 10:30:00',  47.00,7.05, 0.00,54.05,0.00,  'USD','PAG','administrativoJD');
SET IDENTITY_INSERT facturacion.FACTURAS OFF;
GO

SET IDENTITY_INSERT facturacion.FACTURA_DETALLE ON;
INSERT INTO facturacion.FACTURA_DETALLE (
    id_factura_detalle, factura_detalle_guid,
    id_factura, tipo_item, referencia_tipo, referencia_id,
    descripcion_item, cantidad,
    precio_unitario, subtotal_linea, valor_iva_linea, descuento_linea, total_linea,
    creado_por_usuario
) VALUES
(1, 'BA000001-0000-0000-0000-000000000001',  1,'ALOJAMIENTO','RESERVA_HABITACION',1,'Habitacion Doble 201 - 3 noches (10/05 al 13/05/2025)',           1, 360.00,360.00,54.00, 0.00,414.00,  'administrativoJD'),
(2, 'BA000002-0000-0000-0000-000000000002',  2,'ALOJAMIENTO','RESERVA_HABITACION',2,'Suite Ejecutiva 501 - 3 noches (17/05 al 20/05/2025)',             1, 960.00,960.00,144.00,0.00,1104.00, 'administrativoJD'),
(3, 'BA000003-0000-0000-0000-000000000003',  3,'ALOJAMIENTO','RESERVA_HABITACION',3,'Suite Presidencial 301 - 4 noches (20/04 al 24/04/2025)',          1,1120.00,1120.00,168.00,0.00,1288.00,'administrativoJD'),
(4, 'BA000004-0000-0000-0000-000000000004',  4,'SERVICIO',   'CARGO_ESTADIA',     1,'Room Service - Desayuno continental x2',                          2,  25.00,50.00, 7.50,0.00,57.50,   'administrativoJD'),
(5, 'BA000005-0000-0000-0000-000000000005',  4,'SERVICIO',   'CARGO_ESTADIA',     2,'Parqueadero - 4 dias',                                            4,   8.00,32.00, 0.00,0.00,32.00,   'administrativoJD'),
(6, 'BA000006-0000-0000-0000-000000000006',  4,'SERVICIO',   'CARGO_ESTADIA',     3,'Lavanderia - 1 servicio',                                         1,  15.00,15.00, 2.25,0.00,17.25,   'administrativoJD'),
(7, 'BA000007-0000-0000-0000-000000000007',  5,'ALOJAMIENTO','RESERVA_HABITACION',4,'Habitacion Doble 201 - 2 noches (05/06 al 07/06/2025)',            1, 290.00,290.00,43.50,0.00,333.50, 'administrativoJD'),
(8, 'BA000008-0000-0000-0000-000000000008',  6,'ALOJAMIENTO','RESERVA_HABITACION',5,'Habitacion Doble 201 - 3 noches (05/03 al 08/03/2025)',            1, 330.00,330.00,49.50,0.00,379.50, 'administrativoJD'),
(9, 'BA000009-0000-0000-0000-000000000009',  7,'SERVICIO',   'CARGO_ESTADIA',     4,'Desayuno Colonial - 3 dias',                                      3,  18.00,54.00, 8.10,0.00,62.10,   'administrativoJD'),
(10,'BA000010-0000-0000-0000-000000000010',  7,'SERVICIO',   'CARGO_ESTADIA',     5,'Tour Guiado Centro Historico de Cuenca',                          1,  35.00,35.00, 5.25,0.00,40.25,   'administrativoJD'),
(11,'BA000011-0000-0000-0000-000000000011',  8,'ALOJAMIENTO','RESERVA_HABITACION',6,'Cabana Doble 201 - 4 noches (15/05 al 19/05/2025)',               1, 640.00,640.00,96.00,0.00,736.00,  'administrativoJD'),
(12,'BA000012-0000-0000-0000-000000000012',  9,'ALOJAMIENTO','RESERVA_HABITACION',7,'Suite 301 Vista Lago - 2 noches (04/04 al 06/04/2025)',            1, 360.00,360.00,54.00,0.00,414.00,  'administrativoJD'),
(13,'BA000013-0000-0000-0000-000000000013', 10,'SERVICIO',   'CARGO_ESTADIA',     6,'Desayuno Andino - 2 dias',                                        2,  15.00,30.00, 4.50,0.00,34.50,   'administrativoJD'),
(14,'BA000014-0000-0000-0000-000000000014', 10,'SERVICIO',   'CARGO_ESTADIA',     7,'Tour Mercado Artesanal Otavalo',                                  1,  20.00,20.00, 3.00,0.00,23.00,   'administrativoJD'),
(15,'BA000015-0000-0000-0000-000000000015', 10,'SERVICIO',   'CARGO_ESTADIA',     8,'Kayak Laguna San Pablo - 2 horas',                                2,  18.00,36.00, 5.40,0.00,41.40,   'administrativoJD'),
(16,'BA000016-0000-0000-0000-000000000016', 11,'ALOJAMIENTO','RESERVA_HABITACION',8,'Habitacion Doble 201 - 5 noches (18/05 al 23/05/2025)',            1, 375.00,375.00,56.25,0.00,431.25, 'administrativoJD'),
(17,'BA000017-0000-0000-0000-000000000017', 12,'ALOJAMIENTO','RESERVA_HABITACION',9,'Suite Presidencial 301 - 3 noches (10/02 al 13/02/2025)',          1, 750.00,750.00,112.50,0.00,862.50,'administrativoJD'),
(18,'BA000018-0000-0000-0000-000000000018', 13,'SERVICIO',   'CARGO_ESTADIA',     9,'Tour Guiado Centro Historico - Guia en ingles',                   1,  35.00,35.00, 5.25,0.00,40.25,   'administrativoJD'),
(19,'BA000019-0000-0000-0000-000000000019', 13,'SERVICIO',   'CARGO_ESTADIA',    10,'Lavanderia - 1 servicio',                                         1,  12.00,12.00, 1.80,0.00,13.80,   'administrativoJD');
SET IDENTITY_INSERT facturacion.FACTURA_DETALLE OFF;
GO

SET IDENTITY_INSERT facturacion.PAGOS ON;
INSERT INTO facturacion.PAGOS (
    id_pago, pago_guid,
    id_factura, id_reserva, reserva_guid,
    monto, metodo_pago,
    es_pago_electronico, proveedor_pasarela, transaccion_externa, codigo_autorizacion,
    referencia, estado_pago, fecha_pago_utc, moneda, tipo_cambio, creado_por_usuario
) VALUES
(1, 'BB000001-0000-0000-0000-000000000001',  2,2,'AB000002-0000-0000-0000-000000000002',1104.00,'TARJETA_CREDITO',1,'Stripe',    'txn_stripe_001_CAR_GYE_20250505','AUTH-2025-0501', 'Pago anticipado Suite Ejecutiva Guayaquil - Carlos Lopez','APR','2025-05-05 11:30:00','USD',1.0000,'administrativoJD'),
(2, 'BB000002-0000-0000-0000-000000000002',  3,3,'AB000003-0000-0000-0000-000000000003',1288.00,'TARJETA_CREDITO',1,'Stripe',    'txn_stripe_002_ANA_QUI_20250410','AUTH-2025-0410', 'Pago reserva Suite Presidencial Quito - Ana Torres',      'APR','2025-04-10 16:00:00','USD',1.0000,'administrativoJD'),
(3, 'BB000003-0000-0000-0000-000000000003',  4,3,'AB000003-0000-0000-0000-000000000003', 106.75,'EFECTIVO',       0,NULL,        NULL,                             NULL,            'Pago cargos estadia checkout Ana Torres - Quito',         'APR','2025-04-24 12:00:00','USD',1.0000,'administrativoJD'),
(4, 'BB000004-0000-0000-0000-000000000004',  6,5,'AB000005-0000-0000-0000-000000000005', 379.50,'TRANSFERENCIA',  1,'Bco Pichincha','TRF-20250220-VAL001',          'AUTH-2025-0220','Transferencia reserva Hotel Cuenca Colonial - Valeria',   'APR','2025-02-20 11:00:00','USD',1.0000,'administrativoJD'),
(5, 'BB000005-0000-0000-0000-000000000005',  7,5,'AB000005-0000-0000-0000-000000000005', 102.35,'EFECTIVO',       0,NULL,        NULL,                             NULL,            'Pago cargos estadia checkout Valeria - Cuenca',           'APR','2025-03-08 11:00:00','USD',1.0000,'administrativoJD'),
(6, 'BB000006-0000-0000-0000-000000000006',  8,6,'AB000006-0000-0000-0000-000000000006', 736.00,'TARJETA_CREDITO',1,'Stripe',    'txn_stripe_003_DGO_BAN_20250501','AUTH-2025-0501B','Pago anticipado luna de miel Resort Banos - Diego',      'APR','2025-05-01 13:00:00','USD',1.0000,'administrativoJD'),
(7, 'BB000007-0000-0000-0000-000000000007',  9,7,'AB000007-0000-0000-0000-000000000007', 414.00,'TARJETA_DEBITO', 1,'PayPhone',  'txn_payphone_001_SOF_OTA_20250325','AUTH-2025-0325','Pago reserva Suite Otavalo Lago - Sofia Andrade',       'APR','2025-03-25 10:00:00','USD',1.0000,'administrativoJD'),
(8, 'BB000008-0000-0000-0000-000000000008', 10,7,'AB000007-0000-0000-0000-000000000007',  98.90,'EFECTIVO',       0,NULL,        NULL,                             NULL,            'Pago cargos estadia checkout Sofia - Otavalo',            'APR','2025-04-06 11:00:00','USD',1.0000,'administrativoJD'),
(9, 'BB000009-0000-0000-0000-000000000009', 12,9,'AB000009-0000-0000-0000-000000000009', 862.50,'TRANSFERENCIA',  1,'Bco Guayaquil','TRF-20250128-CAR001',         'AUTH-2025-0128','Transferencia reserva Suite Cuenca - Carlos Lopez',       'APR','2025-01-28 12:00:00','USD',1.0000,'administrativoJD'),
(10,'BB000010-0000-0000-0000-000000000010', 13,9,'AB000009-0000-0000-0000-000000000009',  54.05,'EFECTIVO',       0,NULL,        NULL,                             NULL,            'Pago cargos estadia checkout Carlos - Cuenca',            'APR','2025-02-13 11:00:00','USD',1.0000,'administrativoJD');
SET IDENTITY_INSERT facturacion.PAGOS OFF;
GO

PRINT '>>> [4] Facturacion OK - 13 facturas | 19 detalles | 10 pagos';
PRINT '>>>     EMI pendientes: F01(Maria $414) F05(Luis $333.50) F11(Roberto $431.25)';
GO


-- ============================================================
-- [5] BASE: microservicioSeguridad
-- ============================================================

USE microservicioSeguridad;
GO

DELETE FROM seguridad.AUDITORIA;
DELETE FROM seguridad.USUARIOS_ROLES;
DELETE FROM seguridad.USUARIO_APP;
DELETE FROM seguridad.ROL;
GO

DBCC CHECKIDENT ('seguridad.AUDITORIA',      RESEED, 0);
DBCC CHECKIDENT ('seguridad.USUARIOS_ROLES', RESEED, 0);
DBCC CHECKIDENT ('seguridad.USUARIO_APP',    RESEED, 0);
DBCC CHECKIDENT ('seguridad.ROL',            RESEED, 0);
GO

SET IDENTITY_INSERT seguridad.ROL ON;
INSERT INTO seguridad.ROL (id_rol, rol_guid, nombre_rol, descripcion_rol, estado_rol, es_eliminado, activo, creado_por_usuario) VALUES
(1,'BC000001-0000-0000-0000-000000000001','ADMINISTRADOR','Acceso total al sistema. Gestiona usuarios, configuraciones, reportes y todos los microservicios.','ACT',0,1,'sistema'),
(2,'BC000002-0000-0000-0000-000000000002','RECEPCIONISTA','Gestion operativa de reservas, check-in, check-out, cargos y facturacion basica.','ACT',0,1,'administrativoJD'),
(3,'BC000003-0000-0000-0000-000000000003','HUESPED','Acceso al portal de reservas, consulta de historial propio y gestion de perfil.','ACT',0,1,'administrativoJD');
SET IDENTITY_INSERT seguridad.ROL OFF;
GO

SET IDENTITY_INSERT seguridad.USUARIO_APP ON;
INSERT INTO seguridad.USUARIO_APP (
    id_usuario, usuario_guid, id_cliente, cliente_guid,
    username, correo, nombres, apellidos,
    password_hash, password_salt,
    estado_usuario, es_eliminado, activo, creado_por_usuario
) VALUES
(1, 'BD000001-0000-0000-0000-000000000001', NULL,NULL, 'administrativoJD','admin@hotelquitocentro.com',    'Juan Diego',   'Administrativo',  'a3f8c2e1d7b94056f2a1c3e8d5b7a9f4c2e1d7b940a3f8c2e1d7b94056f2a1c3','SALT_ADMIN_JD_2025', 'ACT',0,1,'sistema'),
(2, 'BD000002-0000-0000-0000-000000000002', NULL,NULL, 'recepcion.quito', 'recepcion@hotelquitocentro.com','Carla Beatriz','Suarez Ortiz',     'b1e9d4a2c8f5036b1e9d4a2c8f5036b1e9d4a2c8f5036b1e9d4a2c8f5036b1e9','SALT_RECEP_QUI_2025','ACT',0,1,'administrativoJD'),
(3, 'BD000003-0000-0000-0000-000000000003', 1,'FF000001-0000-0000-0000-000000000001','maria.garcia',    'maria.garcia@email.com',    'Maria Elena',  'Garcia Ruiz',    'c2f0e5b3d9a6147c2f0e5b3d9a6147c2f0e5b3d9a6147c2f0e5b3d9a6147c2f0','SALT_MARIA_2025',    'ACT',0,1,'administrativoJD'),
(4, 'BD000004-0000-0000-0000-000000000004', 2,'FF000002-0000-0000-0000-000000000002','carlos.lopez',    'carlos.lopez@email.com',    'Carlos Andres','Lopez Mendoza',   'd3a1f6c4e0b7258d3a1f6c4e0b7258d3a1f6c4e0b7258d3a1f6c4e0b7258d3a1','SALT_CARLOS_2025',   'ACT',0,1,'administrativoJD'),
(5, 'BD000005-0000-0000-0000-000000000005', 3,'FF000003-0000-0000-0000-000000000003','ana.torres',      'ana.torres@email.com',      'Ana Sofia',    'Torres Vega',     'e4b2a7d5f1c8369e4b2a7d5f1c8369e4b2a7d5f1c8369e4b2a7d5f1c8369e4b2','SALT_ANA_2025',      'ACT',0,1,'administrativoJD'),
(6, 'BD000006-0000-0000-0000-000000000006', 4,'FF000004-0000-0000-0000-000000000004','luis.morales',    'luis.morales@email.com',    'Luis Fernando','Morales Paz',     'f5c3b8e6a2d9470f5c3b8e6a2d9470f5c3b8e6a2d9470f5c3b8e6a2d9470f5c3','SALT_LUIS_2025',     'ACT',0,1,'administrativoJD'),
(7, 'BD000007-0000-0000-0000-000000000007', 5,'FF000005-0000-0000-0000-000000000005','valeria.rios',    'valeria.rios@email.com',    'Valeria',      'Rios Castillo',   'a6d4c9f7b3e0581a6d4c9f7b3e0581a6d4c9f7b3e0581a6d4c9f7b3e0581a6d4','SALT_VALE_2025',     'ACT',0,1,'administrativoJD'),
(8, 'BD000008-0000-0000-0000-000000000008', 6,'FF000006-0000-0000-0000-000000000006','diego.vega',      'diego.vega@email.com',      'Diego',        'Vega Salinas',    'b7e5d0a8c4f1692b7e5d0a8c4f1692b7e5d0a8c4f1692b7e5d0a8c4f1692b7e5','SALT_DIEGO_2025',    'ACT',0,1,'administrativoJD'),
(9, 'BD000009-0000-0000-0000-000000000009', 7,'FF000007-0000-0000-0000-000000000007','sofia.andrade',   'sofia.andrade@email.com',   'Sofia',        'Andrade Moran',   'c8f6e1b9d5a2703c8f6e1b9d5a2703c8f6e1b9d5a2703c8f6e1b9d5a2703c8f6','SALT_SOFIA_2025',    'ACT',0,1,'administrativoJD'),
(10,'BD000010-0000-0000-0000-000000000010', 8,'FF000008-0000-0000-0000-000000000008','roberto.jimenez', 'roberto.jimenez@email.com', 'Roberto',      'Jimenez Paredes', 'd9a7f2c0e6b3814d9a7f2c0e6b3814d9a7f2c0e6b3814d9a7f2c0e6b3814d9a7','SALT_ROBE_2025',     'ACT',0,1,'administrativoJD');
SET IDENTITY_INSERT seguridad.USUARIO_APP OFF;
GO

SET IDENTITY_INSERT seguridad.USUARIOS_ROLES ON;
INSERT INTO seguridad.USUARIOS_ROLES (id_usuario_rol, id_usuario, id_rol, estado_usuario_rol, es_eliminado, activo, creado_por_usuario) VALUES
(1, 1,1,'ACT',0,1,'sistema'),
(2, 2,2,'ACT',0,1,'administrativoJD'),
(3, 3,3,'ACT',0,1,'administrativoJD'),
(4, 4,3,'ACT',0,1,'administrativoJD'),
(5, 5,3,'ACT',0,1,'administrativoJD'),
(6, 6,3,'ACT',0,1,'administrativoJD'),
(7, 7,3,'ACT',0,1,'administrativoJD'),
(8, 8,3,'ACT',0,1,'administrativoJD'),
(9, 9,3,'ACT',0,1,'administrativoJD'),
(10,10,3,'ACT',0,1,'administrativoJD');
SET IDENTITY_INSERT seguridad.USUARIOS_ROLES OFF;
GO

INSERT INTO seguridad.AUDITORIA (tabla_afectada, operacion, id_registro_afectado, datos_anteriores, datos_nuevos, usuario_ejecutor, ip_origen, servicio_origen) VALUES
('ROL',         'INSERT','1,2,3',NULL,'{"roles":["ADMINISTRADOR","RECEPCIONISTA","HUESPED"]}',                                                    'sistema',        '127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','1',    NULL,'{"username":"administrativoJD","rol":"ADMINISTRADOR"}',                                                     'sistema',        '127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','2',    NULL,'{"username":"recepcion.quito","rol":"RECEPCIONISTA"}',                                                       'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','3',    NULL,'{"username":"maria.garcia","cliente_guid":"FF000001-0000-0000-0000-000000000001"}',                          'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','4',    NULL,'{"username":"carlos.lopez","cliente_guid":"FF000002-0000-0000-0000-000000000002"}',                          'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','5',    NULL,'{"username":"ana.torres","cliente_guid":"FF000003-0000-0000-0000-000000000003"}',                            'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','6',    NULL,'{"username":"luis.morales","cliente_guid":"FF000004-0000-0000-0000-000000000004"}',                          'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','7',    NULL,'{"username":"valeria.rios","cliente_guid":"FF000005-0000-0000-0000-000000000005"}',                          'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','8',    NULL,'{"username":"diego.vega","cliente_guid":"FF000006-0000-0000-0000-000000000006"}',                            'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','9',    NULL,'{"username":"sofia.andrade","cliente_guid":"FF000007-0000-0000-0000-000000000007"}',                         'administrativoJD','127.0.0.1','seed-script'),
('USUARIO_APP', 'INSERT','10',   NULL,'{"username":"roberto.jimenez","cliente_guid":"FF000008-0000-0000-0000-000000000008"}',                       'administrativoJD','127.0.0.1','seed-script');
GO

PRINT '>>> [5] Seguridad OK - 3 roles | 10 usuarios | 10 asignaciones';
PRINT '>>> ================================================================';
PRINT '>>> SEED MAESTRO UNIFICADO COMPLETO - v3 FINAL';
PRINT '>>> ================================================================';
PRINT '>>> RESUMEN:';
PRINT '>>>   alojamientojd       : 6 hoteles | 18 hab | 18 cat | 18 tar | 6 val(FIN)';
PRINT '>>>   MicroservicioReservas: 8 clientes | 9 reservas | 9 RH';
PRINT '>>>   MicroservicioHospedaje: 8 estadias | 10 cargos';
PRINT '>>>   MicroservicioFacturacion: 13 facturas | 19 detalles | 10 pagos';
PRINT '>>>   microservicioSeguridad: 3 roles | 10 usuarios | 10 asignaciones';
PRINT '>>> ================================================================';
PRINT '>>> CREDENCIALES:';
PRINT '>>>   ADMIN     : administrativoJD / Secreto123';
PRINT '>>>   RECEPCION : recepcion.quito  / Recep2025';
PRINT '>>>   HUESPED   : maria.garcia     / Huesped123';
PRINT '>>> ================================================================';
GO
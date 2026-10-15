-- =============================================
-- MESA DE AYUDA - GOBIERNO DE CHILE
-- Script de Base de Datos MySQL
-- Versión: 1.0
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "America/Santiago";

CREATE DATABASE IF NOT EXISTS `helpdesk_gobcl` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `helpdesk_gobcl`;

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `role` ENUM('admin', 'supervisor', 'tecnico') NOT NULL DEFAULT 'tecnico',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: categorias
-- =============================================
CREATE TABLE `categorias` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `visibilidad` ENUM('both', 'internal', 'external') NOT NULL DEFAULT 'both',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: departamentos
-- =============================================
CREATE TABLE `departamentos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `codigo` VARCHAR(20) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: ubicaciones
-- =============================================
CREATE TABLE `ubicaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(300),
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: equipos_soporte
-- =============================================
CREATE TABLE `equipos_soporte` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: equipo_miembros
-- =============================================
CREATE TABLE `equipo_miembros` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `equipo_id` INT(11) NOT NULL,
  `usuario_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`equipo_id`) REFERENCES `equipos_soporte`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: tipos_ticket
-- =============================================
CREATE TABLE `tipos_ticket` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: tickets
-- =============================================
CREATE TABLE `tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
  `asunto` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `solicitante_nombre` VARCHAR(150) NOT NULL,
  `solicitante_email` VARCHAR(150) NOT NULL,
  `categoria_id` INT(11) NOT NULL,
  `prioridad` ENUM('baja', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  `estado` ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado') NOT NULL DEFAULT 'abierto',
  `asignado_a` INT(11) DEFAULT NULL,
  `departamento_id` INT(11) DEFAULT NULL,
  `ubicacion_id` INT(11) DEFAULT NULL,
  `tipo_ticket_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`),
  FOREIGN KEY (`asignado_a`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`departamento_id`) REFERENCES `departamentos`(`id`),
  FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones`(`id`),
  FOREIGN KEY (`tipo_ticket_id`) REFERENCES `tipos_ticket`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: ticket_historial
-- =============================================
CREATE TABLE `ticket_historial` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL,
  `tipo` ENUM('response', 'internal_note', 'status_change', 'assignment') NOT NULL,
  `contenido` TEXT NOT NULL,
  `autor_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`autor_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: articulos_conocimiento
-- =============================================
CREATE TABLE `articulos_conocimiento` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `resumen` TEXT,
  `contenido` LONGTEXT NOT NULL,
  `categoria_id` INT(11) NOT NULL,
  `visibilidad` ENUM('external', 'internal', 'both') NOT NULL DEFAULT 'both',
  `estado` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `autor_id` INT(11) NOT NULL,
  `destacado` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`),
  FOREIGN KEY (`autor_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: articulo_etiquetas
-- =============================================
CREATE TABLE `articulo_etiquetas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `articulo_id` INT(11) NOT NULL,
  `etiqueta` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`articulo_id`) REFERENCES `articulos_conocimiento`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: auditoria
-- =============================================
CREATE TABLE `auditoria` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `accion` VARCHAR(50) NOT NULL,
  `detalles` TEXT,
  `usuario_id` INT(11) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TABLA: configuracion
-- =============================================
CREATE TABLE `configuracion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(100) NOT NULL UNIQUE,
  `valor` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- DATOS SEMILLA
-- =============================================

-- Usuarios (password: admin123 - bcrypt hash)
INSERT INTO `usuarios` (`username`, `password`, `full_name`, `email`, `role`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'Administrador del Sistema', 'admin@gob.cl', 'admin'),
('supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'María González S.', 'supervisor@gob.cl', 'supervisor'),
('tecnico', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'Carlos Muñoz R.', 'tecnico@gob.cl', 'tecnico');

-- Categorías
INSERT INTO `categorias` (`nombre`, `descripcion`, `visibilidad`) VALUES
('Hardware', 'Problemas con equipos y periféricos', 'both'),
('Software', 'Problemas con aplicaciones y sistemas', 'both'),
('Redes y Conectividad', 'Problemas de red, internet y VPN', 'both'),
('Correo Electrónico', 'Problemas con cuentas de correo', 'both'),
('Accesos y Permisos', 'Solicitudes de acceso a sistemas', 'both'),
('Impresoras', 'Problemas con impresoras y escáneres', 'both'),
('Protocolos Internos', 'Guías operativas para funcionarios', 'internal');

-- Departamentos
INSERT INTO `departamentos` (`nombre`, `codigo`) VALUES
('Tecnología e Informática', 'TI'),
('Soporte Técnico', 'ST'),
('Recursos Humanos', 'RRHH'),
('Finanzas', 'FIN'),
('Jurídica', 'JUR'),
('Atención Ciudadana', 'AC');

-- Ubicaciones
INSERT INTO `ubicaciones` (`nombre`, `direccion`) VALUES
('Casa Central - Santiago', 'Morandé 115, Santiago'),
('Sede Norte - Antofagasta', 'Av. Pedro Aguirre Cerda 1234, Antofagasta'),
('Sede Sur - Concepción', 'Av. Colón 987, Concepción'),
('Sede Valparaíso', 'Av. Argentina 456, Valparaíso');

-- Tipos de Ticket
INSERT INTO `tipos_ticket` (`nombre`, `descripcion`) VALUES
('Incidencia', 'Reporte de un problema o falla'),
('Solicitud de Servicio', 'Solicitud de un servicio TI'),
('Consulta', 'Consulta sobre sistemas o procesos'),
('Requerimiento', 'Nuevo requerimiento o funcionalidad');

-- Equipos de Soporte
INSERT INTO `equipos_soporte` (`nombre`, `descripcion`) VALUES
('Equipo Nivel 1 - Soporte Básico', 'Primer nivel de atención'),
('Equipo Nivel 2 - Especialistas', 'Soporte especializado'),
('Equipo de Redes', 'Infraestructura de red');

-- Configuración
INSERT INTO `configuracion` (`clave`, `valor`) VALUES
('system_name', 'Mesa de Ayuda TI'),
('institution', 'Gobierno de Chile'),
('primary_color', '#d4272e'),
('timezone', 'America/Santiago'),
('smtp_host', 'smtp.gob.cl'),
('smtp_port', '587'),
('smtp_user', 'helpdesk@gob.cl'),
('smtp_sender', 'no-reply@gob.cl'),
('smtp_encryption', 'TLS');

-- =============================================
-- CONSULTAS PARA KPIs
-- =============================================

-- Total de tickets
-- SELECT COUNT(*) as total FROM tickets;

-- Tickets abiertos
-- SELECT COUNT(*) as abiertos FROM tickets WHERE estado = 'abierto';

-- Tickets en proceso
-- SELECT COUNT(*) as en_proceso FROM tickets WHERE estado = 'en_proceso';

-- Tickets resueltos
-- SELECT COUNT(*) as resueltos FROM tickets WHERE estado IN ('resuelto', 'cerrado');

-- Críticos activos (urgente o alta sin resolver)
-- SELECT COUNT(*) as criticos FROM tickets WHERE prioridad IN ('urgente', 'alta') AND estado NOT IN ('resuelto', 'cerrado');

-- Sin asignar
-- SELECT COUNT(*) as sin_asignar FROM tickets WHERE asignado_a IS NULL AND estado NOT IN ('resuelto', 'cerrado');

-- Creados hoy
-- SELECT COUNT(*) as creados_hoy FROM tickets WHERE DATE(created_at) = CURDATE();

-- Tiempo promedio de resolución (en horas)
-- SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as prom_horas FROM tickets WHERE resolved_at IS NOT NULL;

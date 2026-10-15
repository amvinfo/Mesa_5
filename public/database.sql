-- =============================================
-- MESA DE AYUDA - GOBIERNO DE CHILE
-- Script de Base de Datos MySQL v2.0
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "America/Santiago";

CREATE DATABASE IF NOT EXISTS `helpdesk_gobcl` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `helpdesk_gobcl`;

-- TABLA: usuarios
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

-- TABLA: categorias
CREATE TABLE `categorias` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `visibilidad` ENUM('both', 'internal', 'external') NOT NULL DEFAULT 'both',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: departamentos
CREATE TABLE `departamentos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `codigo` VARCHAR(20) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: ubicaciones
CREATE TABLE `ubicaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(300),
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: equipos_soporte
CREATE TABLE `equipos_soporte` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: equipo_miembros
CREATE TABLE `equipo_miembros` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `equipo_id` INT(11) NOT NULL,
  `usuario_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`equipo_id`) REFERENCES `equipos_soporte`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: tipos_ticket
CREATE TABLE `tipos_ticket` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: tickets
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

-- TABLA: ticket_historial
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

-- TABLA: articulos_conocimiento
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

-- TABLA: articulo_etiquetas
CREATE TABLE `articulo_etiquetas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `articulo_id` INT(11) NOT NULL,
  `etiqueta` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`articulo_id`) REFERENCES `articulos_conocimiento`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: pizarra_eventos (NUEVO)
CREATE TABLE `pizarra_eventos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` TEXT NOT NULL,
  `autor_id` INT(11) NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT 'blue',
  `pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`autor_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: noticias (NUEVO)
CREATE TABLE `noticias` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` TEXT NOT NULL,
  `categoria` VARCHAR(100) DEFAULT 'General',
  `autor_id` INT(11) NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`autor_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: notificaciones (NUEVO)
CREATE TABLE `notificaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tipo` ENUM('ticket_update', 'ticket_assigned', 'ticket_closed', 'system', 'mention') NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `ticket_id` INT(11) DEFAULT NULL,
  `for_role` ENUM('all', 'admin', 'supervisor', 'tecnico') NOT NULL DEFAULT 'all',
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: email_logs (NUEVO)
CREATE TABLE `email_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `to_email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `template_key` VARCHAR(50) NOT NULL,
  `status` ENUM('sent', 'failed', 'pending') NOT NULL DEFAULT 'sent',
  `ticket_id` INT(11) DEFAULT NULL,
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: email_templates (NUEVO)
CREATE TABLE `email_templates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `clave` VARCHAR(50) NOT NULL UNIQUE,
  `asunto` VARCHAR(255) NOT NULL,
  `html_content` LONGTEXT NOT NULL,
  `text_content` TEXT NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: auditoria
CREATE TABLE `auditoria` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `accion` VARCHAR(50) NOT NULL,
  `detalles` TEXT,
  `usuario_id` INT(11) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: configuracion
CREATE TABLE `configuracion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(100) NOT NULL UNIQUE,
  `valor` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- DATOS SEMILLA
-- =============================================

INSERT INTO `usuarios` (`username`, `password`, `full_name`, `email`, `role`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'Administrador del Sistema', 'admin@gob.cl', 'admin'),
('supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'María González S.', 'supervisor@gob.cl', 'supervisor'),
('tecnico', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u', 'Carlos Muñoz R.', 'tecnico@gob.cl', 'tecnico');

INSERT INTO `categorias` (`nombre`, `descripcion`, `visibilidad`) VALUES
('Hardware', 'Problemas con equipos y periféricos', 'both'),
('Software', 'Problemas con aplicaciones y sistemas', 'both'),
('Redes y Conectividad', 'Problemas de red, internet y VPN', 'both'),
('Correo Electrónico', 'Problemas con cuentas de correo', 'both'),
('Accesos y Permisos', 'Solicitudes de acceso a sistemas', 'both'),
('Impresoras', 'Problemas con impresoras y escáneres', 'both'),
('Protocolos Internos', 'Guías operativas para funcionarios', 'internal');

INSERT INTO `departamentos` (`nombre`, `codigo`) VALUES
('Tecnología e Informática', 'TI'), ('Soporte Técnico', 'ST'),
('Recursos Humanos', 'RRHH'), ('Finanzas', 'FIN'),
('Jurídica', 'JUR'), ('Atención Ciudadana', 'AC');

INSERT INTO `ubicaciones` (`nombre`, `direccion`) VALUES
('Casa Central - Santiago', 'Morandé 115, Santiago'),
('Sede Norte - Antofagasta', 'Av. Pedro Aguirre Cerda 1234'),
('Sede Sur - Concepción', 'Av. Colón 987, Concepción'),
('Sede Valparaíso', 'Av. Argentina 456, Valparaíso');

INSERT INTO `tipos_ticket` (`nombre`, `descripcion`) VALUES
('Incidencia', 'Reporte de un problema o falla'),
('Solicitud de Servicio', 'Solicitud de un servicio TI'),
('Consulta', 'Consulta sobre sistemas o procesos'),
('Requerimiento', 'Nuevo requerimiento o funcionalidad');

INSERT INTO `equipos_soporte` (`nombre`, `descripcion`) VALUES
('Equipo Nivel 1 - Soporte Básico', 'Primer nivel de atención'),
('Equipo Nivel 2 - Especialistas', 'Soporte especializado'),
('Equipo de Redes', 'Infraestructura de red');

INSERT INTO `email_templates` (`nombre`, `clave`, `asunto`, `html_content`, `text_content`) VALUES
('Bienvenida', 'welcome', 'Bienvenido al Sistema de Mesa de Ayuda', '<h1>Bienvenido</h1><p>Su cuenta ha sido creada.</p>', 'Bienvenido. Su cuenta ha sido creada.'),
('Recuperación de Contraseña', 'password_reset', 'Recuperación de contraseña', '<h1>Recuperar</h1><p>Haz clic en el enlace.</p>', 'Recuperar contraseña.'),
('Nuevo Ticket Creado', 'ticket_created', 'Hemos recibido su solicitud #{{ticket_number}}', '<h1>Ticket Recibido</h1><p>Estimado(a) {{requester_name}}, su ticket {{ticket_number}} ha sido recibido.</p>', 'Ticket recibido: {{ticket_number}}'),
('Respuesta del Personal', 'staff_response', 'Actualización de su ticket #{{ticket_number}}', '<h1>Actualización</h1><p>{{response_content}}</p>', 'Actualización de ticket {{ticket_number}}'),
('Notificación de Cierre', 'ticket_closed', 'Su ticket #{{ticket_number}} ha sido cerrado', '<h1>Cerrado</h1><p>Su ticket ha sido resuelto.</p>', 'Ticket {{ticket_number}} cerrado.'),
('Notificación a Funcionarios', 'new_ticket_staff', 'Nuevo ticket: #{{ticket_number}}', '<h1>Nuevo Ticket</h1><p>{{subject}}</p>', 'Nuevo ticket: {{ticket_number}}');

INSERT INTO `configuracion` (`clave`, `valor`) VALUES
('system_name', 'Mesa de Ayuda TI'), ('institution', 'Gobierno de Chile'),
('primary_color', '#d4272e'), ('timezone', 'America/Santiago'),
('brand_name', 'GdC | HELPDESK'), ('window_title', 'Mesa de Ayuda - Gobierno de Chile'),
('language', 'es'), ('date_format', 'dd/MM/yyyy HH:mm'),
('smtp_host', 'smtp.gob.cl'), ('smtp_port', '587'),
('smtp_user', 'helpdesk@gob.cl'), ('smtp_sender', 'no-reply@gob.cl'),
('smtp_encryption', 'TLS'),
('recaptcha_enabled', '0'), ('max_login_attempts', '5'), ('ip_lock_minutes', '15'),
('ticket_response_order', 'newest'), ('ticket_entries_per_page', '15'),
('ticket_sla_hours', '24'), ('ticket_auto_close_days', '7'),
('ticket_allow_attachments', '1'), ('ticket_max_attachments', '5'),
('ticket_max_file_size_mb', '10'), ('ticket_allowed_extensions', 'pdf,jpg,jpeg,png,doc,docx,xls,xlsx,zip'),
('kb_articles_per_category', '10'), ('kb_preview_chars', '150'),
('kb_popular_articles', '5'), ('kb_recent_articles', '5'),
('logo_url', ''), ('password_min_length', '8'),
('password_require_uppercase', '1'), ('password_require_numbers', '1'),
('password_require_special', '0'), ('default_page_size', '15'),
('table_density', 'normal'), ('theme_default', 'light'),
('support_email', 'soporte@gob.cl');

-- TABLA: user_preferences (preferencias de usuario para dashboard)
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `dashboard_layout` TEXT,
  `theme` VARCHAR(20) DEFAULT 'light',
  `table_density` VARCHAR(20) DEFAULT 'normal',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA: translations (traducciones del sistema)
CREATE TABLE IF NOT EXISTS `translations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `language` VARCHAR(10) NOT NULL,
  `key_name` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lang_key` (`language`, `key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar traducciones por defecto
INSERT INTO `translations` (`language`, `key_name`, `value`) VALUES
('es', 'dashboard', 'Panel de Resumen'),
('es', 'tickets', 'Gestión de Tickets'),
('es', 'knowledge', 'Base de Conocimiento'),
('es', 'admin', 'Administración'),
('en', 'dashboard', 'Dashboard'),
('en', 'tickets', 'Ticket Management'),
('en', 'knowledge', 'Knowledge Base'),
('en', 'admin', 'Administration')
ON DUPLICATE KEY UPDATE `value` = `value`;

-- =============================================
-- CONSULTAS PARA KPIs
-- =============================================
-- SELECT COUNT(*) as total FROM tickets;
-- SELECT COUNT(*) as abiertos FROM tickets WHERE estado = 'abierto';
-- SELECT COUNT(*) as en_proceso FROM tickets WHERE estado = 'en_proceso';
-- SELECT COUNT(*) as resueltos FROM tickets WHERE estado IN ('resuelto', 'cerrado');
-- SELECT COUNT(*) as criticos FROM tickets WHERE prioridad IN ('urgente', 'alta') AND estado NOT IN ('resuelto', 'cerrado');
-- SELECT COUNT(*) as sin_asignar FROM tickets WHERE asignado_a IS NULL AND estado NOT IN ('resuelto', 'cerrado');
-- SELECT COUNT(*) as creados_hoy FROM tickets WHERE DATE(created_at) = CURDATE();
-- SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as prom_horas FROM tickets WHERE resolved_at IS NOT NULL;

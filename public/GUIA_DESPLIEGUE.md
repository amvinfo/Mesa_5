# Guía de Despliegue - Mesa de Ayuda GdC

## Requisitos del Servidor
- PHP 7.4+ o superior
- MySQL 5.7+ / MariaDB 10.3+
- cPanel con acceso a phpMyAdmin
- Extensión PHP: PDO, mbstring, json

## Pasos de Despliegue

### 1. Crear Base de Datos
1. Ingresar a cPanel → Bases de Datos MySQL
2. Crear nueva base de datos: `helpdesk_gobcl`
3. Crear usuario y asignar todos los privilegios
4. Abrir phpMyAdmin
5. Seleccionar la base de datos creada
6. Importar el archivo `database.sql`

### 2. Configurar Conexión
Crear archivo `config.php`:
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'helpdesk_gobcl');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
define('DB_CHARSET', 'utf8mb4');
define('SITE_URL', 'https://midominio.gob.cl');
define('TIMEZONE', 'America/Santiago');
?>
```

### 3. Subir Archivos
1. Comprimir todos los archivos del proyecto
2. Subir via File Manager de cPanel a `public_html/`
3. Verificar permisos: carpetas 755, archivos 644

### 4. Credenciales por Defecto
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | admin | admin123 |
| Supervisor | supervisor | admin123 |
| Técnico | tecnico | admin123 |

⚠️ **IMPORTANTE:** Cambiar las contraseñas inmediatamente después del primer acceso.

### 5. Verificación
1. Acceder al portal público: `https://midominio.gob.cl/`
2. Probar creación de ticket desde portal ciudadano
3. Ingresar al panel interno: `https://midominio.gob.cl/login`
4. Verificar que los KPIs se carguen correctamente
5. Probar cada rol (Admin, Supervisor, Técnico)

## Estructura de Archivos
```
public_html/
├── index.php          (Portal público)
├── login.php          (Página de acceso)
├── dashboard.php      (Panel principal)
├── tickets.php        (Gestión de tickets)
├── ticket-detail.php  (Vista de detalle)
├── knowledge.php      (Base de conocimiento)
├── admin/             (Panel de administración)
├── api/               (Endpoints AJAX)
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── includes/
│   ├── config.php
│   ├── db.php
│   ├── auth.php
│   └── functions.php
└── database.sql
```

## Soporte
Para asistencia técnica contacte a la División de Tecnología e Informática del Gobierno de Chile.

# Guía de Despliegue - Mesa de Ayuda GdC v2.0

## Requisitos del Servidor
- PHP 7.4+ o superior
- MySQL 5.7+ / MariaDB 10.3+
- cPanel con acceso a phpMyAdmin
- Extensiones PHP: PDO, mbstring, json, gd (para imágenes)

## Módulos del Sistema

### Portal Público (Ciudadanos)
- Creación inline de tickets sin autenticación
- Consulta de estado de tickets
- Exploración de Base de Conocimiento pública

### Panel Interno (Funcionarios)
- **Dashboard** con 8 KPIs + gráficos (torta/dona y tendencia)
- **Gestión de Tickets** con desglose inline y envío automático de correos
- **Pizarra de Eventos** colaborativa (todos los roles)
- **Zona de Noticias** (edición: Supervisor/Admin)
- **Notificaciones** en tiempo real
- **Registro de Correos** con filtros
- **Base de Conocimiento** (externa/interna)
- **Administración** (solo Admin):
  - Usuarios, Categorías, Departamentos, Sedes, Equipos, Tipos Ticket
  - Configuración del Sitio / Logo
  - Seguridad (reCAPTCHA, intentos login, bloqueo IP)
  - Configuración de Tickets (SLA, adjuntos)
  - Configuración Base de Conocimiento
  - Plantillas de Correo (HTML editable)
  - SMTP
  - Auditoría

## Pasos de Despliegue

### 1. Crear Base de Datos
1. Ingresar a cPanel → Bases de Datos MySQL
2. Crear base de datos: `helpdesk_gobcl`
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
1. Subir via File Manager a `public_html/`
2. Permisos: carpetas 755, archivos 644

### 4. Credenciales por Defecto
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | admin | admin123 |
| Supervisor | supervisor | admin123 |
| Técnico | tecnico | admin123 |

⚠️ **IMPORTANTE:** Cambiar contraseñas inmediatamente.

### 5. Verificación
1. Portal público: `https://midominio.gob.cl/`
2. Panel interno: `https://midominio.gob.cl/login`
3. Verificar KPIs y gráficos
4. Probar cada rol y módulo

## Estructura de Archivos
```
public_html/
├── index.php          (Portal público)
├── login.php          (Acceso funcionarios)
├── dashboard.php      (Panel principal con gráficos)
├── tickets.php        (Gestión con desglose inline)
├── ticket-detail.php  (Vista completa)
├── board.php          (Pizarra colaborativa)
├── news.php           (Zona de noticias)
├── notifications.php  (Panel de notificaciones)
├── emails.php         (Registro de correos)
├── knowledge.php      (Base de conocimiento)
├── admin/             (Administración completa)
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

## Librerías Utilizadas
- Chart.js / Recharts para gráficos
- Tailwind CSS para estilos
- Fetch API para interactividad asíncrona
- date-fns para manejo de fechas

## Soporte
Contacte a la División de Tecnología e Informática del Gobierno de Chile.

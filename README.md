# Sistema Mesa de Ayuda - Gobierno de Chile

## 📦 Estructura del Proyecto

### Archivos PHP (para cPanel)
Los archivos PHP están en la **raíz del proyecto** y deben subirse a `public_html/` en cPanel:

```
public_html/
├── install.php              ← Ejecutar primero para instalar
├── database.sql             ← Script de base de datos
├── index.php                ← Portal Ciudadano (público)
├── login.php                ← Acceso funcionarios
├── logout.php               ← Cerrar sesión
├── dashboard.php            ← Panel con KPIs y gráficos
├── tickets.php              ← Gestión de tickets (desglose inline)
├── ticket-detail.php        ← Vista detallada de ticket
├── board.php                ← Pizarra colaborativa
├── news.php                 ← Zona de Noticias
├── notifications.php        ← Panel de notificaciones
├── emails.php               ← Registro de correos
├── knowledge.php            ← Base de Conocimiento
├── profile.php              ← Mi Perfil
├── admin.php                ← Administración completa
├── includes/                ← Creado automáticamente por install.php
│   ├── config.php          ← Configuración (generada)
│   ├── db.php              ← Conexión BD
│   ├── connection.php      ← PDO
│   ├── auth.php            ← Autenticación
│   ├── functions.php       ← Funciones auxiliares
│   ├── header.php          ← Header común
│   ├── sidebar.php         ← Sidebar común
│   └── footer.php          ← Footer común
├── assets/                  ← Creado automáticamente
│   ├── css/style.css
│   └── js/app.js
└── uploads/                 ← Creado automáticamente
```

## 🚀 Instalación en cPanel

### Paso 1: Subir Archivos
1. Acceda a cPanel → File Manager
2. Navegue a `public_html/`
3. Suba **todos los archivos PHP** desde la raíz del proyecto
4. Suba también `database.sql`

### Paso 2: Ejecutar Instalador
1. Abra su navegador en: `https://sudominio.cl/install.php`
2. Complete el formulario de instalación:
   - Host BD: `localhost`
   - Nombre BD: `helpdesk_gobcl`
   - Usuario BD: (su usuario MySQL)
   - Contraseña BD: (su contraseña)
   - URL del Sitio: `https://sudominio.cl`
   - Contraseña admin: (la que desee)
3. Haga clic en "Instalar Sistema"

### Paso 3: Verificar
1. El instalador crea automáticamente las carpetas `includes/`, `assets/`, `uploads/`
2. Importa el `database.sql` y crea las tablas
3. Genera el archivo `includes/config.php` con sus credenciales
4. ¡Sistema listo para usar!

## 🔐 Credenciales por Defecto

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | admin | admin123 |
| Supervisor | supervisor | admin123 |
| Técnico | tecnico | admin123 |

⚠️ **IMPORTANTE:** Cambie las contraseñas inmediatamente después de instalar.

## 📋 Módulos del Sistema

### Portal Público (index.php)
- Creación inline de tickets sin autenticación
- Consulta de estado de tickets
- Exploración de Base de Conocimiento

### Panel Interno (Funcionarios)
- **Dashboard** con 8 KPIs + gráficos (Chart.js)
- **Gestión de Tickets** con desglose inline (acordeón)
- **Pizarra de Eventos** colaborativa
- **Zona de Noticias** (edición: Supervisor/Admin)
- **Notificaciones** en tiempo real
- **Registro de Correos** con filtros
- **Base de Conocimiento** (externa/interna)
- **Administración** (solo Admin):
  - Usuarios, Categorías, Departamentos, Sedes, Equipos
  - Configuración del Sitio / Logo
  - Seguridad (reCAPTCHA, intentos login, bloqueo IP)
  - Configuración de Tickets (SLA, adjuntos)
  - SMTP
  - Auditoría

## 🛠️ Requisitos del Servidor
- PHP 7.4+ o superior
- MySQL 5.7+ / MariaDB 10.3+
- Extensiones: PDO, PDO_MySQL, JSON, MBString
- cPanel con acceso a phpMyAdmin

## 📝 Notas Técnicas
- Sistema desarrollado en PHP puro (sin frameworks)
- Tailwind CSS via CDN para estilos
- Chart.js para gráficos interactivos
- Fetch API para interactividad asíncrona
- Compatible con WCAG 2.1 AA (accesibilidad)

## 🆘 Soporte
Contacte a la División de Tecnología e Informática del Gobierno de Chile.

---

© 2026 Gobierno de Chile — Mesa de Ayuda TI v2.0

# Sistema Mesa de Ayuda - Gobierno de Chile v2.1

## 📦 Sistema PHP Instalable Completo

### 🚀 Instalación Rápida en cPanel

1. **Suba todos los archivos** a `public_html/` en su cPanel
2. **Acceda a** `https://sudominio.cl/install.php`
3. **Complete** los datos de conexión MySQL
4. **¡Listo!** Sistema instalado y funcionando

---

## 🆕 Novedades v2.1

### Flujo Operacional Mejorado
- ✅ **Notificación automática a soporte central** al crear ticket
- ✅ **Regla de visibilidad por rol**: Técnicos solo ven tickets asignados
- ✅ **Redirección automática** al cerrar/resolver ticket
- ✅ **Correos de avance** automáticos al publicar respuesta pública
- ✅ **Correos de cierre** automáticos al resolver ticket
- ✅ **Notificaciones internas** en tiempo real

### Dashboard Personalizable
- ✅ **4 gráficos interactivos**: Por Estado, Categoría, Prioridad y Tendencia
- ✅ **Modo Claro / Oscuro** configurable por usuario
- ✅ **Densidad de tablas**: Compacta, Normal, Cómoda
- ✅ **Preferencias guardadas** por usuario

### Administración Ampliada
- ✅ **Uploader de Logo Institucional** con preview
- ✅ **Políticas de Contraseñas**: longitud, mayúsculas, números, especiales
- ✅ **Variables dinámicas** en plantillas de correo
- ✅ **Gestión de Traducciones** multilenguaje
- ✅ **Correo de Soporte Central** configurable
- ✅ **reCAPTCHA** configurable
- ✅ **Reenvío de correos** desde el log

---

## 📋 Módulos del Sistema

### Portal Público (index.php)
- Creación inline de tickets sin autenticación
- Consulta de estado de tickets
- Exploración de Base de Conocimiento

### Panel Interno (Funcionarios)

#### 📊 Dashboard
- 8 KPIs en tiempo real
- 4 gráficos Chart.js (Estado, Categoría, Prioridad, Tendencia)
- Personalización de tema y densidad

#### 🎫 Gestión de Tickets
- Desglose inline (acordeón)
- **Visibilidad por rol** (técnicos solo ven asignados)
- Cambio de estado con redirección automática
- Respuesta pública con envío de correo
- Notas internas

#### 📌 Pizarra de Eventos
- Publicaciones colaborativas
- Colores personalizables
- Fijar publicaciones importantes

#### 📰 Zona de Noticias
- Edición exclusiva Supervisor/Admin
- Categorías y estado (publicado/borrador)

#### 🔔 Notificaciones
- Alertas en tiempo real
- Contador de no leídas
- Marcar como leídas / eliminar

#### ✉️ Registro de Correos
- Historial con filtros
- **Reenvío de correos** (Admin)
- Plantillas editables con variables dinámicas

#### 📚 Base de Conocimiento
- Pestañas Externa/Interna
- CRUD con soporte HTML

#### 🔄 Mi Perfil
- Actualización de datos
- Cambio de contraseña

#### ⚙️ Administración (Solo Admin) - 14 secciones:
1. **Usuarios** - CRUD con políticas de contraseña
2. **Categorías** - Visibilidad configurable
3. **Departamentos** - Gestión organizacional
4. **Sedes** - Ubicaciones físicas
5. **Equipos** - Grupos de soporte
6. **Tipos de Ticket** - Configuración
7. **Sitio / Logo** - Branding + uploader de logo
8. **Seguridad** - reCAPTCHA, intentos login, bloqueo IP
9. **Políticas de Clave** - Longitud, mayúsculas, números, especiales
10. **Config. Tickets** - SLA, adjuntos, orden
11. **SMTP** - Configuración de correo
12. **Plantillas** - HTML/texto con variables dinámicas
13. **Traducciones** - Multilenguaje
14. **Auditoría** - Log de acciones

---

## 🔐 Credenciales por Defecto

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | admin | admin123 |
| Supervisor | supervisor | admin123 |
| Técnico | tecnico | admin123 |

⚠️ **Cambie las contraseñas inmediatamente después de instalar.**

---

## 🛠️ Requisitos del Servidor

- PHP 7.4+ o superior
- MySQL 5.7+ / MariaDB 10.3+
- Extensiones: PDO, PDO_MySQL, JSON, MBString
- cPanel con acceso a phpMyAdmin
- Permisos de escritura para `assets/img/`

---

## 📁 Estructura de Archivos

```
public_html/
├── install.php              ← Ejecutar primero
├── database.sql             ← Script de BD (v2.1)
├── index.php                ← Portal Ciudadano
├── login.php / logout.php   ← Autenticación
├── dashboard.php            ← Panel con gráficos
├── tickets.php              ← Gestión con visibilidad por rol
├── ticket-detail.php        ← Vista detallada
├── board.php                ← Pizarra colaborativa
├── news.php                 ← Zona de Noticias
├── notifications.php        ← Notificaciones
├── emails.php               ← Registro + reenvío
├── knowledge.php            ← Base de Conocimiento
├── profile.php              ← Mi Perfil
├── admin.php                ← Administración (14 secciones)
├── includes/                ← Creado por install.php
│   ├── config.php          ← Configuración (generada)
│   ├── db.php / connection.php
│   ├── auth.php            ← Autenticación
│   ├── functions.php       ← Funciones + notificaciones
│   ├── header.php / sidebar.php / footer.php
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── img/                ← Logos subidos
```

---

## 📧 Flujo de Notificaciones por Correo

1. **Creación de Ticket** → Correo a soporte central + confirmación al solicitante
2. **Respuesta Pública** → Correo de avance al solicitante
3. **Cierre/Resolución** → Correo de cierre al solicitante + redirección automática
4. **Notificaciones Internas** → Centro de notificaciones con contador

---

## 🎨 Variables en Plantillas de Correo

| Variable | Descripción |
|----------|-------------|
| `{TICKET_CODE}` | Número de ticket |
| `{SOLICITANTE}` | Nombre del solicitante |
| `{ASUNTO}` | Asunto del ticket |
| `{MENSAJE}` | Contenido de la respuesta |
| `{LINK}` | Enlace al ticket |

---

## 📝 Notas Técnicas

- Sistema desarrollado en **PHP puro** (sin frameworks)
- **Tailwind CSS** via CDN
- **Chart.js** para gráficos interactivos
- Compatible con **WCAG 2.1 AA** (accesibilidad)
- Arquitectura modular lista para cPanel

---

## 🆘 Soporte

Contacte a la División de Tecnología e Informática del Gobierno de Chile.

---

© 2026 Gobierno de Chile — Mesa de Ayuda TI v2.1

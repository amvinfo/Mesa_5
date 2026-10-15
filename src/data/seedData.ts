export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'admin' | 'supervisor' | 'tecnico';
  active: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  category: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  assignedTo: string | null;
  department: string;
  location: string;
  ticketType: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  attachments: string[];
  history: TicketHistory[];
}

export interface TicketHistory {
  id: string;
  type: 'response' | 'internal_note' | 'status_change' | 'assignment';
  content: string;
  author: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  visibility: 'external' | 'internal' | 'both';
  status: 'draft' | 'published';
  tags: string[];
  keywords: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  visibility: 'both' | 'internal' | 'external';
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

export interface SupportTeam {
  id: string;
  name: string;
  description: string;
  members: string[];
  active: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  sender: string;
  encryption: string;
}

export interface SystemConfig {
  systemName: string;
  institution: string;
  primaryColor: string;
  timezone: string;
  brandName: string;
  windowTitle: string;
  language: string;
  dateFormat: string;
  logoUrl: string;
  smtp: SMTPConfig;
  security: SecurityConfig;
  ticketConfig: TicketConfig;
  kbConfig: KBConfig;
}

export interface SecurityConfig {
  recaptchaEnabled: boolean;
  recaptchaSiteKey: string;
  recaptchaPrivateKey: string;
  maxLoginAttempts: number;
  ipLockMinutes: number;
}

export interface TicketConfig {
  responseOrder: 'newest' | 'oldest';
  entriesPerPage: number;
  slaHours: number;
  autoCloseDays: number;
  allowAttachments: boolean;
  maxAttachments: number;
  maxFileSizeMB: number;
  allowedExtensions: string;
}

export interface KBConfig {
  articlesPerCategory: number;
  previewChars: number;
  popularArticles: number;
  recentArticles: number;
}

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export interface Notification {
  id: string;
  type: 'ticket_update' | 'ticket_assigned' | 'ticket_closed' | 'system' | 'mention';
  title: string;
  message: string;
  ticketId?: string;
  read: boolean;
  createdAt: string;
  forRole: 'all' | 'admin' | 'supervisor' | 'tecnico';
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  ticketId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  key: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  enabled: boolean;
  updatedAt: string;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const seedUsers: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', fullName: 'Administrador del Sistema', email: 'admin@gob.cl', role: 'admin', active: true, createdAt: daysAgo(90) },
  { id: 'u2', username: 'supervisor', password: 'admin123', fullName: 'María González S.', email: 'supervisor@gob.cl', role: 'supervisor', active: true, createdAt: daysAgo(60) },
  { id: 'u3', username: 'tecnico', password: 'admin123', fullName: 'Carlos Muñoz R.', email: 'tecnico@gob.cl', role: 'tecnico', active: true, createdAt: daysAgo(45) },
];

export const seedCategories: Category[] = [
  { id: 'c1', name: 'Hardware', description: 'Problemas con equipos y periféricos', visibility: 'both', active: true },
  { id: 'c2', name: 'Software', description: 'Problemas con aplicaciones y sistemas', visibility: 'both', active: true },
  { id: 'c3', name: 'Redes y Conectividad', description: 'Problemas de red, internet y VPN', visibility: 'both', active: true },
  { id: 'c4', name: 'Correo Electrónico', description: 'Problemas con cuentas de correo', visibility: 'both', active: true },
  { id: 'c5', name: 'Accesos y Permisos', description: 'Solicitudes de acceso a sistemas', visibility: 'both', active: true },
  { id: 'c6', name: 'Impresoras', description: 'Problemas con impresoras y escáneres', visibility: 'both', active: true },
  { id: 'c7', name: 'Protocolos Internos', description: 'Guías operativas para funcionarios', visibility: 'internal', active: true },
];

export const seedDepartments: Department[] = [
  { id: 'd1', name: 'Tecnología e Informática', code: 'TI', active: true },
  { id: 'd2', name: 'Soporte Técnico', code: 'ST', active: true },
  { id: 'd3', name: 'Recursos Humanos', code: 'RRHH', active: true },
  { id: 'd4', name: 'Finanzas', code: 'FIN', active: true },
  { id: 'd5', name: 'Jurídica', code: 'JUR', active: true },
  { id: 'd6', name: 'Atención Ciudadana', code: 'AC', active: true },
];

export const seedLocations: Location[] = [
  { id: 'l1', name: 'Casa Central - Santiago', address: 'Morandé 115, Santiago', active: true },
  { id: 'l2', name: 'Sede Norte - Antofagasta', address: 'Av. Pedro Aguirre Cerda 1234, Antofagasta', active: true },
  { id: 'l3', name: 'Sede Sur - Concepción', address: 'Av. Colón 987, Concepción', active: true },
  { id: 'l4', name: 'Sede Valparaíso', address: 'Av. Argentina 456, Valparaíso', active: true },
];

export const seedTeams: SupportTeam[] = [
  { id: 't1', name: 'Equipo Nivel 1 - Soporte Básico', description: 'Primer nivel de atención', members: ['u3'], active: true },
  { id: 't2', name: 'Equipo Nivel 2 - Especialistas', description: 'Soporte especializado', members: ['u2', 'u3'], active: true },
  { id: 't3', name: 'Equipo de Redes', description: 'Infraestructura de red', members: ['u3'], active: true },
];

export const seedTicketTypes: TicketType[] = [
  { id: 'tt1', name: 'Incidencia', description: 'Reporte de un problema o falla', active: true },
  { id: 'tt2', name: 'Solicitud de Servicio', description: 'Solicitud de un servicio TI', active: true },
  { id: 'tt3', name: 'Consulta', description: 'Consulta sobre sistemas o procesos', active: true },
  { id: 'tt4', name: 'Requerimiento', description: 'Nuevo requerimiento o funcionalidad', active: true },
];

export const seedTickets: Ticket[] = [
  {
    id: 'tk1', ticketNumber: 'TKT-2026-00001', subject: 'Computador no enciende', description: 'El equipo de escritorio de mi puesto no enciende al presionar el botón de poder.',
    requesterName: 'Juan Pérez', requesterEmail: 'juan.perez@ciudadano.cl', category: 'Hardware', priority: 'alta', status: 'en_proceso', assignedTo: 'u3', department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(5), updatedAt: daysAgo(1), resolvedAt: null, attachments: [],
    history: [
      { id: 'h1', type: 'response', content: 'Se revisa el equipo. Parece ser un problema con la fuente de poder. Se solicita reemplazo.', author: 'Carlos Muñoz R.', createdAt: daysAgo(3) },
      { id: 'h2', type: 'internal_note', content: 'Fuente de poder quemada. Pedir repuesto a bodega.', author: 'Carlos Muñoz R.', createdAt: daysAgo(2) },
    ]
  },
  {
    id: 'tk2', ticketNumber: 'TKT-2026-00002', subject: 'No puedo acceder al sistema de correos', description: 'Desde ayer no puedo ingresar a mi correo institucional.',
    requesterName: 'Ana Martínez', requesterEmail: 'ana.martinez@ciudadano.cl', category: 'Correo Electrónico', priority: 'media', status: 'resuelto', assignedTo: 'u3', department: 'Finanzas', location: 'Sede Valparaíso', ticketType: 'Incidencia',
    createdAt: daysAgo(7), updatedAt: daysAgo(2), resolvedAt: daysAgo(2), attachments: [],
    history: [
      { id: 'h3', type: 'response', content: 'Se resetea la contraseña y se envía nueva por correo alternativo.', author: 'Carlos Muñoz R.', createdAt: daysAgo(4) },
      { id: 'h4', type: 'status_change', content: 'Estado cambiado a Resuelto', author: 'Carlos Muñoz R.', createdAt: daysAgo(2) },
    ]
  },
  {
    id: 'tk3', ticketNumber: 'TKT-2026-00003', subject: 'Solicitud de instalación de software', description: 'Necesito que instalen Adobe Illustrator en mi computador.',
    requesterName: 'Pedro Soto', requesterEmail: 'pedro.soto@ciudadano.cl', category: 'Software', priority: 'baja', status: 'abierto', assignedTo: null, department: 'Atención Ciudadana', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(1), updatedAt: daysAgo(1), resolvedAt: null, attachments: [], history: []
  },
  {
    id: 'tk4', ticketNumber: 'TKT-2026-00004', subject: 'Internet intermitente en oficina', description: 'La conexión a internet se cae constantemente en el piso 3.',
    requesterName: 'Laura Díaz', requesterEmail: 'laura.diaz@ciudadano.cl', category: 'Redes y Conectividad', priority: 'urgente', status: 'en_proceso', assignedTo: 'u3', department: 'Tecnología e Informática', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: [{ id: 'h5', type: 'assignment', content: 'Ticket asignado a Equipo de Redes', author: 'María González S.', createdAt: daysAgo(0) }]
  },
  {
    id: 'tk5', ticketNumber: 'TKT-2026-00005', subject: 'Impresora atascada', description: 'La impresora HP del piso 2 tiene papel atascado.',
    requesterName: 'Roberto Fuentes', requesterEmail: 'roberto.fuentes@ciudadano.cl', category: 'Impresoras', priority: 'media', status: 'abierto', assignedTo: null, department: 'Jurídica', location: 'Sede Sur - Concepción', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [], history: []
  },
  {
    id: 'tk6', ticketNumber: 'TKT-2026-00006', subject: 'Solicitud de acceso a sistema SIGE', description: 'Necesito acceso al sistema SIGE para mi nuevo cargo.',
    requesterName: 'Camila Rojas', requesterEmail: 'camila.rojas@ciudadano.cl', category: 'Accesos y Permisos', priority: 'media', status: 'abierto', assignedTo: null, department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [], history: []
  },
  {
    id: 'tk7', ticketNumber: 'TKT-2026-00007', subject: 'Monitor parpadea constantemente', description: 'El monitor de mi puesto parpadea y dificulta trabajar.',
    requesterName: 'Miguel Ángel Torres', requesterEmail: 'miguel.torres@ciudadano.cl', category: 'Hardware', priority: 'media', status: 'resuelto', assignedTo: 'u3', department: 'Finanzas', location: 'Sede Norte - Antofagasta', ticketType: 'Incidencia',
    createdAt: daysAgo(10), updatedAt: daysAgo(3), resolvedAt: daysAgo(3), attachments: [],
    history: [
      { id: 'h6', type: 'response', content: 'Se reemplaza el cable VGA y se ajusta la frecuencia.', author: 'Carlos Muñoz R.', createdAt: daysAgo(5) },
      { id: 'h7', type: 'status_change', content: 'Estado cambiado a Resuelto', author: 'Carlos Muñoz R.', createdAt: daysAgo(3) },
    ]
  },
  {
    id: 'tk8', ticketNumber: 'TKT-2026-00008', subject: 'Consulta sobre backup de archivos', description: 'Quisiera saber cómo funciona el sistema de respaldo.',
    requesterName: 'Francisca López', requesterEmail: 'francisca.lopez@ciudadano.cl', category: 'Software', priority: 'baja', status: 'cerrado', assignedTo: 'u2', department: 'Tecnología e Informática', location: 'Casa Central - Santiago', ticketType: 'Consulta',
    createdAt: daysAgo(15), updatedAt: daysAgo(10), resolvedAt: daysAgo(10), attachments: [],
    history: [
      { id: 'h8', type: 'response', content: 'El backup se ejecuta automáticamente cada noche a las 23:00 hrs.', author: 'María González S.', createdAt: daysAgo(12) },
      { id: 'h9', type: 'status_change', content: 'Estado cambiado a Cerrado', author: 'María González S.', createdAt: daysAgo(10) },
    ]
  },
  {
    id: 'tk9', ticketNumber: 'TKT-2026-00009', subject: 'Sistema lento al abrir archivos', description: 'Mi computador está muy lento.',
    requesterName: 'Diego Vargas', requesterEmail: 'diego.vargas@ciudadano.cl', category: 'Software', priority: 'media', status: 'en_proceso', assignedTo: 'u3', department: 'Atención Ciudadana', location: 'Sede Sur - Concepción', ticketType: 'Incidencia',
    createdAt: daysAgo(2), updatedAt: daysAgo(1), resolvedAt: null, attachments: [],
    history: [{ id: 'h10', type: 'internal_note', content: 'Revisar si hay malware. Programar limpieza.', author: 'Carlos Muñoz R.', createdAt: daysAgo(1) }]
  },
  {
    id: 'tk10', ticketNumber: 'TKT-2026-00010', subject: 'Necesito nuevo teclado', description: 'El teclado tiene varias teclas que no funcionan.',
    requesterName: 'Valentina Castro', requesterEmail: 'valentina.castro@ciudadano.cl', category: 'Hardware', priority: 'baja', status: 'abierto', assignedTo: null, department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [], history: []
  },
  {
    id: 'tk11', ticketNumber: 'TKT-2026-00011', subject: 'Error al imprimir desde sistema', description: 'Cuando imprimo desde SIGE sale error.',
    requesterName: 'Andrés Morales', requesterEmail: 'andres.morales@ciudadano.cl', category: 'Impresoras', priority: 'alta', status: 'abierto', assignedTo: null, department: 'Finanzas', location: 'Sede Valparaíso', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [], history: []
  },
  {
    id: 'tk12', ticketNumber: 'TKT-2026-00012', subject: 'VPN no conecta desde casa', description: 'No puedo conectarme a la VPN institucional.',
    requesterName: 'Sofía Herrera', requesterEmail: 'sofia.herrera@ciudadano.cl', category: 'Redes y Conectividad', priority: 'urgente', status: 'en_proceso', assignedTo: 'u3', department: 'Jurídica', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: [{ id: 'h11', type: 'response', content: 'Se verifica configuración VPN. Reiniciar cliente.', author: 'Carlos Muñoz R.', createdAt: daysAgo(0) }]
  },
];

export const seedArticles: KnowledgeArticle[] = [
  {
    id: 'a1', title: 'Cómo resetear tu contraseña de correo institucional', summary: 'Guía paso a paso para restablecer tu contraseña.',
    content: '<h2>Resetear contraseña</h2><p>1. Ingresa a correo.gob.cl</p><p>2. Haz clic en "¿Olvidaste tu contraseña?"</p><p>3. Ingresa tu RUT y correo alternativo</p><p>4. Revisa tu correo y sigue las instrucciones</p>',
    category: 'Correo Electrónico', visibility: 'both', status: 'published', tags: ['correo', 'contraseña'], keywords: ['password', 'reset'], featured: true, createdAt: daysAgo(30), updatedAt: daysAgo(5), author: 'María González S.'
  },
  {
    id: 'a2', title: 'Conexión a VPN institucional', summary: 'Instrucciones para configurar y conectar la VPN.',
    content: '<h2>Configuración VPN</h2><p>1. Descarga el cliente VPN</p><p>2. Instálalo siguiendo las instrucciones</p><p>3. Ingresa tu usuario y contraseña</p><p>4. Selecciona el servidor más cercano</p>',
    category: 'Redes y Conectividad', visibility: 'both', status: 'published', tags: ['vpn', 'remoto'], keywords: ['vpn', 'remote'], featured: true, createdAt: daysAgo(25), updatedAt: daysAgo(10), author: 'Carlos Muñoz R.'
  },
  {
    id: 'a3', title: 'Protocolo de respuesta ante incidentes críticos', summary: 'Procedimiento interno para incidentes de seguridad.',
    content: '<h2>Protocolo</h2><p><strong>Nivel 1:</strong> Notificación al supervisor</p><p><strong>Nivel 2:</strong> Escalamiento al equipo de seguridad</p><p><strong>Nivel 3:</strong> Activación del plan de contingencia</p>',
    category: 'Protocolos Internos', visibility: 'internal', status: 'published', tags: ['incidentes', 'seguridad'], keywords: ['incident', 'security'], featured: false, createdAt: daysAgo(20), updatedAt: daysAgo(15), author: 'Administrador del Sistema'
  },
  {
    id: 'a4', title: 'Cómo solicitar un nuevo equipo computacional', summary: 'Proceso para solicitar adquisición de hardware.',
    content: '<h2>Solicitud de Equipos</h2><p>1. Completa el formulario</p><p>2. Obtén aprobación del jefe directo</p><p>3. Envía a adquisiciones</p><p>4. Tiempo estimado: 15 días hábiles</p>',
    category: 'Hardware', visibility: 'both', status: 'published', tags: ['hardware', 'solicitud'], keywords: ['equipment', 'request'], featured: false, createdAt: daysAgo(18), updatedAt: daysAgo(8), author: 'María González S.'
  },
  {
    id: 'a5', title: 'Guía de instalación de software autorizado', summary: 'Lista de software autorizado y procedimiento.',
    content: '<h2>Software Autorizado</h2><ul><li>Microsoft Office 365</li><li>Adobe Acrobat Reader</li><li>Antivirus institucional</li><li>Navegadores web</li></ul>',
    category: 'Software', visibility: 'both', status: 'published', tags: ['software', 'instalación'], keywords: ['software', 'install'], featured: true, createdAt: daysAgo(15), updatedAt: daysAgo(3), author: 'Carlos Muñoz R.'
  },
];

export const seedAuditLogs: AuditLog[] = [
  { id: 'al1', action: 'LOGIN', details: 'Inicio de sesión exitoso', user: 'admin', timestamp: daysAgo(0) },
  { id: 'al2', action: 'TICKET_CREATE', details: 'Ticket TKT-2026-00012 creado', user: 'Sistema', timestamp: daysAgo(0) },
  { id: 'al3', action: 'TICKET_ASSIGN', details: 'Ticket TKT-2026-00004 asignado', user: 'supervisor', timestamp: daysAgo(0) },
  { id: 'al4', action: 'USER_UPDATE', details: 'Perfil actualizado: Carlos Muñoz R.', user: 'tecnico', timestamp: daysAgo(1) },
  { id: 'al5', action: 'TICKET_RESOLVE', details: 'Ticket TKT-2026-00002 resuelto', user: 'tecnico', timestamp: daysAgo(2) },
  { id: 'al6', action: 'CONFIG_CHANGE', details: 'Configuración SMTP actualizada', user: 'admin', timestamp: daysAgo(5) },
];

export const seedBoardPosts: BoardPost[] = [
  { id: 'bp1', title: '🔧 Mantención programada servidores', content: 'Este sábado 15 de junio se realizará mantención de servidores desde las 22:00 hrs. Se estima una interrupción de 2 horas.', author: 'María González S.', authorId: 'u2', pinned: true, createdAt: daysAgo(1), updatedAt: daysAgo(1), color: 'blue' },
  { id: 'bp2', title: '📋 Recordatorio: Actualizar tickets pendientes', content: 'Favor revisar y actualizar todos los tickets abiertos antes del viernes. Los tickets sin actualización por más de 5 días serán escalados.', author: 'María González S.', authorId: 'u2', pinned: true, createdAt: daysAgo(2), updatedAt: daysAgo(2), color: 'yellow' },
  { id: 'bp3', title: '🎉 Felicitaciones al equipo', content: 'Excelente trabajo esta semana. Logramos resolver el 95% de los tickets dentro del SLA. ¡Sigamos así!', author: 'Administrador del Sistema', authorId: 'u1', pinned: false, createdAt: daysAgo(3), updatedAt: daysAgo(3), color: 'green' },
  { id: 'bp4', title: '💡 Nuevo protocolo de escalamiento', content: 'Se ha publicado el nuevo protocolo de escalamiento para tickets urgentes. Revisar en Base de Conocimiento > Protocolos Internos.', author: 'Carlos Muñoz R.', authorId: 'u3', pinned: false, createdAt: daysAgo(4), updatedAt: daysAgo(4), color: 'purple' },
];

export const seedNews: NewsItem[] = [
  { id: 'n1', title: 'Nuevo sistema de gestión de tickets implementado', content: 'El Gobierno de Chile ha implementado un nuevo sistema de Mesa de Ayuda para mejorar la atención y trazabilidad de las solicitudes de soporte técnico institucional.', author: 'Administrador del Sistema', published: true, createdAt: daysAgo(5), updatedAt: daysAgo(5), category: 'Institucional' },
  { id: 'n2', title: 'Capacitación en ciberseguridad - Junio 2026', content: 'Se invita a todos los funcionarios a participar en la jornada de capacitación en buenas prácticas de ciberseguridad que se realizará el próximo 20 de junio.', author: 'María González S.', published: true, createdAt: daysAgo(3), updatedAt: daysAgo(3), category: 'Capacitación' },
  { id: 'n3', title: 'Actualización de políticas de seguridad informática', content: 'Se han actualizado las políticas de seguridad informática institucionales. Todos los funcionarios deben revisar y aceptar los nuevos términos antes del 30 de junio.', author: 'Administrador del Sistema', published: true, createdAt: daysAgo(7), updatedAt: daysAgo(7), category: 'Seguridad' },
];

export const seedNotifications: Notification[] = [
  { id: 'notif1', type: 'ticket_update', title: 'Ticket actualizado', message: 'TKT-2026-00004 ha sido actualizado por Carlos Muñoz R.', ticketId: 'tk4', read: false, createdAt: hoursAgo(1), forRole: 'all' },
  { id: 'notif2', type: 'ticket_assigned', title: 'Nuevo ticket asignado', message: 'Se te ha asignado el ticket TKT-2026-00012', ticketId: 'tk12', read: false, createdAt: hoursAgo(2), forRole: 'tecnico' },
  { id: 'notif3', type: 'ticket_closed', title: 'Ticket cerrado', message: 'TKT-2026-00008 ha sido cerrado por María González S.', ticketId: 'tk8', read: true, createdAt: daysAgo(10), forRole: 'all' },
  { id: 'notif4', type: 'system', title: 'Mantención programada', message: 'Se realizará mantención del sistema el sábado 15 de junio.', read: false, createdAt: daysAgo(1), forRole: 'all' },
  { id: 'notif5', type: 'ticket_update', title: 'Ticket crítico sin asignar', message: 'TKT-2026-00011 (Prioridad Alta) lleva 2 horas sin asignación.', ticketId: 'tk11', read: false, createdAt: hoursAgo(2), forRole: 'supervisor' },
];

export const seedEmailLogs: EmailLog[] = [
  { id: 'el1', to: 'juan.perez@ciudadano.cl', subject: 'Actualización de su ticket TKT-2026-00001', template: 'staff_response', status: 'sent', sentAt: daysAgo(3), ticketId: 'tk1' },
  { id: 'el2', to: 'ana.martinez@ciudadano.cl', subject: 'Su ticket TKT-2026-00002 ha sido resuelto', template: 'ticket_closed', status: 'sent', sentAt: daysAgo(2), ticketId: 'tk2' },
  { id: 'el3', to: 'sofia.herrera@ciudadano.cl', subject: 'Hemos recibido su ticket TKT-2026-00012', template: 'ticket_created', status: 'sent', sentAt: daysAgo(0), ticketId: 'tk12' },
  { id: 'el4', to: 'laura.diaz@ciudadano.cl', subject: 'Hemos recibido su ticket TKT-2026-00004', template: 'ticket_created', status: 'sent', sentAt: daysAgo(0), ticketId: 'tk4' },
  { id: 'el5', to: 'miguel.torres@ciudadano.cl', subject: 'Su ticket TKT-2026-00007 ha sido resuelto', template: 'ticket_closed', status: 'sent', sentAt: daysAgo(3), ticketId: 'tk7' },
  { id: 'el6', to: 'diego.vargas@ciudadano.cl', subject: 'Actualización de su ticket TKT-2026-00009', template: 'staff_response', status: 'failed', sentAt: daysAgo(1), ticketId: 'tk9' },
];

export const seedEmailTemplates: EmailTemplate[] = [
  { id: 'et1', name: 'Bienvenida', key: 'welcome', subject: 'Bienvenido al Sistema de Mesa de Ayuda - Gobierno de Chile', htmlContent: '<h1>Bienvenido</h1><p>Su cuenta ha sido creada exitosamente.</p>', textContent: 'Bienvenido. Su cuenta ha sido creada exitosamente.', enabled: true, updatedAt: daysAgo(30) },
  { id: 'et2', name: 'Recuperación de Contraseña', key: 'password_reset', subject: 'Recuperación de contraseña - Mesa de Ayuda GdC', htmlContent: '<h1>Recuperar Contraseña</h1><p>Haz clic en el siguiente enlace para restablecer tu contraseña.</p>', textContent: 'Recuperar contraseña. Haz clic en el enlace.', enabled: true, updatedAt: daysAgo(20) },
  { id: 'et3', name: 'Nuevo Ticket Creado', key: 'ticket_created', subject: 'Hemos recibido su solicitud #{{ticket_number}}', htmlContent: '<h1>Ticket Recibido</h1><p>Estimado(a) {{requester_name}},</p><p>Hemos recibido su solicitud con número <strong>{{ticket_number}}</strong>.</p><p>Nuestro equipo la revisará a la brevedad.</p>', textContent: 'Ticket recibido. Número: {{ticket_number}}', enabled: true, updatedAt: daysAgo(10) },
  { id: 'et4', name: 'Respuesta del Personal', key: 'staff_response', subject: 'Actualización de su ticket #{{ticket_number}}', htmlContent: '<h1>Actualización de Ticket</h1><p>Estimado(a) {{requester_name}},</p><p>Hay una nueva actualización en su ticket <strong>{{ticket_number}}</strong>.</p><p>{{response_content}}</p>', textContent: 'Actualización de ticket {{ticket_number}}', enabled: true, updatedAt: daysAgo(5) },
  { id: 'et5', name: 'Notificación de Cierre', key: 'ticket_closed', subject: 'Su ticket #{{ticket_number}} ha sido cerrado', htmlContent: '<h1>Ticket Cerrado</h1><p>Estimado(a) {{requester_name}},</p><p>Su ticket <strong>{{ticket_number}}</strong> ha sido resuelto y cerrado.</p><p>Si el problema persiste, no dude en crear un nuevo ticket.</p>', textContent: 'Ticket {{ticket_number}} cerrado.', enabled: true, updatedAt: daysAgo(5) },
  { id: 'et6', name: 'Notificación a Funcionarios', key: 'new_ticket_staff', subject: 'Nuevo ticket ingresado: #{{ticket_number}}', htmlContent: '<h1>Nuevo Ticket</h1><p>Se ha ingresado un nuevo ticket al sistema.</p><p><strong>Número:</strong> {{ticket_number}}</p><p><strong>Asunto:</strong> {{subject}}</p>', textContent: 'Nuevo ticket: {{ticket_number}}', enabled: true, updatedAt: daysAgo(15) },
];

export const defaultSystemConfig: SystemConfig = {
  systemName: 'Mesa de Ayuda TI',
  institution: 'Gobierno de Chile',
  primaryColor: '#d4272e',
  timezone: 'America/Santiago',
  brandName: 'GdC | HELPDESK',
  windowTitle: 'Mesa de Ayuda - Gobierno de Chile',
  language: 'es',
  dateFormat: 'dd/MM/yyyy HH:mm',
  logoUrl: '',
  smtp: {
    host: 'smtp.gob.cl',
    port: 587,
    username: 'helpdesk@gob.cl',
    sender: 'no-reply@gob.cl',
    encryption: 'TLS'
  },
  security: {
    recaptchaEnabled: false,
    recaptchaSiteKey: '',
    recaptchaPrivateKey: '',
    maxLoginAttempts: 5,
    ipLockMinutes: 15
  },
  ticketConfig: {
    responseOrder: 'newest',
    entriesPerPage: 15,
    slaHours: 24,
    autoCloseDays: 7,
    allowAttachments: true,
    maxAttachments: 5,
    maxFileSizeMB: 10,
    allowedExtensions: 'pdf,jpg,jpeg,png,doc,docx,xls,xlsx,zip'
  },
  kbConfig: {
    articlesPerCategory: 10,
    previewChars: 150,
    popularArticles: 5,
    recentArticles: 5
  }
};

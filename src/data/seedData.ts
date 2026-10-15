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
  smtp: SMTPConfig;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

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
    id: 'tk1', ticketNumber: 'TKT-2026-00001', subject: 'Computador no enciende', description: 'El equipo de escritorio de mi puesto no enciende al presionar el botón de poder. Ya verifiqué que el cable esté conectado.',
    requesterName: 'Juan Pérez', requesterEmail: 'juan.perez@ciudadano.cl', category: 'Hardware', priority: 'alta', status: 'en_proceso', assignedTo: 'u3', department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(5), updatedAt: daysAgo(1), resolvedAt: null, attachments: [],
    history: [
      { id: 'h1', type: 'response', content: 'Se revisa el equipo. Parece ser un problema con la fuente de poder. Se solicita reemplazo.', author: 'Carlos Muñoz R.', createdAt: daysAgo(3) },
      { id: 'h2', type: 'internal_note', content: 'Fuente de poder quemada. Pedir repuesto a bodega.', author: 'Carlos Muñoz R.', createdAt: daysAgo(2) },
    ]
  },
  {
    id: 'tk2', ticketNumber: 'TKT-2026-00002', subject: 'No puedo acceder al sistema de correos', description: 'Desde ayer no puedo ingresar a mi correo institucional. Me dice contraseña incorrecta pero estoy segura de que es la correcta.',
    requesterName: 'Ana Martínez', requesterEmail: 'ana.martinez@ciudadano.cl', category: 'Correo Electrónico', priority: 'media', status: 'resuelto', assignedTo: 'u3', department: 'Finanzas', location: 'Sede Valparaíso', ticketType: 'Incidencia',
    createdAt: daysAgo(7), updatedAt: daysAgo(2), resolvedAt: daysAgo(2), attachments: [],
    history: [
      { id: 'h3', type: 'response', content: 'Se resetea la contraseña y se envía nueva por correo alternativo.', author: 'Carlos Muñoz R.', createdAt: daysAgo(4) },
      { id: 'h4', type: 'status_change', content: 'Estado cambiado a Resuelto', author: 'Carlos Muñoz R.', createdAt: daysAgo(2) },
    ]
  },
  {
    id: 'tk3', ticketNumber: 'TKT-2026-00003', subject: 'Solicitud de instalación de software', description: 'Necesito que instalen el programa de diseño gráfico Adobe Illustrator en mi computador para las tareas de la unidad.',
    requesterName: 'Pedro Soto', requesterEmail: 'pedro.soto@ciudadano.cl', category: 'Software', priority: 'baja', status: 'abierto', assignedTo: null, department: 'Atención Ciudadana', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(1), updatedAt: daysAgo(1), resolvedAt: null, attachments: [],
    history: []
  },
  {
    id: 'tk4', ticketNumber: 'TKT-2026-00004', subject: 'Internet intermitente en oficina', description: 'La conexión a internet se cae constantemente en el piso 3. Afecta a todo el departamento.',
    requesterName: 'Laura Díaz', requesterEmail: 'laura.diaz@ciudadano.cl', category: 'Redes y Conectividad', priority: 'urgente', status: 'en_proceso', assignedTo: 'u3', department: 'Tecnología e Informática', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: [
      { id: 'h5', type: 'assignment', content: 'Ticket asignado a Equipo de Redes', author: 'María González S.', createdAt: daysAgo(0) },
    ]
  },
  {
    id: 'tk5', ticketNumber: 'TKT-2026-00005', subject: 'Impresora atascada', description: 'La impresora HP del piso 2 tiene papel atascado y no podemos sacarlo.',
    requesterName: 'Roberto Fuentes', requesterEmail: 'roberto.fuentes@ciudadano.cl', category: 'Impresoras', priority: 'media', status: 'abierto', assignedTo: null, department: 'Jurídica', location: 'Sede Sur - Concepción', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: []
  },
  {
    id: 'tk6', ticketNumber: 'TKT-2026-00006', subject: 'Solicitud de acceso a sistema SIGE', description: 'Necesito acceso al sistema SIGE para realizar las funciones de mi nuevo cargo.',
    requesterName: 'Camila Rojas', requesterEmail: 'camila.rojas@ciudadano.cl', category: 'Accesos y Permisos', priority: 'media', status: 'abierto', assignedTo: null, department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: []
  },
  {
    id: 'tk7', ticketNumber: 'TKT-2026-00007', subject: 'Monitor parpadea constantemente', description: 'El monitor de mi puesto de trabajo parpadea y hace que sea difícil trabajar.',
    requesterName: 'Miguel Ángel Torres', requesterEmail: 'miguel.torres@ciudadano.cl', category: 'Hardware', priority: 'media', status: 'resuelto', assignedTo: 'u3', department: 'Finanzas', location: 'Sede Norte - Antofagasta', ticketType: 'Incidencia',
    createdAt: daysAgo(10), updatedAt: daysAgo(3), resolvedAt: daysAgo(3), attachments: [],
    history: [
      { id: 'h6', type: 'response', content: 'Se reemplaza el cable VGA y se ajusta la frecuencia de actualización.', author: 'Carlos Muñoz R.', createdAt: daysAgo(5) },
      { id: 'h7', type: 'status_change', content: 'Estado cambiado a Resuelto', author: 'Carlos Muñoz R.', createdAt: daysAgo(3) },
    ]
  },
  {
    id: 'tk8', ticketNumber: 'TKT-2026-00008', subject: 'Consulta sobre backup de archivos', description: 'Quisiera saber cómo funciona el sistema de respaldo de archivos institucionales.',
    requesterName: 'Francisca López', requesterEmail: 'francisca.lopez@ciudadano.cl', category: 'Software', priority: 'baja', status: 'cerrado', assignedTo: 'u2', department: 'Tecnología e Informática', location: 'Casa Central - Santiago', ticketType: 'Consulta',
    createdAt: daysAgo(15), updatedAt: daysAgo(10), resolvedAt: daysAgo(10), attachments: [],
    history: [
      { id: 'h8', type: 'response', content: 'El sistema de backup se ejecuta automáticamente cada noche a las 23:00 hrs. Los archivos se almacenan en el servidor central por 90 días.', author: 'María González S.', createdAt: daysAgo(12) },
      { id: 'h9', type: 'status_change', content: 'Estado cambiado a Cerrado', author: 'María González S.', createdAt: daysAgo(10) },
    ]
  },
  {
    id: 'tk9', ticketNumber: 'TKT-2026-00009', subject: 'Sistema lento al abrir archivos', description: 'Mi computador está muy lento, tarda mucho en abrir cualquier archivo.',
    requesterName: 'Diego Vargas', requesterEmail: 'diego.vargas@ciudadano.cl', category: 'Software', priority: 'media', status: 'en_proceso', assignedTo: 'u3', department: 'Atención Ciudadana', location: 'Sede Sur - Concepción', ticketType: 'Incidencia',
    createdAt: daysAgo(2), updatedAt: daysAgo(1), resolvedAt: null, attachments: [],
    history: [
      { id: 'h10', type: 'internal_note', content: 'Revisar si hay malware. Programar limpieza de disco.', author: 'Carlos Muñoz R.', createdAt: daysAgo(1) },
    ]
  },
  {
    id: 'tk10', ticketNumber: 'TKT-2026-00010', subject: 'Necesito nuevo teclado', description: 'El teclado de mi computador tiene varias teclas que no funcionan.',
    requesterName: 'Valentina Castro', requesterEmail: 'valentina.castro@ciudadano.cl', category: 'Hardware', priority: 'baja', status: 'abierto', assignedTo: null, department: 'Recursos Humanos', location: 'Casa Central - Santiago', ticketType: 'Solicitud de Servicio',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: []
  },
  {
    id: 'tk11', ticketNumber: 'TKT-2026-00011', subject: 'Error al imprimir desde sistema', description: 'Cuando intento imprimir desde el sistema SIGE me sale un error de impresión.',
    requesterName: 'Andrés Morales', requesterEmail: 'andres.morales@ciudadano.cl', category: 'Impresoras', priority: 'alta', status: 'abierto', assignedTo: null, department: 'Finanzas', location: 'Sede Valparaíso', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: []
  },
  {
    id: 'tk12', ticketNumber: 'TKT-2026-00012', subject: 'VPN no conecta desde casa', description: 'No puedo conectarme a la VPN institucional desde mi domicilio. Necesito acceder a archivos urgentes.',
    requesterName: 'Sofía Herrera', requesterEmail: 'sofia.herrera@ciudadano.cl', category: 'Redes y Conectividad', priority: 'urgente', status: 'en_proceso', assignedTo: 'u3', department: 'Jurídica', location: 'Casa Central - Santiago', ticketType: 'Incidencia',
    createdAt: daysAgo(0), updatedAt: daysAgo(0), resolvedAt: null, attachments: [],
    history: [
      { id: 'h11', type: 'response', content: 'Se verifica la configuración VPN. Se solicita reiniciar el cliente.', author: 'Carlos Muñoz R.', createdAt: daysAgo(0) },
    ]
  },
];

export const seedArticles: KnowledgeArticle[] = [
  {
    id: 'a1', title: 'Cómo resetear tu contraseña de correo institucional', summary: 'Guía paso a paso para restablecer tu contraseña del correo electrónico del Gobierno de Chile.',
    content: '<h2>Resetear contraseña de correo</h2><p>1. Ingresa a <strong>correo.gob.cl</strong></p><p>2. Haz clic en "¿Olvidaste tu contraseña?"</p><p>3. Ingresa tu RUT y correo alternativo</p><p>4. Revisa tu correo alternativo y sigue las instrucciones</p><p>5. Crea una nueva contraseña con al menos 8 caracteres</p>',
    category: 'Correo Electrónico', visibility: 'both', status: 'published', tags: ['correo', 'contraseña', 'acceso'], keywords: ['password', 'reset', 'email'], featured: true, createdAt: daysAgo(30), updatedAt: daysAgo(5), author: 'María González S.'
  },
  {
    id: 'a2', title: 'Conexión a VPN institucional', summary: 'Instrucciones para configurar y conectar la VPN desde cualquier ubicación.',
    content: '<h2>Configuración VPN</h2><p>1. Descarga el cliente VPN desde el portal de software</p><p>2. Instálalo siguiendo las instrucciones</p><p>3. Ingresa tu usuario institucional y contraseña</p><p>4. Selecciona el servidor más cercano</p><p>5. Haz clic en "Conectar"</p>',
    category: 'Redes y Conectividad', visibility: 'both', status: 'published', tags: ['vpn', 'remoto', 'acceso'], keywords: ['vpn', 'remote', 'connection'], featured: true, createdAt: daysAgo(25), updatedAt: daysAgo(10), author: 'Carlos Muñoz R.'
  },
  {
    id: 'a3', title: 'Protocolo de respuesta ante incidentes críticos', summary: 'Procedimiento interno para manejar incidentes de seguridad informática de alta prioridad.',
    content: '<h2>Protocolo de Incidentes Críticos</h2><p><strong>Nivel 1:</strong> Notificación inmediata al supervisor</p><p><strong>Nivel 2:</strong> Escalamiento al equipo de seguridad</p><p><strong>Nivel 3:</strong> Activación del plan de contingencia</p><p>Tiempo máximo de respuesta: 15 minutos</p>',
    category: 'Protocolos Internos', visibility: 'internal', status: 'published', tags: ['incidentes', 'seguridad', 'protocolo'], keywords: ['incident', 'security', 'critical'], featured: false, createdAt: daysAgo(20), updatedAt: daysAgo(15), author: 'Administrador del Sistema'
  },
  {
    id: 'a4', title: 'Cómo solicitar un nuevo equipo computacional', summary: 'Proceso para solicitar la adquisición de nuevo hardware para tu unidad.',
    content: '<h2>Solicitud de Equipos</h2><p>1. Completa el formulario de solicitud de hardware</p><p>2. Obtén la aprobación de tu jefe directo</p><p>3. Envía el formulario a la unidad de adquisiciones</p><p>4. Tiempo estimado de entrega: 15 días hábiles</p>',
    category: 'Hardware', visibility: 'both', status: 'published', tags: ['hardware', 'solicitud', 'equipo'], keywords: ['equipment', 'request', 'hardware'], featured: false, createdAt: daysAgo(18), updatedAt: daysAgo(8), author: 'María González S.'
  },
  {
    id: 'a5', title: 'Guía de instalación de software autorizado', summary: 'Lista de software autorizado y procedimiento de instalación.',
    content: '<h2>Software Autorizado</h2><p>El siguiente software está disponible para instalación:</p><ul><li>Microsoft Office 365</li><li>Adobe Acrobat Reader</li><li>Antivirus institucional</li><li>Navegadores web (Chrome, Firefox, Edge)</li></ul><p>Para solicitar otros programas, crea un ticket de tipo "Solicitud de Servicio".</p>',
    category: 'Software', visibility: 'both', status: 'published', tags: ['software', 'instalación', 'autorizado'], keywords: ['software', 'install', 'authorized'], featured: true, createdAt: daysAgo(15), updatedAt: daysAgo(3), author: 'Carlos Muñoz R.'
  },
];

export const seedAuditLogs: AuditLog[] = [
  { id: 'al1', action: 'LOGIN', details: 'Inicio de sesión exitoso', user: 'admin', timestamp: daysAgo(0) },
  { id: 'al2', action: 'TICKET_CREATE', details: 'Ticket TKT-2026-00012 creado', user: 'Sistema', timestamp: daysAgo(0) },
  { id: 'al3', action: 'TICKET_ASSIGN', details: 'Ticket TKT-2026-00004 asignado a Equipo de Redes', user: 'supervisor', timestamp: daysAgo(0) },
  { id: 'al4', action: 'USER_UPDATE', details: 'Perfil actualizado: Carlos Muñoz R.', user: 'tecnico', timestamp: daysAgo(1) },
  { id: 'al5', action: 'TICKET_RESOLVE', details: 'Ticket TKT-2026-00002 resuelto', user: 'tecnico', timestamp: daysAgo(2) },
  { id: 'al6', action: 'CONFIG_CHANGE', details: 'Configuración SMTP actualizada', user: 'admin', timestamp: daysAgo(5) },
  { id: 'al7', action: 'USER_CREATE', details: 'Nuevo usuario creado: tecnico', user: 'admin', timestamp: daysAgo(45) },
];

export const defaultSystemConfig: SystemConfig = {
  systemName: 'Mesa de Ayuda TI',
  institution: 'Gobierno de Chile',
  primaryColor: '#d4272e',
  timezone: 'America/Santiago',
  smtp: {
    host: 'smtp.gob.cl',
    port: 587,
    username: 'helpdesk@gob.cl',
    sender: 'no-reply@gob.cl',
    encryption: 'TLS'
  }
};

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { seedUsers, User } from '../data/seedData';
import { Users, Tag, Building, MapPin, UsersRound, Ticket, Settings, Shield, Lock, FileText, Image, Mail, Plus, Edit2, X } from 'lucide-react';

export default function AdminPanel() {
  const { categories, departments, locations, teams, ticketTypes, systemConfig, updateSystemConfig,
    addCategory, updateCategory, addDepartment, updateDepartment, addLocation, updateLocation,
    addTeam, updateTeam, addTicketType, updateTicketType, auditLogs, emailTemplates, updateEmailTemplate } = useData();
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [catForm, setCatForm] = useState({ name: '', description: '', visibility: 'both' as const, active: true });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', active: true });
  const [locForm, setLocForm] = useState({ name: '', address: '', active: true });
  const [teamForm, setTeamForm] = useState({ name: '', description: '', members: [] as string[], active: true });
  const [ttForm, setTtForm] = useState({ name: '', description: '', active: true });
  const [userForm, setUserForm] = useState<{ username: string; password: string; fullName: string; email: string; role: 'admin' | 'supervisor' | 'tecnico'; active: boolean }>({ username: '', password: '', fullName: '', email: '', role: 'tecnico', active: true });
  
  const [generalForm, setGeneralForm] = useState({ brandName: systemConfig.brandName, windowTitle: systemConfig.windowTitle, language: systemConfig.language, dateFormat: systemConfig.dateFormat, timezone: systemConfig.timezone, logoUrl: systemConfig.logoUrl });
  const [smtpForm, setSmtpForm] = useState(systemConfig.smtp);
  const [securityForm, setSecurityForm] = useState(systemConfig.security);
  const [ticketConfigForm, setTicketConfigForm] = useState(systemConfig.ticketConfig);
  const [kbConfigForm, setKbConfigForm] = useState(systemConfig.kbConfig);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: '', htmlContent: '', textContent: '', enabled: true });

  const sections = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'departments', label: 'Departamentos', icon: Building },
    { id: 'locations', label: 'Sedes', icon: MapPin },
    { id: 'teams', label: 'Equipos', icon: UsersRound },
    { id: 'ticketTypes', label: 'Tipos Ticket', icon: Ticket },
    { id: 'siteConfig', label: 'Config. Sitio / Logo', icon: Image },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'ticketConfig', label: 'Config. Tickets', icon: Settings },
    { id: 'kbConfig', label: 'Config. Base Conoc.', icon: FileText },
    { id: 'templates', label: 'Plantillas Correo', icon: Mail },
    { id: 'smtp', label: 'SMTP', icon: Mail },
    { id: 'audit', label: 'Auditoría', icon: Shield },
  ];

  const handleSaveUser = () => {
    if (editingId) { setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...userForm } : u)); }
    else { setUsers(prev => [...prev, { ...userForm, id: `u${Date.now()}`, createdAt: new Date().toISOString() }]); }
    setShowModal(false); setEditingId(null);
  };
  const handleSaveCategory = () => {
    if (editingId) { updateCategory(editingId, catForm); } else { addCategory(catForm); }
    setShowModal(false); setEditingId(null); setCatForm({ name: '', description: '', visibility: 'both', active: true });
  };
  const handleSaveDept = () => {
    if (editingId) { updateDepartment(editingId, deptForm); } else { addDepartment(deptForm); }
    setShowModal(false); setEditingId(null);
  };
  const handleSaveLoc = () => {
    if (editingId) { updateLocation(editingId, locForm); } else { addLocation(locForm); }
    setShowModal(false); setEditingId(null);
  };
  const handleSaveTeam = () => {
    if (editingId) { updateTeam(editingId, teamForm); } else { addTeam(teamForm); }
    setShowModal(false); setEditingId(null);
  };
  const handleSaveTT = () => {
    if (editingId) { updateTicketType(editingId, ttForm); } else { addTicketType(ttForm); }
    setShowModal(false); setEditingId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Gestión de Usuarios</h2>
            <button onClick={() => { setShowModal(true); setEditingId(null); setUserForm({ username: '', password: '', fullName: '', email: '', role: 'tecnico', active: true }); }}
              className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Usuario</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 hidden md:table-cell">Nombre</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Rol</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Estado</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">Acción</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{u.username}</td>
                  <td className="px-3 py-2 text-gray-600 hidden md:table-cell">{u.fullName}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 capitalize">{u.role}</span></td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${u.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => { setEditingId(u.id); setUserForm({ username: u.username, password: u.password, fullName: u.fullName, email: u.email, role: u.role, active: u.active }); setShowModal(true); }} className="text-gob-blue hover:text-blue-800 p-1"><Edit2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      );
      case 'categories': return renderSimpleList(categories, 'Categorías', (c: any) => `${c.name} — ${c.description}`, (c: any) => updateCategory(c.id, { active: !c.active }), () => { setEditingId(null); setCatForm({ name: '', description: '', visibility: 'both', active: true }); setShowModal(true); });
      case 'departments': return renderSimpleList(departments, 'Departamentos', (d: any) => `${d.code} — ${d.name}`, (d: any) => updateDepartment(d.id, { active: !d.active }), () => { setEditingId(null); setDeptForm({ name: '', code: '', active: true }); setShowModal(true); });
      case 'locations': return renderSimpleList(locations, 'Sedes', (l: any) => `${l.name} — ${l.address}`, (l: any) => updateLocation(l.id, { active: !l.active }), () => { setEditingId(null); setLocForm({ name: '', address: '', active: true }); setShowModal(true); });
      case 'teams': return renderSimpleList(teams, 'Equipos', (t: any) => `${t.name} (${t.members.length} miembros)`, (t: any) => updateTeam(t.id, { active: !t.active }), () => { setEditingId(null); setTeamForm({ name: '', description: '', members: [], active: true }); setShowModal(true); });
      case 'ticketTypes': return renderSimpleList(ticketTypes, 'Tipos de Ticket', (t: any) => `${t.name} — ${t.description}`, (t: any) => updateTicketType(t.id, { active: !t.active }), () => { setEditingId(null); setTtForm({ name: '', description: '', active: true }); setShowModal(true); });
      
      case 'siteConfig': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configuración del Sitio y Logotipo</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Marca (Brand Name)</label>
              <input type="text" value={generalForm.brandName} onChange={e => setGeneralForm({...generalForm, brandName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Título de Ventana</label>
              <input type="text" value={generalForm.windowTitle} onChange={e => setGeneralForm({...generalForm, windowTitle: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                <select value={generalForm.language} onChange={e => setGeneralForm({...generalForm, language: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="es">Español</option><option value="en">English</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Formato de Fecha</label>
                <select value={generalForm.dateFormat} onChange={e => setGeneralForm({...generalForm, dateFormat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="dd/MM/yyyy HH:mm">dd/MM/yyyy HH:mm</option><option value="MM/dd/yyyy">MM/dd/yyyy</option><option value="yyyy-MM-dd">yyyy-MM-dd</option>
                </select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
              <select value={generalForm.timezone} onChange={e => setGeneralForm({...generalForm, timezone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="America/Santiago">America/Santiago (CLT)</option><option value="America/Punta_Arenas">America/Punta_Arenas</option><option value="Pacific/Easter">Pacific/Easter</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">URL del Logotipo</label>
              <input type="url" value={generalForm.logoUrl} onChange={e => setGeneralForm({...generalForm, logoUrl: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <p className="text-xs text-gray-500 mt-1">Ingrese la URL de la imagen del logo institucional</p>
            </div>
            <button onClick={() => updateSystemConfig(generalForm)} className="bg-gob-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar Configuración</button>
          </div>
        </div>
      );

      case 'security': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configuración de Seguridad</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" checked={securityForm.recaptchaEnabled} onChange={e => setSecurityForm({...securityForm, recaptchaEnabled: e.target.checked})} className="rounded" />
              <span className="text-sm font-medium">Habilitar reCAPTCHA</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Site Key</label>
                <input type="text" value={securityForm.recaptchaSiteKey} onChange={e => setSecurityForm({...securityForm, recaptchaSiteKey: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Private Key</label>
                <input type="password" value={securityForm.recaptchaPrivateKey} onChange={e => setSecurityForm({...securityForm, recaptchaPrivateKey: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Máx. intentos de login</label>
                <input type="number" value={securityForm.maxLoginAttempts} onChange={e => setSecurityForm({...securityForm, maxLoginAttempts: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Minutos de bloqueo IP</label>
                <input type="number" value={securityForm.ipLockMinutes} onChange={e => setSecurityForm({...securityForm, ipLockMinutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <button onClick={() => updateSystemConfig({ security: securityForm })} className="bg-gob-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar Seguridad</button>
          </div>
        </div>
      );

      case 'ticketConfig': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configuración de Tickets</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Orden de respuestas</label>
                <select value={ticketConfigForm.responseOrder} onChange={e => setTicketConfigForm({...ticketConfigForm, responseOrder: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="newest">Más reciente primero</option><option value="oldest">Más antigua primero</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Entradas por página</label>
                <input type="number" value={ticketConfigForm.entriesPerPage} onChange={e => setTicketConfigForm({...ticketConfigForm, entriesPerPage: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SLA (horas)</label>
                <input type="number" value={ticketConfigForm.slaHours} onChange={e => setTicketConfigForm({...ticketConfigForm, slaHours: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cierre automático (días)</label>
                <input type="number" value={ticketConfigForm.autoCloseDays} onChange={e => setTicketConfigForm({...ticketConfigForm, autoCloseDays: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" checked={ticketConfigForm.allowAttachments} onChange={e => setTicketConfigForm({...ticketConfigForm, allowAttachments: e.target.checked})} className="rounded" />
              <span className="text-sm font-medium">Permitir adjuntos</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Máx. adjuntos</label>
                <input type="number" value={ticketConfigForm.maxAttachments} onChange={e => setTicketConfigForm({...ticketConfigForm, maxAttachments: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tamaño máx. (MB)</label>
                <input type="number" value={ticketConfigForm.maxFileSizeMB} onChange={e => setTicketConfigForm({...ticketConfigForm, maxFileSizeMB: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Extensiones permitidas</label>
              <input type="text" value={ticketConfigForm.allowedExtensions} onChange={e => setTicketConfigForm({...ticketConfigForm, allowedExtensions: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <button onClick={() => updateSystemConfig({ ticketConfig: ticketConfigForm })} className="bg-gob-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
          </div>
        </div>
      );

      case 'kbConfig': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configuración Base de Conocimiento</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Artículos por categoría</label>
                <input type="number" value={kbConfigForm.articlesPerCategory} onChange={e => setKbConfigForm({...kbConfigForm, articlesPerCategory: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Caracteres vista previa</label>
                <input type="number" value={kbConfigForm.previewChars} onChange={e => setKbConfigForm({...kbConfigForm, previewChars: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Artículos populares</label>
                <input type="number" value={kbConfigForm.popularArticles} onChange={e => setKbConfigForm({...kbConfigForm, popularArticles: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Artículos recientes</label>
                <input type="number" value={kbConfigForm.recentArticles} onChange={e => setKbConfigForm({...kbConfigForm, recentArticles: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <button onClick={() => updateSystemConfig({ kbConfig: kbConfigForm })} className="bg-gob-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
          </div>
        </div>
      );

      case 'templates': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Plantillas de Correo Electrónico</h2>
          {emailTemplates.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">{t.name}</h3>
                  <p className="text-xs text-gray-500">Asunto: {t.subject}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${t.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.enabled ? 'Activa' : 'Inactiva'}</span>
              </div>
              {editingTemplateId === t.id ? (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-slide-down">
                  <input type="text" value={templateForm.subject} onChange={e => setTemplateForm({...templateForm, subject: e.target.value})} placeholder="Asunto" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <textarea rows={4} value={templateForm.htmlContent} onChange={e => setTemplateForm({...templateForm, htmlContent: e.target.value})} placeholder="HTML" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none" />
                  <textarea rows={2} value={templateForm.textContent} onChange={e => setTemplateForm({...templateForm, textContent: e.target.value})} placeholder="Texto plano" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={templateForm.enabled} onChange={e => setTemplateForm({...templateForm, enabled: e.target.checked})} className="rounded" /><span className="text-sm">Activa</span></label>
                  <div className="flex gap-2">
                    <button onClick={() => { updateEmailTemplate(t.id, templateForm); setEditingTemplateId(null); }} className="px-4 py-2 bg-gob-blue text-white rounded-lg text-sm">Guardar</button>
                    <button onClick={() => setEditingTemplateId(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setEditingTemplateId(t.id); setTemplateForm({ subject: t.subject, htmlContent: t.htmlContent, textContent: t.textContent, enabled: t.enabled }); }}
                  className="mt-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg">Editar</button>
              )}
            </div>
          ))}
        </div>
      );

      case 'smtp': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Configuración SMTP</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <input type="text" value={smtpForm.host} onChange={e => setSmtpForm({...smtpForm, host: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
              <input type="number" value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input type="text" value={smtpForm.username} onChange={e => setSmtpForm({...smtpForm, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Remitente</label>
              <input type="email" value={smtpForm.sender} onChange={e => setSmtpForm({...smtpForm, sender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Encriptación</label>
              <select value={smtpForm.encryption} onChange={e => setSmtpForm({...smtpForm, encryption: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="TLS">TLS</option><option value="SSL">SSL</option><option value="NONE">Ninguna</option>
              </select></div>
          </div>
          <button onClick={() => updateSystemConfig({ smtp: smtpForm })} className="mt-4 bg-gob-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar SMTP</button>
        </div>
      );

      case 'audit': return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Registro de Auditoría</h2>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Shield size={14} className="text-gray-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-blue-50 text-gob-blue px-2 py-0.5 rounded">{log.action}</span>
                    <span className="text-sm text-gray-700">{log.details}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{log.user} • {new Date(log.timestamp).toLocaleString('es-CL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  function renderSimpleList(items: any[], title: string, getLabel: (item: any) => string, onToggle: (item: any) => void, onNew: () => void) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onNew} className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
        </div>
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <span className="text-sm text-gray-700">{getLabel(item)}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${item.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{item.active ? 'Activo' : 'Inactivo'}</span>
                <button onClick={() => onToggle(item)} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Administración del Sistema</h1>
        <p className="text-gray-500 text-sm mt-1">Configuración y gestión completa</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${activeSection === s.id ? 'bg-gob-blue text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <s.icon size={14} />{s.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="lg:col-span-3">{renderContent()}</div>
      </div>

      {/* Generic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{editingId ? 'Editar' : 'Nuevo'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              {activeSection === 'users' && (<>
                <input placeholder="Usuario *" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Contraseña *" type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Nombre Completo *" value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Correo *" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="admin">Administrador</option><option value="supervisor">Supervisor</option><option value="tecnico">Técnico</option>
                </select>
                <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.active} onChange={e => setUserForm({...userForm, active: e.target.checked})} className="rounded" /><span className="text-sm">Activo</span></label>
              </>)}
              {activeSection === 'categories' && (<>
                <input placeholder="Nombre *" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Descripción" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={catForm.visibility} onChange={e => setCatForm({...catForm, visibility: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="both">Ambas</option><option value="external">Externa</option><option value="internal">Interna</option>
                </select>
              </>)}
              {activeSection === 'departments' && (<>
                <input placeholder="Nombre *" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Código *" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </>)}
              {activeSection === 'locations' && (<>
                <input placeholder="Nombre *" value={locForm.name} onChange={e => setLocForm({...locForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Dirección" value={locForm.address} onChange={e => setLocForm({...locForm, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </>)}
              {activeSection === 'teams' && (<>
                <input placeholder="Nombre *" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Descripción" value={teamForm.description} onChange={e => setTeamForm({...teamForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </>)}
              {activeSection === 'ticketTypes' && (<>
                <input placeholder="Nombre *" value={ttForm.name} onChange={e => setTtForm({...ttForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Descripción" value={ttForm.description} onChange={e => setTtForm({...ttForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </>)}
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button onClick={() => {
                  if (activeSection === 'users') handleSaveUser();
                  else if (activeSection === 'categories') handleSaveCategory();
                  else if (activeSection === 'departments') handleSaveDept();
                  else if (activeSection === 'locations') handleSaveLoc();
                  else if (activeSection === 'teams') handleSaveTeam();
                  else if (activeSection === 'ticketTypes') handleSaveTT();
                }} className="px-5 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

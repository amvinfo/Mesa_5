import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { seedUsers, User } from '../data/seedData';
import { Users, Tag, Building, MapPin, UsersRound, Ticket, Settings, Shield, Plus, Edit2, Check, X } from 'lucide-react';

export default function AdminPanel() {
  const { categories, departments, locations, teams, ticketTypes, systemConfig, updateSystemConfig,
    addCategory, updateCategory, addDepartment, updateDepartment, addLocation, updateLocation,
    addTeam, updateTeam, addTicketType, updateTicketType, auditLogs } = useData();
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [catForm, setCatForm] = useState({ name: '', description: '', visibility: 'both' as const, active: true });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', active: true });
  const [locForm, setLocForm] = useState({ name: '', address: '', active: true });
  const [teamForm, setTeamForm] = useState({ name: '', description: '', members: [] as string[], active: true });
  const [ttForm, setTtForm] = useState({ name: '', description: '', active: true });
  const [userForm, setUserForm] = useState<{ username: string; password: string; fullName: string; email: string; role: 'admin' | 'supervisor' | 'tecnico'; active: boolean }>({ username: '', password: '', fullName: '', email: '', role: 'tecnico', active: true });
  const [smtpForm, setSmtpForm] = useState(systemConfig.smtp);
  const [generalForm, setGeneralForm] = useState({ systemName: systemConfig.systemName, institution: systemConfig.institution, timezone: systemConfig.timezone });

  const sections = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'departments', label: 'Departamentos', icon: Building },
    { id: 'locations', label: 'Ubicaciones / Sedes', icon: MapPin },
    { id: 'teams', label: 'Equipos de Soporte', icon: UsersRound },
    { id: 'ticketTypes', label: 'Tipos de Ticket', icon: Ticket },
    { id: 'config', label: 'Config. General y SMTP', icon: Settings },
    { id: 'audit', label: 'Auditoría', icon: Shield },
  ];

  const handleSaveCategory = () => {
    if (editingId) { updateCategory(editingId, catForm); } else { addCategory(catForm); }
    setShowModal(false); setEditingId(null); setCatForm({ name: '', description: '', visibility: 'both', active: true });
  };
  const handleSaveDept = () => {
    if (editingId) { updateDepartment(editingId, deptForm); } else { addDepartment(deptForm); }
    setShowModal(false); setEditingId(null); setDeptForm({ name: '', code: '', active: true });
  };
  const handleSaveLoc = () => {
    if (editingId) { updateLocation(editingId, locForm); } else { addLocation(locForm); }
    setShowModal(false); setEditingId(null); setLocForm({ name: '', address: '', active: true });
  };
  const handleSaveTeam = () => {
    if (editingId) { updateTeam(editingId, teamForm); } else { addTeam(teamForm); }
    setShowModal(false); setEditingId(null); setTeamForm({ name: '', description: '', members: [], active: true });
  };
  const handleSaveTT = () => {
    if (editingId) { updateTicketType(editingId, ttForm); } else { addTicketType(ttForm); }
    setShowModal(false); setEditingId(null); setTtForm({ name: '', description: '', active: true });
  };
  const handleSaveUser = () => {
    if (editingId) {
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...userForm } : u));
    } else {
      setUsers(prev => [...prev, { ...userForm, id: `u${Date.now()}`, createdAt: new Date().toISOString() }]);
    }
    setShowModal(false); setEditingId(null); setUserForm({ username: '', password: '', fullName: '', email: '', role: 'tecnico', active: true });
  };
  const handleSaveConfig = () => {
    updateSystemConfig({ ...generalForm, smtp: smtpForm });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración del Sistema</h1>
        <p className="text-gray-500 text-sm mt-1">Configuración y gestión del sistema</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sub-navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === s.id ? 'bg-gob-blue text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Users */}
          {activeSection === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Gestión de Usuarios</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setUserForm({ username: '', password: '', fullName: '', email: '', role: 'tecnico', active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                </table>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Categorías</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setCatForm({ name: '', description: '', visibility: 'both', active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nueva</button>
              </div>
              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.visibility}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.active ? 'Activa' : 'Inactiva'}</span>
                      <button onClick={() => updateCategory(c.id, { active: !c.active })} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {activeSection === 'departments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Departamentos</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setDeptForm({ name: '', code: '', active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
              </div>
              <div className="space-y-2">
                {departments.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{d.code}</span>
                      <span className="font-medium text-gray-800">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${d.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{d.active ? 'Activo' : 'Inactivo'}</span>
                      <button onClick={() => updateDepartment(d.id, { active: !d.active })} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {activeSection === 'locations' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Ubicaciones / Sedes</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setLocForm({ name: '', address: '', active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nueva</button>
              </div>
              <div className="space-y-2">
                {locations.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{l.name}</p>
                      <p className="text-xs text-gray-500">{l.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${l.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{l.active ? 'Activa' : 'Inactiva'}</span>
                      <button onClick={() => updateLocation(l.id, { active: !l.active })} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams */}
          {activeSection === 'teams' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Equipos de Soporte</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setTeamForm({ name: '', description: '', members: [], active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
              </div>
              <div className="space-y-2">
                {teams.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{t.members.length} miembros</span>
                      <button onClick={() => updateTeam(t.id, { active: !t.active })} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Types */}
          {activeSection === 'ticketTypes' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Tipos de Ticket</h2>
                <button onClick={() => { setShowModal(true); setEditingId(null); setTtForm({ name: '', description: '', active: true }); }}
                  className="bg-gob-blue hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus size={14} />Nuevo</button>
              </div>
              <div className="space-y-2">
                {ticketTypes.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${t.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{t.active ? 'Activo' : 'Inactivo'}</span>
                      <button onClick={() => updateTicketType(t.id, { active: !t.active })} className="text-gray-400 hover:text-gob-blue p-1"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Config */}
          {activeSection === 'config' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Configuración General</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sistema</label>
                    <input type="text" value={generalForm.systemName} onChange={e => setGeneralForm({...generalForm, systemName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                    <input type="text" value={generalForm.institution} onChange={e => setGeneralForm({...generalForm, institution: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                    <select value={generalForm.timezone} onChange={e => setGeneralForm({...generalForm, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                      <option value="America/Santiago">America/Santiago (CLT)</option>
                      <option value="America/Punta_Arenas">America/Punta_Arenas</option>
                      <option value="Pacific/Easter">Pacific/Easter (Isla de Pascua)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Configuración SMTP</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                    <input type="text" value={smtpForm.host} onChange={e => setSmtpForm({...smtpForm, host: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                    <input type="number" value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input type="text" value={smtpForm.username} onChange={e => setSmtpForm({...smtpForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remitente</label>
                    <input type="email" value={smtpForm.sender} onChange={e => setSmtpForm({...smtpForm, sender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Encriptación</label>
                    <select value={smtpForm.encryption} onChange={e => setSmtpForm({...smtpForm, encryption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                      <option value="TLS">TLS</option>
                      <option value="SSL">SSL</option>
                      <option value="NONE">Ninguna</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={handleSaveConfig} className="bg-gob-blue hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Guardar Configuración
              </button>
            </div>
          )}

          {/* Audit */}
          {activeSection === 'audit' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Registro de Auditoría</h2>
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Shield size={14} className="text-gray-500" />
                    </div>
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
          )}
        </div>
      </div>

      {/* Generic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{editingId ? 'Editar' : 'Nuevo'} {sections.find(s => s.id === activeSection)?.label.replace('Gestión de ', '')}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              {activeSection === 'users' && (
                <>
                  <input placeholder="Usuario *" required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Contraseña *" type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Nombre Completo *" required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Correo *" type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="admin">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.active} onChange={e => setUserForm({...userForm, active: e.target.checked})} className="rounded" /><span className="text-sm">Activo</span></label>
                </>
              )}
              {activeSection === 'categories' && (
                <>
                  <input placeholder="Nombre *" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Descripción" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <select value={catForm.visibility} onChange={e => setCatForm({...catForm, visibility: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="both">Ambas</option><option value="external">Externa</option><option value="internal">Interna</option>
                  </select>
                </>
              )}
              {activeSection === 'departments' && (
                <>
                  <input placeholder="Nombre *" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Código *" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </>
              )}
              {activeSection === 'locations' && (
                <>
                  <input placeholder="Nombre *" value={locForm.name} onChange={e => setLocForm({...locForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Dirección" value={locForm.address} onChange={e => setLocForm({...locForm, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </>
              )}
              {activeSection === 'teams' && (
                <>
                  <input placeholder="Nombre *" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Descripción" value={teamForm.description} onChange={e => setTeamForm({...teamForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </>
              )}
              {activeSection === 'ticketTypes' && (
                <>
                  <input placeholder="Nombre *" value={ttForm.name} onChange={e => setTtForm({...ttForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="Descripción" value={ttForm.description} onChange={e => setTtForm({...ttForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </>
              )}
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
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

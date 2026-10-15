import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Filter, Eye, ChevronDown, ChevronUp, Send, StickyNote, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketManagementProps {
  onSelectTicket: (id: string) => void;
}

export default function TicketManagement({ onSelectTicket }: TicketManagementProps) {
  const { tickets, categories, departments, locations, ticketTypes, createTicket, updateTicket, addTicketHistory, addEmailLog } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState<'response' | 'internal_note'>('response');

  const [newTicket, setNewTicket] = useState({
    requesterName: '', requesterEmail: '', category: '', subject: '', description: '',
    priority: 'media' as const, department: '', location: '', ticketType: 'Incidencia', status: 'abierto' as const, assignedTo: null as string | null, attachments: [] as string[]
  });

  const filtered = tickets.filter(t => {
    const matchSearch = !searchTerm || t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket(newTicket);
    setShowNewModal(false);
    setNewTicket({ requesterName: '', requesterEmail: '', category: '', subject: '', description: '', priority: 'media', department: '', location: '', ticketType: 'Incidencia', status: 'abierto', assignedTo: null, attachments: [] });
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    updateTicket(ticketId, { status: newStatus as any, resolvedAt: (newStatus === 'resuelto' || newStatus === 'cerrado') ? new Date().toISOString() : ticket.resolvedAt });
    addTicketHistory(ticketId, { type: 'status_change', content: `Estado cambiado a "${getStatusLabel(newStatus)}"`, author: user?.fullName || 'Sistema' });
    
    if (newStatus === 'resuelto' || newStatus === 'cerrado') {
      addEmailLog({ to: ticket.requesterEmail, subject: `Su ticket ${ticket.ticketNumber} ha sido cerrado`, template: 'ticket_closed', status: 'sent', ticketId });
    }
  };

  const handleSubmitResponse = (ticketId: string) => {
    if (!responseText.trim()) return;
    const ticket = tickets.find(t => t.id === ticketId);
    addTicketHistory(ticketId, { type: responseType, content: responseText, author: user?.fullName || 'Sistema' });
    
    if (responseType === 'response' && ticket) {
      addEmailLog({ to: ticket.requesterEmail, subject: `Actualización de su ticket ${ticket.ticketNumber}`, template: 'staff_response', status: 'sent', ticketId });
    }
    setResponseText('');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { abierto: 'bg-blue-100 text-blue-700', en_proceso: 'bg-yellow-100 text-yellow-700', resuelto: 'bg-green-100 text-green-700', cerrado: 'bg-gray-100 text-gray-700' };
    return colors[status] || '';
  };
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { abierto: 'Abierto', en_proceso: 'En Proceso', resuelto: 'Resuelto', cerrado: 'Cerrado' };
    return labels[status] || status;
  };
  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = { baja: 'bg-gray-100 text-gray-600', media: 'bg-blue-100 text-blue-600', alta: 'bg-orange-100 text-orange-600', urgente: 'bg-red-100 text-red-600' };
    return colors[p] || '';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
          <Plus size={18} /> Nuevo Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar por Nº, solicitante, asunto o correo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
          </div>
          <div className="flex gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table with expandable rows */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Nº Ticket</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden lg:table-cell">Solicitante</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Asunto</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden md:table-cell">Categoría</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden sm:table-cell">Prioridad</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden xl:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(ticket => (
                <React.Fragment key={ticket.id}>
                  <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}>
                    <td className="px-2 py-3 text-center">
                      {expandedId === ticket.id ? <ChevronUp size={14} className="text-gray-400 mx-auto" /> : <ChevronDown size={14} className="text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-gob-blue font-medium whitespace-nowrap">{ticket.ticketNumber}</td>
                    <td className="px-3 py-3 text-gray-600 hidden lg:table-cell whitespace-nowrap">{ticket.requesterName}</td>
                    <td className="px-3 py-3 text-gray-800 max-w-[180px] truncate">{ticket.subject}</td>
                    <td className="px-3 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">{ticket.category}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">{format(new Date(ticket.createdAt), 'dd/MM/yy HH:mm', { locale: es })}</td>
                  </tr>
                  {/* Expanded row */}
                  {expandedId === ticket.id && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div className="bg-blue-50/50 border-t border-b border-blue-100 p-4 animate-slide-down">
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="text-gray-500">Correo:</span> <span className="font-medium">{ticket.requesterEmail}</span></div>
                                <div><span className="text-gray-500">Ubicación:</span> <span className="font-medium">{ticket.location}</span></div>
                                <div><span className="text-gray-500">Departamento:</span> <span className="font-medium">{ticket.department}</span></div>
                                <div><span className="text-gray-500">Tipo:</span> <span className="font-medium">{ticket.ticketType}</span></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-600">Cambiar estado:</p>
                              <div className="flex flex-wrap gap-1">
                                {['abierto', 'en_proceso', 'resuelto', 'cerrado'].map(s => (
                                  <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, s); }}
                                    className={`px-2 py-1 rounded text-xs ${ticket.status === s ? 'bg-gob-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    {getStatusLabel(s)}
                                  </button>
                                ))}
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); onSelectTicket(ticket.id); }}
                                className="w-full mt-2 px-3 py-1.5 bg-gob-blue text-white rounded text-xs font-medium hover:bg-blue-800">
                                Ver detalle completo →
                              </button>
                            </div>
                          </div>
                          
                          {/* Quick response */}
                          <div className="border-t border-blue-100 pt-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2 mb-2">
                              <button onClick={() => setResponseType('response')} className={`px-3 py-1.5 rounded text-xs font-medium ${responseType === 'response' ? 'bg-gob-blue text-white' : 'bg-white border border-gray-200'}`}>
                                <MessageSquare size={12} className="inline mr-1" /> Respuesta
                              </button>
                              <button onClick={() => setResponseType('internal_note')} className={`px-3 py-1.5 rounded text-xs font-medium ${responseType === 'internal_note' ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-200'}`}>
                                <StickyNote size={12} className="inline mr-1" /> Nota Interna
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input type="text" value={responseText} onChange={e => setResponseText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitResponse(ticket.id)}
                                placeholder={responseType === 'response' ? 'Escribir respuesta (envía correo al solicitante)...' : 'Escribir nota interna...'}
                                className={`flex-1 px-3 py-2 border rounded-lg text-sm ${responseType === 'internal_note' ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-300'}`} />
                              <button onClick={() => handleSubmitResponse(ticket.id)} className="px-3 py-2 bg-gob-blue text-white rounded-lg text-sm hover:bg-blue-800">
                                <Send size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Recent history */}
                          {ticket.history.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-100">
                              <p className="text-xs font-medium text-gray-600 mb-2">Últimas acciones:</p>
                              <div className="space-y-1">
                                {ticket.history.slice(-2).reverse().map((h: any) => (
                                  <div key={h.id} className={`text-xs p-2 rounded ${h.type === 'internal_note' ? 'bg-yellow-50' : 'bg-white'}`}>
                                    <span className="text-gray-500">{format(new Date(h.createdAt), 'dd/MM HH:mm', { locale: es })}</span> — <span className="text-gray-700">{h.content}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Filter size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No se encontraron tickets con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Nuevo Ticket Interno</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Solicitante *</label>
                  <input required type="text" value={newTicket.requesterName} onChange={e => setNewTicket({...newTicket, requesterName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                  <input required type="email" value={newTicket.requesterEmail} onChange={e => setNewTicket({...newTicket, requesterEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select required value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Seleccionar</option>
                    {categories.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                  <select required value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <select value={newTicket.department} onChange={e => setNewTicket({...newTicket, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Seleccionar</option>
                    {departments.filter(d => d.active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <select value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Seleccionar</option>
                    {locations.filter(l => l.active).map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                <input required type="text" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea required rows={3} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium">Crear Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

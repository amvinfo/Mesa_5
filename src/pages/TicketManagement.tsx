import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Filter, Eye, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketManagementProps {
  onSelectTicket: (id: string) => void;
}

export default function TicketManagement({ onSelectTicket }: TicketManagementProps) {
  const { tickets, categories, departments, locations, ticketTypes, createTicket } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    requesterName: '', requesterEmail: '', category: '', subject: '', description: '',
    priority: 'media' as const, department: '', location: '', ticketType: 'Incidencia', status: 'abierto' as const, assignedTo: null as string | null, attachments: [] as string[]
  });

  const filtered = tickets.filter(t => {
    const matchSearch = !searchTerm || 
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase());
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
          <Plus size={18} />
          Nuevo Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por Nº, solicitante, asunto o correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-blue focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nº Ticket</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Solicitante</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Prioridad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Fecha</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gob-blue font-medium whitespace-nowrap">{ticket.ticketNumber}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell whitespace-nowrap">{ticket.requesterName}</td>
                  <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">{ticket.category}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">{format(new Date(ticket.createdAt), 'dd/MM/yy HH:mm', { locale: es })}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onSelectTicket(ticket.id)} className="text-gob-blue hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="">Seleccionar</option>
                    {categories.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                  <select required value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <select value={newTicket.department} onChange={e => setNewTicket({...newTicket, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="">Seleccionar</option>
                    {departments.filter(d => d.active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <select value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="">Seleccionar</option>
                    {locations.filter(l => l.active).map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                <input required type="text" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea required rows={3} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">Crear Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

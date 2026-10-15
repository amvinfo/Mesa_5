import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, StickyNote, MessageSquare, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export default function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const { tickets, updateTicket, addTicketHistory, departments } = useData();
  const { user } = useAuth();
  const ticket = tickets.find(t => t.id === ticketId);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState<'response' | 'internal_note'>('response');
  const [showActions, setShowActions] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  if (!ticket) return <div className="p-8 text-center text-gray-500">Ticket no encontrado</div>;

  const handleStatusChange = (newStatus: string) => {
    const oldStatus = ticket.status;
    updateTicket(ticket.id, { status: newStatus as any, resolvedAt: (newStatus === 'resuelto' || newStatus === 'cerrado') ? new Date().toISOString() : ticket.resolvedAt });
    addTicketHistory(ticket.id, { type: 'status_change', content: `Estado cambiado de "${getStatusLabel(oldStatus)}" a "${getStatusLabel(newStatus)}"`, author: user?.fullName || 'Sistema' });
    setShowActions(false);
  };

  const handleAssign = (userId: string) => {
    updateTicket(ticket.id, { assignedTo: userId, status: ticket.status === 'abierto' ? 'en_proceso' : ticket.status });
    addTicketHistory(ticket.id, { type: 'assignment', content: `Ticket asignado a ${userId === 'unassigned' ? 'Sin asignar' : userId}`, author: user?.fullName || 'Sistema' });
    setShowAssign(false);
    setShowActions(false);
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    addTicketHistory(ticket.id, { type: responseType, content: responseText, author: user?.fullName || 'Sistema' });
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

  const teamMembers = [
    { id: 'u2', name: 'María González S.' },
    { id: 'u3', name: 'Carlos Muñoz R.' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm">
        <ArrowLeft size={16} />
        Volver a la lista
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-mono font-bold text-gob-blue">{ticket.ticketNumber}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{ticket.subject}</h1>
            <p className="text-gray-600 text-sm">{ticket.description}</p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowActions(!showActions)} className="flex items-center gap-2 px-4 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">
                  Acciones <ChevronDown size={14} />
                </button>
                {showActions && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 w-48 animate-slide-down">
                    <button onClick={() => { handleStatusChange('abierto'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">→ Abierto</button>
                    <button onClick={() => { handleStatusChange('en_proceso'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">→ En Proceso</button>
                    <button onClick={() => { handleStatusChange('resuelto'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">→ Resuelto</button>
                    <button onClick={() => { handleStatusChange('cerrado'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">→ Cerrado</button>
                    <hr className="my-1" />
                    <button onClick={() => { setShowAssign(true); setShowActions(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gob-blue font-medium">Asignar a...</button>
                  </div>
                )}
              </div>
              {ticket.assignedTo && (
                <span className="text-sm text-gray-500">Asignado a: <span className="font-medium text-gray-700">{teamMembers.find(m => m.id === ticket.assignedTo)?.name || 'Técnico'}</span></span>
              )}
            </div>
          </div>

          {/* Response Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setResponseType('response')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${responseType === 'response' ? 'bg-gob-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <MessageSquare size={14} className="inline mr-1" /> Respuesta Pública
              </button>
              <button onClick={() => setResponseType('internal_note')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${responseType === 'internal_note' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <StickyNote size={14} className="inline mr-1" /> Nota Interna
              </button>
            </div>
            <form onSubmit={handleSubmitResponse}>
              <textarea
                rows={4}
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder={responseType === 'response' ? 'Escriba una respuesta al solicitante...' : 'Escriba una nota interna (solo visible para funcionarios)...'}
                className={`w-full px-4 py-3 border rounded-lg text-sm resize-none focus:ring-2 focus:border-transparent ${responseType === 'internal_note' ? 'border-yellow-300 focus:ring-yellow-400 bg-yellow-50/50' : 'border-gray-300 focus:ring-gob-blue'}`}
              />
              <div className="flex justify-end mt-3">
                <button type="submit" className="px-5 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Send size={14} />
                  Enviar
                </button>
              </div>
            </form>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Historial del Ticket</h3>
            {ticket.history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Sin historial aún</p>
            ) : (
              <div className="space-y-3">
                {[...ticket.history].reverse().map(entry => (
                  <div key={entry.id} className={`p-4 rounded-lg border-l-4 ${
                    entry.type === 'internal_note' ? 'bg-yellow-50 border-yellow-400' :
                    entry.type === 'status_change' ? 'bg-blue-50 border-blue-400' :
                    entry.type === 'assignment' ? 'bg-purple-50 border-purple-400' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">{entry.author}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      {entry.type === 'internal_note' && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">NOTA INTERNA</span>}
                    </div>
                    <p className="text-sm text-gray-700">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Metadata */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Información del Ticket</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Solicitante</dt><dd className="font-medium text-gray-800">{ticket.requesterName}</dd></div>
              <div><dt className="text-gray-500">Correo</dt><dd className="font-medium text-gray-800 text-xs">{ticket.requesterEmail}</dd></div>
              <div><dt className="text-gray-500">Categoría</dt><dd className="font-medium text-gray-800">{ticket.category}</dd></div>
              <div><dt className="text-gray-500">Tipo</dt><dd className="font-medium text-gray-800">{ticket.ticketType}</dd></div>
              <div><dt className="text-gray-500">Departamento</dt><dd className="font-medium text-gray-800">{ticket.department}</dd></div>
              <div><dt className="text-gray-500">Ubicación</dt><dd className="font-medium text-gray-800">{ticket.location}</dd></div>
              <div><dt className="text-gray-500">Creado</dt><dd className="font-medium text-gray-800">{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</dd></div>
              <div><dt className="text-gray-500">Actualizado</dt><dd className="font-medium text-gray-800">{format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</dd></div>
              {ticket.resolvedAt && <div><dt className="text-gray-500">Resuelto</dt><dd className="font-medium text-green-700">{format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</dd></div>}
            </dl>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Asignar Ticket</h3>
            <div className="space-y-2">
              <button onClick={() => handleAssign('unassigned')} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">Sin asignar</button>
              {teamMembers.map(m => (
                <button key={m.id} onClick={() => handleAssign(m.id)} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm">
                  {m.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(false)} className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

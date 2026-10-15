import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, CheckCheck, Trash2, Ticket as TicketIcon, AlertCircle, Info } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useData();
  const { user } = useAuth();

  const filtered = notifications.filter(n => n.forRole === 'all' || n.forRole === user?.role);
  const unread = filtered.filter(n => !n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket_update': return <TicketIcon size={16} className="text-blue-500" />;
      case 'ticket_assigned': return <TicketIcon size={16} className="text-purple-500" />;
      case 'ticket_closed': return <Check size={16} className="text-green-500" />;
      case 'system': return <Info size={16} className="text-yellow-500" />;
      case 'mention': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ticket_update: 'Actualización',
      ticket_assigned: 'Asignación',
      ticket_closed: 'Cierre',
      system: 'Sistema',
      mention: 'Mención'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔔 Notificaciones</h1>
          <p className="text-gray-500 text-sm mt-1">{unread.length} notificación{unread.length !== 1 ? 'es' : ''} sin leer</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllNotificationsRead}
            className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
            <CheckCheck size={18} /> Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div key={notif.id} className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{getTypeLabel(notif.type)}</span>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-gob-blue" />}
                </div>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.read && (
                  <button onClick={() => markNotificationRead(notif.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Marcar como leída">
                    <Check size={14} />
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button onClick={() => deleteNotification(notif.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

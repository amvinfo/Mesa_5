import React from 'react';
import { useData } from '../context/DataContext';
import { Ticket, Clock, CheckCircle, AlertTriangle, UserX, Calendar, Timer, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { getKPIs, tickets } = useData();
  const kpis = getKPIs();

  const recentTickets = tickets.slice(0, 5);

  const kpiCards = [
    { label: 'TOTAL TICKETS', value: kpis.total, icon: Ticket, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { label: 'ABIERTOS', value: kpis.abiertos, icon: BarChart3, color: 'bg-sky-500', lightColor: 'bg-sky-50', textColor: 'text-sky-700' },
    { label: 'EN PROCESO', value: kpis.enProceso, icon: Clock, color: 'bg-yellow-500', lightColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { label: 'RESUELTOS', value: kpis.resueltos, icon: CheckCircle, color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-700' },
    { label: 'CRÍTICOS ACTIVOS', value: kpis.criticos, icon: AlertTriangle, color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-700' },
    { label: 'SIN ASIGNAR', value: kpis.sinAsignar, icon: UserX, color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-700' },
    { label: 'CREADOS HOY', value: kpis.creadosHoy, icon: Calendar, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { label: 'TIEMPO PROM. (H)', value: kpis.avgResolution, icon: Timer, color: 'bg-indigo-500', lightColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      abierto: 'bg-blue-100 text-blue-700',
      en_proceso: 'bg-yellow-100 text-yellow-700',
      resuelto: 'bg-green-100 text-green-700',
      cerrado: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { abierto: 'Abierto', en_proceso: 'En Proceso', resuelto: 'Resuelto', cerrado: 'Cerrado' };
    return labels[status] || status;
  };

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = { baja: 'bg-gray-400', media: 'bg-blue-400', alta: 'bg-orange-400', urgente: 'bg-red-500' };
    return <span className={`w-2.5 h-2.5 rounded-full ${colors[priority] || 'bg-gray-400'}`} />;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Resumen</h1>
        <p className="text-gray-500 text-sm mt-1">Indicadores operacionales en tiempo real</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${kpi.lightColor} rounded-lg flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.textColor} />
              </div>
              <div className={`w-2 h-2 rounded-full ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Tickets Recientes</h2>
          <span className="text-xs text-gray-500">Últimos {recentTickets.length} tickets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nº Ticket</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Solicitante</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Prioridad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gob-blue font-medium">{ticket.ticketNumber}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{ticket.requesterName}</td>
                  <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      {getPriorityDot(ticket.priority)}
                      <span className="text-xs capitalize">{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Search, Filter, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EmailLogs() {
  const { emailLogs, emailTemplates, deleteEmailLog, updateEmailTemplate } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'templates'>('logs');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: '', htmlContent: '', textContent: '', enabled: true });

  const filtered = emailLogs.filter(log => {
    const matchSearch = !searchTerm || log.to.toLowerCase().includes(searchTerm.toLowerCase()) || log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || log.status === filterStatus;
    const matchTemplate = !filterTemplate || log.template === filterTemplate;
    return matchSearch && matchStatus && matchTemplate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle size={14} className="text-green-500" />;
      case 'failed': return <XCircle size={14} className="text-red-500" />;
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { sent: 'Enviado', failed: 'Fallido', pending: 'Pendiente' };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { sent: 'bg-green-50 text-green-700', failed: 'bg-red-50 text-red-700', pending: 'bg-yellow-50 text-yellow-700' };
    return colors[status] || '';
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template.id);
    setTemplateForm({ subject: template.subject, htmlContent: template.htmlContent, textContent: template.textContent, enabled: template.enabled });
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateEmailTemplate(editingTemplate, templateForm);
      setEditingTemplate(null);
    }
  };

  const getTemplateName = (key: string) => {
    const t = emailTemplates.find(t => t.key === key);
    return t?.name || key;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✉️ Registro de Correos</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de correos enviados y plantillas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-white shadow-sm text-gob-blue' : 'text-gray-600'}`}>
          📧 Historial de Correos
        </button>
        <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-white shadow-sm text-gob-blue' : 'text-gray-600'}`}>
          📝 Plantillas
        </button>
      </div>

      {activeTab === 'logs' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por destinatario o asunto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                <option value="">Todos los estados</option>
                <option value="sent">Enviados</option>
                <option value="failed">Fallidos</option>
                <option value="pending">Pendientes</option>
              </select>
              <select value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                <option value="">Todas las plantillas</option>
                {emailTemplates.map(t => <option key={t.id} value={t.key}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Destinatario</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Asunto</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Plantilla</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                    {user?.role === 'admin' && <th className="text-center px-4 py-3 font-medium text-gray-600">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)} {getStatusLabel(log.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{log.to}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-[250px] truncate">{log.subject}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{getTemplateName(log.template)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(log.sentAt), 'dd/MM/yy HH:mm', { locale: es })}</td>
                      {user?.role === 'admin' && (
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => deleteEmailLog(log.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Mail size={40} className="mx-auto mb-3 text-gray-300" />
                <p>No se encontraron registros</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          {emailTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Asunto: {template.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${template.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {template.enabled ? 'Activa' : 'Inactiva'}
                  </span>
                  <button onClick={() => handleEditTemplate(template)} className="px-3 py-1.5 text-xs bg-gob-blue text-white rounded-lg hover:bg-blue-800">Editar</button>
                </div>
              </div>
              {editingTemplate === template.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-slide-down">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Asunto</label>
                    <input type="text" value={templateForm.subject} onChange={e => setTemplateForm({...templateForm, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contenido HTML</label>
                    <textarea rows={5} value={templateForm.htmlContent} onChange={e => setTemplateForm({...templateForm, htmlContent: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contenido Texto</label>
                    <textarea rows={3} value={templateForm.textContent} onChange={e => setTemplateForm({...templateForm, textContent: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={templateForm.enabled} onChange={e => setTemplateForm({...templateForm, enabled: e.target.checked})} className="rounded" />
                    <span className="text-sm">Plantilla activa</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={handleSaveTemplate} className="px-4 py-2 bg-gob-blue text-white rounded-lg text-sm">Guardar</button>
                    <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Ticket, FileText, HelpCircle, ChevronDown, ChevronUp, Send, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PublicPortal() {
  const { categories, createTicket, getTicketByNumber, articles } = useData();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showTicketQuery, setShowTicketQuery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryTicketNumber, setQueryTicketNumber] = useState('');
  const [queriedTicket, setQueriedTicket] = useState<any>(null);
  const [queryError, setQueryError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [formData, setFormData] = useState({
    requesterName: '', requesterEmail: '', category: '', subject: '', description: '',
    priority: 'media' as const, department: '', location: '', ticketType: 'Incidencia'
  });

  const publicCategories = categories.filter(c => c.active && (c.visibility === 'both' || c.visibility === 'external'));
  const publicArticles = articles.filter(a => a.status === 'published' && (a.visibility === 'both' || a.visibility === 'external'));

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowTicketForm(true);
    }
  };

  const handleQueryTicket = () => {
    setQueryError('');
    setQueriedTicket(null);
    if (!queryTicketNumber.trim()) {
      setQueryError('Por favor ingrese un número de ticket');
      return;
    }
    const ticket = getTicketByNumber(queryTicketNumber.trim());
    if (ticket) {
      setQueriedTicket(ticket);
    } else {
      setQueryError('No se encontró ningún ticket con ese número. Verifique e intente nuevamente.');
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket({
      ...formData,
      status: 'abierto',
      assignedTo: null,
      attachments: [],
    });
    setFormSuccess(true);
    setFormData({ requesterName: '', requesterEmail: '', category: '', subject: '', description: '', priority: 'media', department: '', location: '', ticketType: 'Incidencia' });
    setTimeout(() => setFormSuccess(false), 5000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      abierto: 'bg-blue-100 text-blue-800',
      en_proceso: 'bg-yellow-100 text-yellow-800',
      resuelto: 'bg-green-100 text-green-800',
      cerrado: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      abierto: 'Abierto',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || ''}`}>{labels[status] || status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      baja: 'bg-gray-100 text-gray-700',
      media: 'bg-blue-100 text-blue-700',
      alta: 'bg-orange-100 text-orange-700',
      urgente: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || ''}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gob-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏛️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gob-blue">GOBIERNO DE CHILE</h1>
                <p className="text-xs text-gray-500 -mt-0.5">HELPDESK | Mesa de Ayuda TI</p>
              </div>
            </div>
            <a href="#/login" className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <ExternalLink size={16} />
              Acceso Funcionarios
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gob-blue to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿En qué podemos ayudarte hoy?</h2>
          <p className="text-blue-100 mb-8 text-lg">Portal de atención ciudadana para solicitudes de soporte técnico</p>
          <div className="flex max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Describe tu problema o necesidad..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-5 py-4 rounded-l-xl text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-gob-red"
            />
            <button onClick={handleSearch} className="bg-gob-red hover:bg-red-700 px-6 py-4 rounded-r-xl font-medium transition-colors flex items-center gap-2">
              <Search size={20} />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => { setShowTicketForm(!showTicketForm); setShowTicketQuery(false); }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-gob-red group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Ticket className="text-gob-red" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Solicitar Soporte Técnico</h3>
                <p className="text-sm text-gray-500 mt-1">Crea un nuevo ticket de atención</p>
              </div>
              {showTicketForm ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
          </button>

          <button
            onClick={() => { setShowTicketQuery(!showTicketQuery); setShowTicketForm(false); }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-gob-blue group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <HelpCircle className="text-gob-blue" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Consultar Estado de Ticket</h3>
                <p className="text-sm text-gray-500 mt-1">Revisa el progreso de tu solicitud</p>
              </div>
              {showTicketQuery ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
          </button>
        </div>
      </section>

      {/* Inline Ticket Form */}
      {showTicketForm && (
        <section className="max-w-3xl mx-auto px-4 mt-8 animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Ticket className="text-gob-red" size={24} />
              Nuevo Ticket de Soporte
            </h3>
            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                ✅ ¡Ticket creado exitosamente! Recibirá un correo con el número de seguimiento.
              </div>
            )}
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input required type="text" value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent" placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                  <input required type="email" value={formData.requesterEmail} onChange={e => setFormData({...formData, requesterEmail: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent" placeholder="correo@ejemplo.cl" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent">
                    <option value="">Seleccionar categoría</option>
                    {publicCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                  <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent" placeholder="Resumen breve del problema" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada *</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-red focus:border-transparent resize-none"
                  placeholder="Describe el problema con el mayor detalle posible..." />
              </div>
              <button type="submit" className="w-full bg-gob-red hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Send size={18} />
                Enviar Solicitud
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Inline Ticket Query */}
      {showTicketQuery && (
        <section className="max-w-3xl mx-auto px-4 mt-8 animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <HelpCircle className="text-gob-blue" size={24} />
              Consultar Estado de Ticket
            </h3>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Ej: TKT-2026-00001"
                value={queryTicketNumber}
                onChange={e => setQueryTicketNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQueryTicket()}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-blue focus:border-transparent"
              />
              <button onClick={handleQueryTicket} className="bg-gob-blue hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Consultar
              </button>
            </div>
            {queryError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
                ❌ {queryError}
              </div>
            )}
            {queriedTicket && (
              <div className="border border-gray-200 rounded-xl p-6 animate-fade-in">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-mono font-bold text-lg text-gob-blue">{queriedTicket.ticketNumber}</span>
                  {getStatusBadge(queriedTicket.status)}
                  {getPriorityBadge(queriedTicket.priority)}
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{queriedTicket.subject}</h4>
                <p className="text-sm text-gray-600 mb-4">{queriedTicket.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Categoría:</span> <span className="font-medium">{queriedTicket.category}</span></div>
                  <div><span className="text-gray-500">Creado:</span> <span className="font-medium">{format(new Date(queriedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span></div>
                  <div><span className="text-gray-500">Departamento:</span> <span className="font-medium">{queriedTicket.department}</span></div>
                  <div><span className="text-gray-500">Ubicación:</span> <span className="font-medium">{queriedTicket.location}</span></div>
                </div>
                {queriedTicket.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Últimas actualizaciones:</h5>
                    {queriedTicket.history.slice(-3).map((h: any) => (
                      <div key={h.id} className={`text-sm p-2 rounded mb-2 ${h.type === 'internal_note' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                        <p className="text-gray-700">{h.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Explora por Categorías</h3>
        <p className="text-gray-500 text-center mb-8">Encuentra respuestas rápidas a las preguntas más frecuentes</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {publicCategories.map(cat => {
            const articleCount = publicArticles.filter(a => a.category === cat.name).length;
            return (
              <div key={cat.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <FileText className="text-gob-blue" size={20} />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">{cat.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                <p className="text-xs text-gob-blue mt-2 font-medium">{articleCount} artículo{articleCount !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Artículos Destacados</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {publicArticles.filter(a => a.featured).map(article => (
            <div key={article.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-gob-blue transition-colors">
              <span className="text-xs bg-blue-50 text-gob-blue px-2 py-1 rounded-full font-medium">{article.category}</span>
              <h4 className="font-semibold text-gray-800 mt-3 mb-2">{article.title}</h4>
              <p className="text-sm text-gray-500">{article.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gob-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Gobierno de Chile — Mesa de Ayuda TI</p>
          <p className="text-xs text-gray-500 mt-1">Todos los derechos reservados. Versión 1.0</p>
        </div>
      </footer>
    </div>
  );
}

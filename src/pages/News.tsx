import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Newspaper, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function News() {
  const { news, createNews, updateNews, deleteNews } = useData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'Institucional', published: true });

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor';

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingId) {
      updateNews(editingId, form);
    } else {
      createNews({ ...form, author: user?.fullName || '' });
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ title: '', content: '', category: 'Institucional', published: true });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ title: item.title, content: item.content, category: item.category, published: item.published });
    setShowModal(true);
  };

  const publishedNews = news.filter(n => n.published);
  const draftNews = news.filter(n => !n.published);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📰 Zona de Noticias</h1>
          <p className="text-gray-500 text-sm mt-1">Avisos y noticias institucionales</p>
        </div>
        {canEdit && (
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ title: '', content: '', category: 'Institucional', published: true }); }}
            className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
            <Plus size={18} /> Nueva Noticia
          </button>
        )}
      </div>

      {/* Published */}
      <div className="space-y-4 mb-8">
        {publishedNews.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs bg-blue-50 text-gob-blue px-2 py-1 rounded-full font-medium">{item.category}</span>
                <h3 className="text-lg font-semibold text-gray-800 mt-2">{item.title}</h3>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-gob-blue hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => deleteNews(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span>Por {item.author}</span>
              <span>{format(new Date(item.createdAt), 'dd MMM yyyy', { locale: es })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Drafts */}
      {draftNews.length > 0 && canEdit && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><EyeOff size={18} /> Borradores</h2>
          <div className="space-y-3">
            {draftNews.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Borrador</span>
                    <h3 className="font-medium text-gray-700 mt-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-gob-blue rounded"><Edit2 size={14} /></button>
                    <button onClick={() => deleteNews(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {news.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          <Newspaper size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No hay noticias publicadas</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-800">{editingId ? 'Editar' : 'Nueva'} Noticia</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                  <option>Institucional</option>
                  <option>Capacitación</option>
                  <option>Seguridad</option>
                  <option>Tecnología</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
                <textarea rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="rounded" />
                <span className="text-sm text-gray-700">Publicar inmediatamente</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="px-5 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium">{editingId ? 'Actualizar' : 'Publicar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

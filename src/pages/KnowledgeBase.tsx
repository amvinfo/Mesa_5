import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, BookOpen, Globe, Lock, X, Edit2, Trash2 } from 'lucide-react';

export default function KnowledgeBase() {
  const { articles, categories, createArticle, updateArticle, deleteArticle } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewArticle, setViewArticle] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', summary: '', content: '', category: '', visibility: 'both' as const, status: 'published' as const,
    tags: '', keywords: '', featured: false
  });

  const filtered = articles.filter(a => {
    const matchTab = activeTab === 'external' ? (a.visibility === 'external' || a.visibility === 'both') : a.visibility === 'internal' || a.visibility === 'both';
    const matchSearch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || a.category === filterCategory;
    return matchTab && matchSearch && matchCategory;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      author: user?.fullName || 'Sistema'
    };
    if (editingId) {
      updateArticle(editingId, data);
    } else {
      createArticle(data);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', summary: '', content: '', category: '', visibility: 'both', status: 'published', tags: '', keywords: '', featured: false });
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setFormData({
      title: article.title, summary: article.summary, content: article.content, category: article.category,
      visibility: article.visibility, status: article.status,
      tags: article.tags.join(', '), keywords: article.keywords.join(', '), featured: article.featured
    });
    setShowModal(true);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Base de Conocimiento</h1>
          <p className="text-gray-500 text-sm mt-1">Artículos y guías de ayuda</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingId(null); }} className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
          <Plus size={18} />
          Nuevo Artículo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button onClick={() => setActiveTab('external')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'external' ? 'bg-white shadow-sm text-gob-blue' : 'text-gray-600 hover:text-gray-800'}`}>
          <Globe size={16} /> Externa (Pública)
        </button>
        <button onClick={() => setActiveTab('internal')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'internal' ? 'bg-white shadow-sm text-gob-blue' : 'text-gray-600 hover:text-gray-800'}`}>
          <Lock size={16} /> Interna
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar artículos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
          <option value="">Todas las categorías</option>
          {categories.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(article => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs bg-blue-50 text-gob-blue px-2 py-1 rounded-full font-medium">{article.category}</span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(article)} className="p-1.5 text-gray-400 hover:text-gob-blue hover:bg-blue-50 rounded transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteArticle(article.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-gob-blue" onClick={() => setViewArticle(article)}>{article.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{article.summary}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded ${article.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {article.status === 'published' ? 'Publicado' : 'Borrador'}
              </span>
              {article.featured && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">⭐ Destacado</span>}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No se encontraron artículos</p>
        </div>
      )}

      {/* View Article Modal */}
      {viewArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{viewArticle.title}</h2>
              <button onClick={() => setViewArticle(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-blue-50 text-gob-blue px-2 py-1 rounded-full">{viewArticle.category}</span>
                <span className="text-xs text-gray-400">Por {viewArticle.author}</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: viewArticle.content }} />
              {viewArticle.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Etiquetas:</p>
                  <div className="flex flex-wrap gap-1">
                    {viewArticle.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumen *</label>
                <input required type="text" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (HTML soportado) *</label>
                <textarea required rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent resize-none font-mono" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="">Seleccionar</option>
                    {categories.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidad</label>
                  <select value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="both">Ambas (Externa e Interna)</option>
                    <option value="external">Solo Externa</option>
                    <option value="internal">Solo Interna</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent">
                    <option value="published">Publicado</option>
                    <option value="draft">Borrador</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 text-gob-blue rounded border-gray-300 focus:ring-gob-blue" />
                    <span className="text-sm text-gray-700">Artículo destacado</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" placeholder="ej: correo, acceso, contraseña" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palabras clave (separadas por coma)</label>
                <input type="text" value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" placeholder="ej: email, password, login" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">{editingId ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Pin, Edit2, Trash2, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Board() {
  const { boardPosts, createBoardPost, updateBoardPost, deleteBoardPost } = useData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: 'blue', pinned: false });

  const colorMap: Record<string, string> = {
    blue: 'border-blue-400 bg-blue-50',
    yellow: 'border-yellow-400 bg-yellow-50',
    green: 'border-green-400 bg-green-50',
    purple: 'border-purple-400 bg-purple-50',
    red: 'border-red-400 bg-red-50',
    gray: 'border-gray-300 bg-gray-50'
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingId) {
      updateBoardPost(editingId, form);
    } else {
      createBoardPost({ ...form, author: user?.fullName || '', authorId: user?.id || '' });
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ title: '', content: '', color: 'blue', pinned: false });
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content, color: post.color, pinned: post.pinned });
    setShowModal(true);
  };

  const sorted = [...boardPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📌 Pizarra de Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">Espacio colaborativo del equipo</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ title: '', content: '', color: 'blue', pinned: false }); }}
          className="bg-gob-blue hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
          <Plus size={18} /> Nueva Publicación
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(post => (
          <div key={post.id} className={`rounded-xl border-l-4 p-5 shadow-sm hover:shadow-md transition-shadow ${colorMap[post.color] || colorMap.blue}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {post.pinned && <Pin size={14} className="text-gob-blue" />}
                <h3 className="font-semibold text-gray-800 text-sm">{post.title}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(post)} className="p-1 text-gray-400 hover:text-gob-blue rounded"><Edit2 size={13} /></button>
                <button onClick={() => deleteBoardPost(post.id)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{post.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{format(new Date(post.createdAt), 'dd/MM/yy HH:mm', { locale: es })}</span>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No hay publicaciones en la pizarra</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{editingId ? 'Editar' : 'Nueva'} Publicación</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
                <textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gob-blue focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {Object.keys(colorMap).map(c => (
                    <button key={c} onClick={() => setForm({...form, color: c})}
                      className={`w-8 h-8 rounded-full border-2 ${form.color === c ? 'border-gob-blue scale-110' : 'border-gray-200'} ${colorMap[c].split(' ')[1]}`} />
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} className="rounded" />
                <span className="text-sm text-gray-700">Fijar publicación (aparece primero)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="px-5 py-2 bg-gob-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium">Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

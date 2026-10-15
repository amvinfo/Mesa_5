import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, BookOpen, Settings, UserCircle, Globe, LogOut, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'tickets', label: 'Gestión de Tickets', icon: Ticket },
    { id: 'knowledge', label: 'Base de Conocimiento', icon: BookOpen },
    { id: 'admin', label: 'Administración', icon: Settings, adminOnly: true },
    { id: 'profile', label: 'Actualizar Datos', icon: UserCircle },
  ];

  const filteredItems = menuItems.filter(item => !item.adminOnly || user?.role === 'admin');

  const handleLogout = () => {
    logout();
    window.location.hash = '#/';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gob-dark text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gob-red rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏛️</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold">GdC | HELPDESK</h2>
                  <p className="text-xs text-gray-400">Mesa de Ayuda TI</p>
                </div>
              </div>
              <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* User info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role === 'admin' ? 'Administrador' : user?.role === 'supervisor' ? 'Supervisor' : 'Técnico'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onToggle(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  currentView === item.id
                    ? 'bg-white/10 text-white border-r-3 border-gob-red'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <a
              href="#/"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Globe size={18} />
              Portal Ciudadano
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

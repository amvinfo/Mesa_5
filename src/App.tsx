import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import PublicPortal from './pages/PublicPortal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketManagement from './pages/TicketManagement';
import TicketDetail from './pages/TicketDetail';
import KnowledgeBase from './pages/KnowledgeBase';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Board from './pages/Board';
import News from './pages/News';
import Notifications from './pages/Notifications';
import EmailLogs from './pages/EmailLogs';
import Sidebar from './components/Sidebar';
import { Menu, Bell, User } from 'lucide-react';

function AppContent() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    const handleHash = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (hash === '#/' || hash === '' || hash === '#') return <PublicPortal />;
  if (hash === '#/login') {
    if (isAuthenticated) { window.location.hash = '#/dashboard'; return null; }
    return <Login />;
  }

  if (!isAuthenticated) { window.location.hash = '#/login'; return <Login />; }

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSelectedTicketId(null);
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setCurrentView('ticketDetail');
  };

  const unreadCount = notifications.filter(n => !n.read && (n.forRole === 'all' || n.forRole === user?.role)).length;

  const viewLabels: Record<string, string> = {
    dashboard: '📊 Resumen',
    tickets: '🎫 Gestión de Tickets',
    ticketDetail: '🎫 Detalle de Ticket',
    board: '📌 Pizarra de Eventos',
    news: '📰 Zona de Noticias',
    notifications: '🔔 Notificaciones',
    emails: '✉️ Registro de Correos',
    knowledge: '📚 Base de Conocimiento',
    admin: '⚙️ Administración',
    profile: '🔄 Mi Perfil',
  };

  const renderContent = () => {
    if (selectedTicketId) return <TicketDetail ticketId={selectedTicketId} onBack={() => { setSelectedTicketId(null); setCurrentView('tickets'); }} />;
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'tickets': return <TicketManagement onSelectTicket={handleSelectTicket} />;
      case 'board': return <Board />;
      case 'news': return <News />;
      case 'notifications': return <Notifications />;
      case 'emails': return <EmailLogs />;
      case 'knowledge': return <KnowledgeBase />;
      case 'admin': return user?.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600 hover:text-gray-800 p-1">
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-gray-600">{viewLabels[selectedTicketId ? 'ticketDetail' : currentView] || ''}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleNavigate('notifications')} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gob-red text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gob-blue rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrador' : user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="animate-fade-in">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

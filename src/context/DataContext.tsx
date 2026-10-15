import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Ticket, KnowledgeArticle, Category, Department, Location,
  SupportTeam, TicketType, AuditLog, SystemConfig,
  BoardPost, NewsItem, Notification, EmailLog, EmailTemplate,
  seedTickets, seedArticles, seedCategories, seedDepartments,
  seedLocations, seedTeams, seedTicketTypes, seedAuditLogs,
  defaultSystemConfig, seedBoardPosts, seedNews, seedNotifications,
  seedEmailLogs, seedEmailTemplates
} from '../data/seedData';

interface DataContextType {
  tickets: Ticket[];
  articles: KnowledgeArticle[];
  categories: Category[];
  departments: Department[];
  locations: Location[];
  teams: SupportTeam[];
  ticketTypes: TicketType[];
  auditLogs: AuditLog[];
  systemConfig: SystemConfig;
  boardPosts: BoardPost[];
  news: NewsItem[];
  notifications: Notification[];
  emailLogs: EmailLog[];
  emailTemplates: EmailTemplate[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'history'>) => Ticket;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  addTicketHistory: (ticketId: string, entry: Omit<Ticket['history'][0], 'id' | 'createdAt'>) => void;
  createArticle: (article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArticle: (id: string, data: Partial<KnowledgeArticle>) => void;
  deleteArticle: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, data: Partial<Location>) => void;
  addTeam: (team: Omit<SupportTeam, 'id'>) => void;
  updateTeam: (id: string, data: Partial<SupportTeam>) => void;
  addTicketType: (tt: Omit<TicketType, 'id'>) => void;
  updateTicketType: (id: string, data: Partial<TicketType>) => void;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getTicketByNumber: (num: string) => Ticket | undefined;
  getKPIs: () => Record<string, number | string>;
  // Board
  createBoardPost: (post: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBoardPost: (id: string, data: Partial<BoardPost>) => void;
  deleteBoardPost: (id: string) => void;
  // News
  createNews: (item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNews: (id: string, data: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  // Email
  addEmailLog: (log: Omit<EmailLog, 'id' | 'sentAt'>) => void;
  deleteEmailLog: (id: string) => void;
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  // Chart data
  getChartData: () => { byCategory: { name: string; value: number }[]; byPriority: { name: string; value: number }[]; trend: { date: string; created: number; resolved: number }[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [articles, setArticles] = useState<KnowledgeArticle[]>(seedArticles);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [locations, setLocations] = useState<Location[]>(seedLocations);
  const [teams, setTeams] = useState<SupportTeam[]>(seedTeams);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(seedTicketTypes);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seedAuditLogs);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(seedBoardPosts);
  const [news, setNews] = useState<NewsItem[]>(seedNews);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(seedEmailLogs);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(seedEmailTemplates);

  const generateTicketNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const count = tickets.length + 1;
    return `TKT-${year}-${String(count).padStart(5, '0')}`;
  }, [tickets.length]);

  const createTicket = useCallback((data: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'history'>): Ticket => {
    const now = new Date().toISOString();
    const newTicket: Ticket = { ...data, id: `tk${Date.now()}`, ticketNumber: generateTicketNumber(), createdAt: now, updatedAt: now, resolvedAt: null, history: [] };
    setTickets(prev => [newTicket, ...prev]);
    setAuditLogs(prev => [{ id: `al${Date.now()}`, action: 'TICKET_CREATE', details: `Ticket ${newTicket.ticketNumber} creado`, user: 'Sistema', timestamp: now }, ...prev]);
    return newTicket;
  }, [generateTicketNumber]);

  const updateTicket = useCallback((id: string, data: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
  }, []);

  const addTicketHistory = useCallback((ticketId: string, entry: Omit<Ticket['history'][0], 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, updatedAt: now, history: [...t.history, { ...entry, id: `h${Date.now()}`, createdAt: now }] } : t));
  }, []);

  const createArticle = useCallback((data: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setArticles(prev => [{ ...data, id: `a${Date.now()}`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const updateArticle = useCallback((id: string, data: Partial<KnowledgeArticle>) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a));
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => { setCategories(prev => [...prev, { ...cat, id: `c${Date.now()}` }]); }, []);
  const updateCategory = useCallback((id: string, data: Partial<Category>) => { setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)); }, []);
  const addDepartment = useCallback((dept: Omit<Department, 'id'>) => { setDepartments(prev => [...prev, { ...dept, id: `d${Date.now()}` }]); }, []);
  const updateDepartment = useCallback((id: string, data: Partial<Department>) => { setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d)); }, []);
  const addLocation = useCallback((loc: Omit<Location, 'id'>) => { setLocations(prev => [...prev, { ...loc, id: `l${Date.now()}` }]); }, []);
  const updateLocation = useCallback((id: string, data: Partial<Location>) => { setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l)); }, []);
  const addTeam = useCallback((team: Omit<SupportTeam, 'id'>) => { setTeams(prev => [...prev, { ...team, id: `t${Date.now()}` }]); }, []);
  const updateTeam = useCallback((id: string, data: Partial<SupportTeam>) => { setTeams(prev => prev.map(t => t.id === id ? { ...t, ...data } : t)); }, []);
  const addTicketType = useCallback((tt: Omit<TicketType, 'id'>) => { setTicketTypes(prev => [...prev, { ...tt, id: `tt${Date.now()}` }]); }, []);
  const updateTicketType = useCallback((id: string, data: Partial<TicketType>) => { setTicketTypes(prev => prev.map(t => t.id === id ? { ...t, ...data } : t)); }, []);

  const updateSystemConfig = useCallback((config: Partial<SystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...config }));
    setAuditLogs(prev => [{ id: `al${Date.now()}`, action: 'CONFIG_CHANGE', details: 'Configuración del sistema actualizada', user: 'admin', timestamp: new Date().toISOString() }, ...prev]);
  }, []);

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    setAuditLogs(prev => [{ ...log, id: `al${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]);
  }, []);

  const getTicketByNumber = useCallback((num: string) => tickets.find(t => t.ticketNumber.toLowerCase() === num.toLowerCase()), [tickets]);

  const getKPIs = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = tickets.length;
    const abiertos = tickets.filter(t => t.status === 'abierto').length;
    const enProceso = tickets.filter(t => t.status === 'en_proceso').length;
    const resueltos = tickets.filter(t => t.status === 'resuelto' || t.status === 'cerrado').length;
    const criticos = tickets.filter(t => (t.priority === 'urgente' || t.priority === 'alta') && t.status !== 'resuelto' && t.status !== 'cerrado').length;
    const sinAsignar = tickets.filter(t => !t.assignedTo && t.status !== 'resuelto' && t.status !== 'cerrado').length;
    const creadosHoy = tickets.filter(t => t.createdAt.split('T')[0] === today).length;
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    let avgResolution = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((acc, t) => {
        const created = new Date(t.createdAt).getTime();
        const resolved = new Date(t.resolvedAt!).getTime();
        return acc + (resolved - created) / 3600000;
      }, 0);
      avgResolution = Math.round(totalHours / resolvedTickets.length * 10) / 10;
    }
    return { total, abiertos, enProceso, resueltos, criticos, sinAsignar, creadosHoy, avgResolution };
  }, [tickets]);

  // Board
  const createBoardPost = useCallback((data: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setBoardPosts(prev => [{ ...data, id: `bp${Date.now()}`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);
  const updateBoardPost = useCallback((id: string, data: Partial<BoardPost>) => {
    setBoardPosts(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  }, []);
  const deleteBoardPost = useCallback((id: string) => { setBoardPosts(prev => prev.filter(p => p.id !== id)); }, []);

  // News
  const createNews = useCallback((data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setNews(prev => [{ ...data, id: `n${Date.now()}`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);
  const updateNews = useCallback((id: string, data: Partial<NewsItem>) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
  }, []);
  const deleteNews = useCallback((id: string) => { setNews(prev => prev.filter(n => n.id !== id)); }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  const deleteNotification = useCallback((id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); }, []);
  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications(prev => [{ ...notif, id: `notif${Date.now()}`, createdAt: new Date().toISOString(), read: false }, ...prev]);
  }, []);

  // Email
  const addEmailLog = useCallback((log: Omit<EmailLog, 'id' | 'sentAt'>) => {
    setEmailLogs(prev => [{ ...log, id: `el${Date.now()}`, sentAt: new Date().toISOString() }, ...prev]);
  }, []);
  const deleteEmailLog = useCallback((id: string) => { setEmailLogs(prev => prev.filter(l => l.id !== id)); }, []);
  const updateEmailTemplate = useCallback((id: string, data: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
  }, []);

  // Chart data
  const getChartData = useCallback(() => {
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    tickets.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });
    const trend: { date: string; created: number; resolved: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const created = tickets.filter(t => t.createdAt.split('T')[0] === dateStr).length;
      const resolved = tickets.filter(t => t.resolvedAt && t.resolvedAt.split('T')[0] === dateStr).length;
      trend.push({ date: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }), created, resolved });
    }
    return {
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      byPriority: Object.entries(byPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })),
      trend
    };
  }, [tickets]);

  return (
    <DataContext.Provider value={{
      tickets, articles, categories, departments, locations, teams, ticketTypes, auditLogs, systemConfig,
      boardPosts, news, notifications, emailLogs, emailTemplates,
      createTicket, updateTicket, addTicketHistory, createArticle, updateArticle, deleteArticle,
      addCategory, updateCategory, addDepartment, updateDepartment, addLocation, updateLocation,
      addTeam, updateTeam, addTicketType, updateTicketType, updateSystemConfig, addAuditLog,
      getTicketByNumber, getKPIs,
      createBoardPost, updateBoardPost, deleteBoardPost,
      createNews, updateNews, deleteNews,
      markNotificationRead, markAllNotificationsRead, deleteNotification, addNotification,
      addEmailLog, deleteEmailLog, updateEmailTemplate,
      getChartData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

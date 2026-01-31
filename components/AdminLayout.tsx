import React, { useState } from 'react';
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  Printer,
  Key,
  Bot,
  FileBarChart,
  Settings,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onCreateCase: () => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentView,
  onNavigate,
  onLogout,
  onCreateCase,
  title,
  subtitle,
  actions
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden relative">

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl shadow-slate-900/10 transition-transform duration-300 ease-in-out flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800 flex-shrink-0 justify-between">
          <div className="flex items-center space-x-3 text-white">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Search size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide uppercase">Investiga</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
          <SidebarItem icon={<Briefcase size={20} />} label="Casos & Histórias" active={currentView === 'cases'} onClick={() => handleNavClick('cases')} />
          <SidebarItem icon={<Printer size={20} />} label="Diagramação" active={false} onClick={() => handleNavClick('layout_print')} />
          <SidebarItem icon={<Key size={20} />} label="Gestão de Códigos" active={currentView === 'code_management'} onClick={() => handleNavClick('code_management')} />
          <SidebarItem icon={<Bot size={20} />} label="Agentes Virtuais" active={currentView === 'virtual_agents'} onClick={() => handleNavClick('virtual_agents')} />
          <SidebarItem icon={<FileBarChart size={20} />} label="Relatórios" active={currentView === 'reports'} onClick={() => handleNavClick('reports')} />

          <div className="pt-8 pb-2 px-4">
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Sistema</p>
          </div>
          <SidebarItem icon={<Settings size={20} />} label="Configurações" active={currentView === 'settings'} onClick={() => handleNavClick('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} className="mr-3" />
            Sair da Plataforma
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">

        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex-shrink-0 px-4 md:px-8 flex items-center justify-between z-20">
          <div className="flex items-center min-w-0">
            <button
              className="mr-4 md:hidden text-slate-500 hover:text-brand-600 p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col truncate">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{title}</h1>
              {subtitle && <p className="hidden md:block text-sm text-slate-500 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0 ml-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-48"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {actions && (
              <div className="flex items-center">
                <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`
            flex items-center px-4 py-3 mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-200
            ${active
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `}
  >
    <div className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
      {icon}
    </div>
    <span className="ml-3 font-medium text-sm">{label}</span>
  </div>
);

export default AdminLayout;
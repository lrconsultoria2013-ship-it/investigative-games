import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import CreateCaseScreen from './components/CreateCaseScreen';
import CasesScreen from './components/CasesScreen';
import LayoutPrintScreen from './components/LayoutPrintScreen';
import CodeManagementScreen from './components/CodeManagementScreen';
import VirtualAgentsScreen from './components/VirtualAgentsScreen';
import ReportsScreen from './components/ReportsScreen';
import SettingsScreen from './components/SettingsScreen';
import AdminLayout from './components/AdminLayout';
import { Download, Plus, Save } from 'lucide-react';
import Button from './components/ui/Button';
import { supabase } from './lib/supabase';

type ViewState = 'login' | 'dashboard' | 'cases' | 'create_case' | 'layout_print' | 'code_management' | 'virtual_agents' | 'reports' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  // Track where the user came from when entering layout view
  const [layoutSource, setLayoutSource] = useState<'dashboard' | 'cases' | 'create_case'>('create_case');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentView('dashboard');
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Only redirect to dashboard if currently on login
        // This prevents resetting view when purely refreshing token or switching tabs
        // But for simplicity in this structure:
        // setCurrentView('dashboard'); 
        // Better: let the user stay where they are, but if they are on login and get a session, move them.
        // However, if they logout, move to login.
      } else {
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('login');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewState);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackFromLayout = () => {
    if (layoutSource === 'dashboard') {
      setCurrentView('dashboard');
    } else if (layoutSource === 'cases') {
      setCurrentView('cases');
    } else {
      setCurrentView('create_case');
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Visão Geral';
      case 'cases': return 'Casos e Histórias';
      case 'code_management': return 'Gestão de Códigos';
      case 'virtual_agents': return 'Agentes Virtuais';
      case 'reports': return 'Relatórios & Monitoramento';
      case 'settings': return 'Configurações da Plataforma';
      default: return 'Admin';
    }
  };

  const getPageSubtitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Bem-vindo de volta, aqui está o resumo de hoje.';
      case 'cases': return 'Gerencie todo o seu catálogo de narrativas investigativas.';
      case 'code_management': return 'Gerencie, gere e monitore códigos de ativação dos jogos.';
      case 'virtual_agents': return 'Configure a personalidade e respostas das IAs dos casos.';
      case 'reports': return 'Análise detalhada de performance e vendas.';
      case 'settings': return 'Gerencie parâmetros globais, integrações e preferências.';
      default: return '';
    }
  };

  // Views that share the Admin Layout (Sidebar + Header)
  const isAdminView = ['dashboard', 'cases', 'code_management', 'virtual_agents', 'reports', 'settings'].includes(currentView);

  return (
    <div className="w-full h-screen bg-slate-50 text-slate-900">
      {currentView === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {isAdminView && (
        <AdminLayout
          currentView={currentView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onCreateCase={() => setCurrentView('create_case')}
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          actions={
            // Custom Header Actions per screen
            currentView === 'reports' ? (
              <>
                <Button variant="secondary" className="!w-auto !py-2 !px-3" onClick={() => { }}>
                  <Download size={18} className="mr-2" /> Exportar
                </Button>
              </>
            ) : currentView === 'settings' ? (
              <>
                <Button
                  className="!w-auto !py-2 !px-4"
                  onClick={() => {
                    // In a real app, this would trigger a context/store action
                    // For UI demo, the internal Save button in SettingsScreen handles the toast
                    const saveBtn = document.getElementById('save-settings-trigger');
                    if (saveBtn) saveBtn.click();
                  }}
                >
                  <Save size={18} className="mr-2" />
                  Salvar Alterações
                </Button>
              </>
            ) : undefined
          }
        >
          {currentView === 'dashboard' && <DashboardScreen />}
          {currentView === 'cases' && (
            <CasesScreen
              onCreateCase={() => setCurrentView('create_case')}
              onNavigateToLayout={() => {
                setLayoutSource('cases');
                setCurrentView('layout_print');
              }}
            />
          )}
          {currentView === 'code_management' && <CodeManagementScreen />}
          {currentView === 'virtual_agents' && <VirtualAgentsScreen />}
          {currentView === 'reports' && <ReportsScreen />}
          {currentView === 'settings' && <SettingsScreen />}
        </AdminLayout>
      )}

      {/* Focus Mode Screens (Full Screen) */}
      {currentView === 'create_case' && (
        <CreateCaseScreen
          onBack={() => setCurrentView('cases')}
          onNavigateToLayout={() => {
            setLayoutSource('create_case');
            setCurrentView('layout_print');
          }}
        />
      )}
      {currentView === 'layout_print' && (
        <LayoutPrintScreen onBack={handleBackFromLayout} />
      )}
    </div>
  );
};

export default App;
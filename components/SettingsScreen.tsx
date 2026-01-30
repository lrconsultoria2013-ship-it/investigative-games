import React, { useState } from 'react';
import { 
  Globe, 
  Cpu, 
  BookOpen, 
  Printer, 
  Key, 
  Bot, 
  BarChart3, 
  Save, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Shield,
  Palette
} from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Badge from './ui/Badge';
import TextArea from './ui/TextArea';

const SettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        showNotification('Configurações salvas com sucesso!', 'success');
    }, 1500);
  };

  const handleTestAI = () => {
    setIsTestingAI(true);
    setTimeout(() => {
        setIsTestingAI(false);
        showNotification('Conexão com AI Studio estabelecida (Latência: 45ms)', 'success');
    }, 2000);
  };

  const tabs = [
    { id: 'platform', label: 'Plataforma', icon: <Globe size={18} /> },
    { id: 'integrations', label: 'Integrações & API', icon: <Cpu size={18} /> },
    { id: 'gameplay', label: 'Criação de Casos', icon: <BookOpen size={18} /> },
    { id: 'print', label: 'Impressão & Layout', icon: <Printer size={18} /> },
    { id: 'security', label: 'Códigos & Acesso', icon: <Key size={18} /> },
    { id: 'agents', label: 'Agentes Virtuais', icon: <Bot size={18} /> },
  ];

  return (
    <div className="h-full overflow-hidden flex flex-col md:flex-row bg-slate-50 relative">
        
        {/* Notification Toast */}
        {notification && (
            <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                {notification.message}
            </div>
        )}

        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Categorias</h3>
                <div className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                                ${activeTab === tab.id 
                                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className={`mr-3 ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400'}`}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="p-4 mt-auto border-t border-slate-100">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center mb-2">
                        <Shield size={16} className="text-brand-600 mr-2" />
                        <span className="text-xs font-bold text-slate-700">Admin Master</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Você tem permissão total para alterar configurações globais.</p>
                 </div>
            </div>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Action Mobile Only (Desktop handled by App layout) */}
                <div className="md:hidden flex justify-end mb-4">
                     <Button onClick={handleSave} isLoading={isSaving} className="!w-auto">
                        <Save size={18} className="mr-2" /> Salvar
                     </Button>
                </div>

                {/* PLATFORM SETTINGS */}
                {activeTab === 'platform' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Palette size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Aparência & Plataforma</h2>
                                <p className="text-sm text-slate-500">Personalize a identidade visual do painel administrativo.</p>
                            </div>
                        </div>

                        <Card title="Identidade Visual">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select 
                                    label="Tema da Interface" 
                                    options={[
                                        { value: 'light', label: 'Claro (Padrão)' },
                                        { value: 'dark', label: 'Escuro (Dark Mode)' },
                                        { value: 'auto', label: 'Sistema' },
                                    ]}
                                    defaultValue="light"
                                />
                                <Select 
                                    label="Cor de Destaque" 
                                    options={[
                                        { value: 'blue', label: 'Investiga Blue (Padrão)' },
                                        { value: 'emerald', label: 'Emerald Green' },
                                        { value: 'violet', label: 'Ultra Violet' },
                                    ]}
                                    defaultValue="blue"
                                />
                                <Input label="Nome da Organização" defaultValue="True Crime Press" />
                                <Select 
                                    label="Idioma Padrão" 
                                    options={[
                                        { value: 'pt-BR', label: 'Português (Brasil)' },
                                        { value: 'en-US', label: 'English (US)' },
                                        { value: 'es', label: 'Español' },
                                    ]}
                                    defaultValue="pt-BR"
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* INTEGRATIONS SETTINGS */}
                {activeTab === 'integrations' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Cpu size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Integrações & API</h2>
                                <p className="text-sm text-slate-500">Gerencie conexões com serviços externos (AI, Database).</p>
                            </div>
                        </div>

                        <Card title="Google AI Studio (Gemini)">
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                                        <span className="text-sm font-medium text-slate-700">Status: Conectado</span>
                                    </div>
                                    <Badge variant="info">Quota: 45% Utilizada</Badge>
                                </div>
                                <Input 
                                    label="API Key (Gemini 1.5 Pro)" 
                                    type="password" 
                                    defaultValue="AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx"
                                    rightElement={<CheckCircle2 size={18} className="text-emerald-500" />}
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        variant="secondary" 
                                        className="!w-auto" 
                                        onClick={handleTestAI}
                                        isLoading={isTestingAI}
                                    >
                                        <Zap size={18} className="mr-2 text-yellow-500" /> 
                                        Testar Conexão
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card title="Banco de Dados (Supabase)">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Project URL" defaultValue="https://xyzproject.supabase.co" />
                                <Input label="Anon Public Key" type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
                             </div>
                        </Card>
                    </div>
                )}

                {/* GAMEPLAY SETTINGS */}
                {activeTab === 'gameplay' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><BookOpen size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Criação de Casos</h2>
                                <p className="text-sm text-slate-500">Defina os parâmetros padrão para novos jogos.</p>
                            </div>
                        </div>

                        <Card title="Defaults de Narrativa">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select 
                                    label="Complexidade Padrão" 
                                    options={[
                                        { value: 'easy', label: 'Iniciante' },
                                        { value: 'medium', label: 'Intermediário' },
                                        { value: 'hard', label: 'Avançado' },
                                    ]}
                                    defaultValue="medium"
                                />
                                <Select 
                                    label="Faixa Etária Padrão" 
                                    options={[
                                        { value: '12', label: '+12 Anos' },
                                        { value: '14', label: '+14 Anos' },
                                        { value: '18', label: '+18 Adulto' },
                                    ]}
                                    defaultValue="14"
                                />
                            </div>
                            <div className="mt-4">
                                <TextArea 
                                    label="Prompt de Sistema Global (AntiGravity Engine)"
                                    rows={4}
                                    defaultValue="Você é um escritor de mistérios premiado. Crie tramas lógicas, onde as evidências físicas sempre apontam para a verdade, mas os depoimentos podem conter mentiras."
                                    className="font-mono text-xs"
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* PRINT SETTINGS */}
                {activeTab === 'print' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Printer size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Impressão & Layout</h2>
                                <p className="text-sm text-slate-500">Configurações globais para geração de PDFs.</p>
                            </div>
                        </div>

                        <Card title="Formatação de Saída">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select 
                                    label="Formato de Papel Padrão" 
                                    options={[
                                        { value: 'a4', label: 'A4 (210x297mm)' },
                                        { value: 'letter', label: 'Letter (US)' },
                                    ]}
                                    defaultValue="a4"
                                />
                                <Select 
                                    label="Marca de Corte (Bleed)" 
                                    options={[
                                        { value: '3mm', label: '3mm (Padrão Gráfica)' },
                                        { value: 'none', label: 'Sem sangria (Impressão Doméstica)' },
                                    ]}
                                    defaultValue="3mm"
                                />
                             </div>
                             <div className="mt-4 flex items-center space-x-2">
                                <input type="checkbox" id="cmyk" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" defaultChecked />
                                <label htmlFor="cmyk" className="text-sm text-slate-700">Converter cores para CMYK automaticamente na exportação</label>
                             </div>
                        </Card>
                    </div>
                )}

                 {/* SECURITY SETTINGS */}
                 {activeTab === 'security' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Key size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Códigos & Segurança</h2>
                                <p className="text-sm text-slate-500">Regras para geração de códigos de ativação.</p>
                            </div>
                        </div>

                        <Card title="Padrões de Código">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Prefixo Global" defaultValue="TRTH" placeholder="Ex: GAME" />
                                <Select 
                                    label="Formato" 
                                    options={[
                                        { value: 'xxxx-xxxx-x', label: 'XXXX-XXXX-X (Padrão)' },
                                        { value: 'xxx-xxx-xxx', label: 'XXX-XXX-XXX' },
                                    ]}
                                    defaultValue="xxxx-xxxx-x"
                                />
                                <Input label="Validade Padrão (Dias)" type="number" defaultValue="365" />
                             </div>
                             <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                                <AlertCircle size={20} className="text-amber-600 mr-2 flex-shrink-0" />
                                <p className="text-sm text-amber-800">Alterar o prefixo global não afetará códigos já gerados e impressos. A mudança será aplicada apenas para novos lotes.</p>
                             </div>
                        </Card>
                    </div>
                )}

                 {/* AGENT SETTINGS */}
                 {activeTab === 'agents' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Bot size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Agentes Virtuais</h2>
                                <p className="text-sm text-slate-500">Controle global dos chatbots dos casos.</p>
                            </div>
                        </div>

                        <Card title="Limites e Segurança">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Limite Global de Tokens (Diário)" type="number" defaultValue="1000000" />
                                <Select 
                                    label="Nível de Filtro de Conteúdo" 
                                    options={[
                                        { value: 'strict', label: 'Rígido (Family Friendly)' },
                                        { value: 'moderate', label: 'Moderado' },
                                        { value: 'off', label: 'Desligado (Não recomendado)' },
                                    ]}
                                    defaultValue="strict"
                                />
                             </div>
                             <div className="mt-4">
                                <TextArea 
                                    label="Mensagem de Erro Padrão (Fallback)" 
                                    defaultValue="Desculpe, a conexão com a central de investigação está instável. Tente novamente em instantes."
                                />
                             </div>
                        </Card>
                    </div>
                )}
            </div>
            
            {/* Bottom Padding for Scroll */}
            <div className="h-20"></div>
        </div>
    </div>
  );
};

export default SettingsScreen;
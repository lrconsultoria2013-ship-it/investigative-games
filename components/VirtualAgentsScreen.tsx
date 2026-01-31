import React, { useState, useEffect } from 'react';
import {
    Bot,
    Search,
    Plus,
    Save,
    Play,
    Settings,
    MessageSquare,
    ShieldAlert,
    FlaskConical,
    FileText,
    CheckCircle2,
    AlertCircle,
    History,
    Zap,
    Terminal,
    X,
    Loader2
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import { supabase } from '../lib/supabase';
import { sendMessageToGemini } from '../lib/gemini';

// Layout handled by AdminLayout in App.tsx

type AgentType = 'detective' | 'lab' | 'archivist';
type AgentStatus = 'active' | 'inactive' | 'learning';

interface Agent {
    id: string;
    name: string;
    type: AgentType;
    status: AgentStatus;
    lastInteraction: string;
    systemPrompt: string;
    model: string;
    config?: any; // For extra settings
}

const VirtualAgentsScreen: React.FC = () => {
    // State
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    // Fetch Agents
    const fetchAgents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) {
                const mapped = data.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    lastInteraction: a.last_interaction ? new Date(a.last_interaction).toLocaleTimeString() : 'Nunca',
                    systemPrompt: a.system_prompt || '',
                    model: a.model || 'gemini-1.5-flash',
                    config: a.config || {}
                }));
                setAgents(mapped);
                if (mapped.length > 0 && !selectedAgentId) {
                    setSelectedAgentId(mapped[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching agents:', err);
            showNotification('Erro ao carregar agentes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const [activeTab, setActiveTab] = useState<'settings' | 'hints' | 'logs' | 'test'>('settings');
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentType, setNewAgentType] = useState<AgentType>('detective');
    const [isCreating, setIsCreating] = useState(false);


    // Chat Test State
    const [testMessage, setTestMessage] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent' | 'model', text: string }[]>([]);
    const [tempApiKey, setTempApiKey] = useState('');

    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUpdateAgentState = (field: keyof Agent, value: any) => {
        if (!selectedAgentId) return;
        setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, [field]: value } : a));
    };

    const handleUpdateConfig = (key: string, value: any) => {
        if (!selectedAgentId) return;
        const currentAgent = agents.find(a => a.id === selectedAgentId);
        if (!currentAgent) return;

        const newConfig = { ...currentAgent.config, [key]: value };
        handleUpdateAgentState('config', newConfig);
    };

    const handleUpdateHint = (level: number, text: string) => {
        if (!selectedAgentId) return;
        const currentAgent = agents.find(a => a.id === selectedAgentId);
        if (!currentAgent) return;

        const currentHints = currentAgent.config?.hints || {};
        const newHints = { ...currentHints, [level]: text };
        handleUpdateConfig('hints', newHints);
    };

    const handleSave = async () => {
        if (!selectedAgent) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('agents')
                .update({
                    name: selectedAgent.name,
                    type: selectedAgent.type,
                    status: selectedAgent.status,
                    model: selectedAgent.model,
                    system_prompt: selectedAgent.systemPrompt,
                    config: selectedAgent.config,
                    last_interaction: new Date().toISOString(),
                })
                .eq('id', selectedAgent.id);

            if (error) throw error;

            showNotification('Agente salvo com sucesso.', 'success');
        } catch (err) {
            console.error('Error saving agent:', err);
            showNotification('Erro ao salvar agente', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAgent = async () => {
        if (!newAgentName.trim()) {
            showNotification('Nome do agente é obrigatório', 'error');
            return;
        }

        setIsCreating(true);
        try {
            const { data, error } = await supabase
                .from('agents')
                .insert({
                    name: newAgentName,
                    type: newAgentType,
                    status: 'active',
                    model: 'gemini-1.5-flash',
                    system_prompt: 'Você é um assistente útil.'
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                showNotification('Agente criado com sucesso!', 'success');
                setShowCreateModal(false);
                setNewAgentName('');
                await fetchAgents();
                setSelectedAgentId(data.id);
            }
        } catch (err) {
            console.error('Error creating agent:', err);
            showNotification('Erro ao criar agente', 'error');
        } finally {
            setIsCreating(false);
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testMessage.trim() || !selectedAgent) return;

        const updatedHistory = [...chatHistory, { role: 'user' as const, text: testMessage }];
        setChatHistory(updatedHistory);
        setTestMessage('');
        setIsSendingMessage(true);

        try {
            // Prepare history for Gemini (excluding the last one which is sent as prompt)
            // Gemini SDK format: { role: "user" | "model", parts: [{ text: "..." }] }
            const apiHistory = updatedHistory.slice(0, -1).map(msg => ({
                role: msg.role === 'agent' ? 'model' : 'user' as 'model' | 'user',
                parts: [{ text: msg.text }]
            }));

            // Get API Key from environment (must be prefixed with VITE_)
            const apiKey = tempApiKey || import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
                throw new Error('Chave de API do Gemini não configurada.');
            }

            const response = await sendMessageToGemini(
                apiHistory,
                selectedAgent.systemPrompt || 'Responda como um assistente.',
                testMessage, // Current message
                apiKey
            );

            setChatHistory([...updatedHistory, { role: 'agent', text: response }]);

        } catch (error: any) {
            console.error("Gemini Error:", error);
            setChatHistory([...updatedHistory, { role: 'agent', text: `[Erro]: ${error.message || 'Falha ao conectar com a IA.'}` }]);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const getAgentIcon = (type: AgentType) => {
        switch (type) {
            case 'detective': return <ShieldAlert size={18} />;
            case 'lab': return <FlaskConical size={18} />;
            case 'archivist': return <FileText size={18} />;
        }
    };

    const getStatusColor = (status: AgentStatus) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'inactive': return 'bg-slate-300';
            case 'learning': return 'bg-amber-500';
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Criar Novo Agente</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Nome do Agente"
                                placeholder="Ex: Sherlock Holmes"
                                value={newAgentName}
                                onChange={(e) => setNewAgentName(e.target.value)}
                            />
                            <Select
                                label="Tipo de Agente"
                                value={newAgentType}
                                onChange={(e) => setNewAgentType(e.target.value as AgentType)}
                                options={[
                                    { value: 'detective', label: 'Detetive' },
                                    { value: 'lab', label: 'Laboratório Forense' },
                                    { value: 'archivist', label: 'Arquivista' },
                                ]}
                            />
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreateAgent} isLoading={isCreating}>
                                <Plus size={18} className="mr-2" />
                                Criar Agente
                            </Button>
                        </div>
                    </div>
                </div>
            )}


            {/* Main Content - Master/Detail Layout */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full h-full">

                    {/* Left Sidebar: Agent List */}
                    <aside className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col h-1/3 lg:h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar agente..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <button onClick={() => setShowCreateModal(true)} className="ml-2 p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100"><Plus size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {agents.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">Nenhum agente cadastrado. <br /> Clique em + para criar um.</div>
                            ) : (
                                agents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        onClick={() => setSelectedAgentId(agent.id)}
                                        className={`
                            p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50
                            ${selectedAgentId === agent.id ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'}
                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-semibold text-sm ${selectedAgentId === agent.id ? 'text-brand-900' : 'text-slate-700'}`}>
                                                {agent.name}
                                            </h3>
                                            <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} title={agent.status}></div>
                                        </div>

                                        <div className="flex items-center text-xs text-slate-500 mb-2">
                                            <span className="flex items-center mr-3">
                                                {getAgentIcon(agent.type)}
                                                <span className="ml-1 capitalize">{agent.type === 'lab' ? 'Laboratório' : agent.type === 'archivist' ? 'Arquivista' : 'Detetive'}</span>
                                            </span>
                                        </div>

                                        <p className="text-[10px] text-slate-400 flex items-center">
                                            <History size={10} className="mr-1" />
                                            Última interação: {agent.lastInteraction}
                                        </p>
                                    </div>
                                )))}
                        </div>
                    </aside>

                    {/* Right Panel: Configuration */}
                    {selectedAgent ? (
                        <section className="lg:w-2/3 bg-slate-50 flex flex-col h-2/3 lg:h-full overflow-hidden">

                            {/* Config Header */}
                            <div className="bg-white px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                                <div className="flex items-center">
                                    <div className="hidden md:flex h-10 w-10 rounded-full bg-slate-100 items-center justify-center text-slate-500 mr-3 border border-slate-200">
                                        {getAgentIcon(selectedAgent.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-base md:text-lg font-bold text-slate-800">{selectedAgent.name}</h2>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">ID: {selectedAgent.id.substring(0, 8)}...</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="hidden md:inline text-brand-600 font-medium">{selectedAgent.model}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="secondary"
                                        className="!w-auto !p-2 md:!px-4 md:!py-2"
                                        onClick={() => setActiveTab('test')}
                                    >
                                        <Play size={16} className="md:mr-2" />
                                        <span className="hidden md:inline">Testar</span>
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                        className="!w-auto bg-brand-900 hover:bg-slate-800 !p-2 md:!px-4 md:!py-2"
                                    >
                                        <Save size={16} className="md:mr-2" />
                                        <span className="hidden md:inline">Salvar</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="bg-white border-b border-slate-200 px-4 md:px-6 overflow-x-auto">
                                <div className="flex space-x-6 min-w-max">
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'settings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Settings size={16} className="mr-2" /> Configurações
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hints')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'hints' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Zap size={16} className="mr-2" /> Lógica
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('logs')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'logs' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Terminal size={16} className="mr-2" /> Logs
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('test')}
                                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'test' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <MessageSquare size={16} className="mr-2" /> Simulador
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">

                                {/* SETTINGS TAB */}
                                {activeTab === 'settings' && (
                                    <div className="space-y-6 max-w-3xl animate-fadeIn">
                                        <Card title="Perfil do Agente">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Nome de Exibição"
                                                    value={selectedAgent.name}
                                                    onChange={(e) => handleUpdateAgentState('name', e.target.value)}
                                                />
                                                <Select
                                                    label="Função (Arquétipo)"
                                                    options={[
                                                        { value: 'detective', label: 'Detetive Líder (Guia)' },
                                                        { value: 'lab', label: 'Especialista Forense (Análise)' },
                                                        { value: 'archivist', label: 'Arquivista (Dados Históricos)' },
                                                    ]}
                                                    value={selectedAgent.type}
                                                    onChange={(e) => handleUpdateAgentState('type', e.target.value)}
                                                />
                                                <Select
                                                    label="Status Operacional"
                                                    options={[
                                                        { value: 'active', label: 'Ativo (Disponível aos jogadores)' },
                                                        { value: 'inactive', label: 'Inativo (Manutenção)' },
                                                        { value: 'learning', label: 'Modo Aprendizado (Beta)' },
                                                    ]}
                                                    value={selectedAgent.status}
                                                    onChange={(e) => handleUpdateAgentState('status', e.target.value)}
                                                />
                                                <Select
                                                    label="Modelo de IA"
                                                    options={[
                                                        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                                                        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
                                                        { value: 'gpt-4', label: 'GPT-4o' },
                                                    ]}
                                                    value={selectedAgent.model}
                                                    onChange={(e) => handleUpdateAgentState('model', e.target.value)}
                                                />
                                            </div>
                                        </Card>

                                        <Card title="Personalidade e Comportamento">
                                            <div className="space-y-4">
                                                <TextArea
                                                    label="System Prompt (Instruções Principais)"
                                                    rows={6}
                                                    value={selectedAgent.systemPrompt}
                                                    onChange={(e) => handleUpdateAgentState('systemPrompt', e.target.value)}
                                                    className="font-mono text-sm"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Limite de Mensagens (por jogador/dia)"
                                                        type="number"
                                                        value={selectedAgent.config?.messageLimit || 50}
                                                        onChange={(e) => handleUpdateConfig('messageLimit', parseInt(e.target.value))}
                                                    />
                                                    <Input
                                                        label="Tempo de Delay (simulação de digitação em ms)"
                                                        type="number"
                                                        value={selectedAgent.config?.typingDelay || 1500}
                                                        onChange={(e) => handleUpdateConfig('typingDelay', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* HINTS TAB */}
                                {activeTab === 'hints' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                                            <Zap className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-900">Dicas Graduais</h4>
                                                <p className="text-sm text-blue-700 mt-1">Configure como o agente libera informações. O sistema impede spoilers diretos a menos que o "Nível de Frustração" do jogador esteja alto.</p>
                                            </div>
                                        </div>

                                        <Card>
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((level) => (
                                                    <div key={level} className="border border-slate-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nível de Dica {level}</span>
                                                            <Badge variant={level === 3 ? 'warning' : 'info'}>{level === 3 ? 'Resposta Direta' : 'Sugestão Sutil'}</Badge>
                                                        </div>
                                                        <TextArea
                                                            label=""
                                                            placeholder={`Exemplo de dica nível ${level}...`}
                                                            className="text-sm"
                                                            rows={2}
                                                            value={selectedAgent.config?.hints?.[level] || ''}
                                                            onChange={(e) => handleUpdateHint(level, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* LOGS TAB */}
                                {activeTab === 'logs' && (
                                    <div className="animate-fadeIn">
                                        <Card className="p-0 overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                                    <tr>
                                                        <th className="p-3">Data/Hora</th>
                                                        <th className="p-3">Jogador (Hash)</th>
                                                        <th className="p-3">Input do Usuário</th>
                                                        <th className="p-3">Resposta do Agente</th>
                                                        <th className="p-3">Tokens</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {/* Logs would go here */}
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-slate-400">
                                                            Nenhum registro de interação encontrado.
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </Card>
                                    </div>
                                )}

                                {/* TEST SIMULATOR TAB */}
                                {activeTab === 'test' && (
                                    <div className="h-full flex flex-col animate-fadeIn">
                                        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                                            {/* Chat Window */}
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                                {chatHistory.length === 0 && (
                                                    <div className="text-center text-slate-400 mt-10">
                                                        <Bot size={48} className="mx-auto mb-2 opacity-50" />
                                                        <p>Inicie uma conversa para testar o agente.</p>
                                                    </div>
                                                )}
                                                {chatHistory.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`
                                            max-w-[80%] rounded-2xl px-4 py-3 text-sm
                                            ${msg.role === 'user'
                                                                ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-900/10'
                                                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}
                                        `}>
                                                            {msg.role === 'agent' && (
                                                                <div className="text-xs font-bold text-slate-400 mb-1 mb-1">{selectedAgent.name}</div>
                                                            )}
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Typing Indicator */}
                                                {isSendingMessage && (
                                                    <div className="flex justify-start">
                                                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Area */}
                                            <div className="p-4 bg-white border-t border-slate-200">
                                                <div className="mb-3">
                                                    <input
                                                        type="password"
                                                        placeholder="Chave de API Temporária (Opcional - sobrescreve variável de ambiente)"
                                                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 text-slate-500 focus:outline-none focus:border-brand-400"
                                                        value={tempApiKey}
                                                        onChange={(e) => setTempApiKey(e.target.value)}
                                                    />
                                                </div>
                                                <form onSubmit={handleSendMessage} className="flex space-x-2">
                                                    <input
                                                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                                        placeholder="Digite uma mensagem de teste..."
                                                        value={testMessage}
                                                        onChange={(e) => setTestMessage(e.target.value)}
                                                        disabled={isSendingMessage}
                                                    />
                                                    <Button type="submit" className="!w-auto" disabled={isSendingMessage}>
                                                        {isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : 'Enviar'}
                                                    </Button>
                                                </form>
                                                <div className="text-center mt-2">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Modo de Teste (Conectado ao Gemini)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </section>
                    ) : (
                        <div className="lg:w-2/3 bg-slate-50 flex items-center justify-center p-12 text-slate-400">
                            <div className="text-center">
                                <Search size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-slate-600">Nenhum agente selecionado</h3>
                                <p>Selecione um agente na lista ou crie um novo.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VirtualAgentsScreen;
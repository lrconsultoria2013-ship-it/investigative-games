import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Printer,
    Save,
    GripVertical,
    FileText,
    Map,
    FlaskConical,
    Mail,
    CheckCircle2,
    AlertCircle,
    Eye,
    ChevronDown,
    Plus,
    Trash2,
    Loader2
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LayoutPrintScreenProps {
    onBack: () => void;
}

type ModuleType = 'envelope' | 'document' | 'map' | 'lab';

interface KitModule {
    id: string;
    type: ModuleType;
    title: string;
    description: string;
    content: string;
    status: 'draft' | 'ready' | 'incomplete';
    case_id: string;
}

interface Case {
    id: string;
    title: string;
}

const LayoutPrintScreen: React.FC<LayoutPrintScreenProps> = ({ onBack }) => {

    // State
    const [cases, setCases] = useState<Case[]>([]);
    const [selectedCaseId, setSelectedCaseId] = useState<string>('');
    const [modules, setModules] = useState<KitModule[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newModuleType, setNewModuleType] = useState<ModuleType>('document');

    const printRef = useRef<HTMLDivElement>(null);

    // Fetch Cases
    useEffect(() => {
        const fetchCases = async () => {
            const { data, error } = await supabase.from('cases').select('id, title');
            if (data) {
                setCases(data);
                if (data.length > 0) setSelectedCaseId(data[0].id);
            }
        };
        fetchCases();
    }, []);

    // Fetch Modules when Case Changes
    useEffect(() => {
        if (!selectedCaseId) return;
        const fetchModules = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .eq('case_id', selectedCaseId)
                .order('created_at', { ascending: true }); // Simple ordering by creation for now

            if (data) {
                setModules(data);
                if (data.length > 0) setSelectedModuleId(data[0].id);
                else setSelectedModuleId(null);
            }
            setLoading(false);
        };
        fetchModules();
    }, [selectedCaseId]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return;

        const { data, error } = await supabase
            .from('modules')
            .insert({
                case_id: selectedCaseId,
                title: newModuleTitle,
                type: newModuleType,
                description: 'Novo módulo criado.',
                content: 'Conteúdo inicial...',
                status: 'draft'
            })
            .select()
            .single();

        if (data) {
            setModules([...modules, data]);
            setSelectedModuleId(data.id);
            setShowCreateModal(false);
            setNewModuleTitle('');
            showNotification('Módulo criado com sucesso!', 'success');
        } else {
            showNotification('Erro ao criar módulo.', 'error');
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este módulo?')) return;
        const { error } = await supabase.from('modules').delete().eq('id', id);
        if (!error) {
            setModules(modules.filter(m => m.id !== id));
            if (selectedModuleId === id) setSelectedModuleId(null);
            showNotification('Módulo excluído.', 'success');
        }
    };

    const handleSave = async () => {
        // In a real app we'd save content editing here. 
        // For now we just verify connection.
        showNotification('Layout salvo (Simulação).', 'success');
    };

    const handleExportPDF = async () => {
        if (!selectedModuleId || !printRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            // A4 Size
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`modulo-${selectedModuleId}.pdf`);

            showNotification('PDF gerado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Erro ao gerar PDF.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    // UI Helpers
    const getIcon = (type: ModuleType) => {
        switch (type) {
            case 'envelope': return <Mail size={18} />;
            case 'map': return <Map size={18} />;
            case 'lab': return <FlaskConical size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const selectedModule = modules.find(m => m.id === selectedModuleId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Adicionar Módulo</h3>
                        <input
                            className="w-full border p-2 rounded mb-4"
                            placeholder="Título do Módulo"
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                        />
                        <select
                            className="w-full border p-2 rounded mb-6"
                            value={newModuleType}
                            onChange={e => setNewModuleType(e.target.value as ModuleType)}
                        >
                            <option value="document">Documento A4</option>
                            <option value="envelope">Envelope</option>
                            <option value="map">Mapa</option>
                            <option value="lab">Laudo Laboratorial</option>
                        </select>
                        <div className="flex justify-end space-x-2">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                            <Button onClick={handleCreateModule}>Criar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="group flex items-center text-slate-500 hover:text-brand-700 transition-colors pr-2"
                        title="Voltar para a tela anterior"
                    >
                        <div className="p-2 group-hover:bg-brand-50 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-medium text-sm ml-1 hidden md:block">Voltar</span>
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>

                    {/* Case Selector */}
                    <div className="relative group">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Editando Caso:</label>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-transparent font-bold text-slate-800 text-lg pr-8 focus:outline-none cursor-pointer"
                                    value={selectedCaseId}
                                    onChange={(e) => setSelectedCaseId(e.target.value)}
                                >
                                    {cases.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleExportPDF}
                        isLoading={isExporting}
                        className="!w-auto bg-brand-600 hover:bg-brand-700"
                        disabled={!selectedModule}
                    >
                        <Printer size={18} className="mr-2" />
                        <span className="hidden sm:inline">Gerar PDF</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)]">

                {/* Left Panel: Module Organizer */}
                <section className="lg:col-span-4 flex flex-col h-full overflow-hidden">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700 flex items-center">
                                <GripVertical size={16} className="mr-2 text-slate-400" />
                                Módulos do Kit
                            </h3>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{modules.length} itens</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {loading && <div className="text-center p-4"><Loader2 className="animate-spin mx-auto" /></div>}
                            {!loading && modules.length === 0 && (
                                <div className="text-center p-8 text-slate-400 text-sm">Nenhum módulo encontrado.</div>
                            )}
                            {modules.map((module, index) => (
                                <div
                                    key={module.id}
                                    onClick={() => setSelectedModuleId(module.id)}
                                    className={`
                            group flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200 relative
                            ${selectedModuleId === module.id
                                            ? 'bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                        `}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`flex items-center text-sm font-medium ${selectedModuleId === module.id ? 'text-brand-700' : 'text-slate-700'}`}>
                                                <span className={`mr-2 p-1.5 rounded-md ${selectedModuleId === module.id ? 'bg-brand-100' : 'bg-slate-100'}`}>
                                                    {getIcon(module.type)}
                                                </span>
                                                {module.title}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 ml-9 truncate">{module.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center justify-center w-full"
                            >
                                <Plus size={14} className="mr-1" /> Adicionar Novo Módulo
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right Panel: Interactive Preview */}
                <section className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-200/50 rounded-xl border border-slate-200 flex-1 flex flex-col relative overflow-hidden">

                        {/* Preview Toolbar */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm pointer-events-auto flex items-center space-x-2">
                                <Eye size={16} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Visualização de Impressão
                                </span>
                            </div>
                        </div>

                        {/* Simulated Paper Canvas for PDF Generation */}
                        <div className="flex-1 overflow-auto flex items-center justify-center p-12 bg-slate-300">
                            {selectedModule ? (
                                <div
                                    ref={printRef}
                                    className={`
                                relative shadow-2xl bg-white
                                ${selectedModule.type === 'envelope' ? 'w-[600px] h-[400px] bg-[#dcbfa3]' : 'w-[595px] h-[842px]'} 
                            `} // w-[595px] h-[842px] simulates A4 roughly at 72dpi, good enough for html2canvas
                                >
                                    <div className="w-full h-full p-12 flex flex-col relative">
                                        <div className="absolute inset-0 pointer-events-none opacity-5 border-[1px] border-slate-900"></div>

                                        {/* Dynamic Content based on Type */}
                                        {selectedModule.type === 'document' && (
                                            <div className="font-serif text-slate-900">
                                                <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                                                    <h1 className="text-3xl font-bold">CONFIDENCIAL</h1>
                                                    <span className="font-mono text-sm">REF: {selectedModule.id.substring(0, 6)}</span>
                                                </div>
                                                <h2 className="text-xl font-bold mb-4">{selectedModule.title}</h2>
                                                <p className="text-justify leading-relaxed whitespace-pre-wrap">{selectedModule.content}</p>
                                                <div className="mt-12 pt-8 border-t border-slate-300 text-center text-xs text-slate-500">
                                                    Documento gerado pelo Sistema de Jogos Investigativos
                                                </div>
                                            </div>
                                        )}

                                        {selectedModule.type === 'envelope' && (
                                            <div className="h-full flex flex-col items-center justify-center border-4 border-double border-red-900/20 m-4">
                                                <div className="text-center">
                                                    <h2 className="text-4xl font-serif font-bold text-slate-800 mb-2">{selectedModule.title}</h2>
                                                    <p className="text-red-800 font-bold uppercase tracking-widest border-2 border-red-800 px-4 py-1 inline-block mt-4">Top Secret</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedModule.type === 'map' && (
                                            <div className="h-full bg-slate-100 flex items-center justify-center border-2 border-slate-900">
                                                <span className="text-4xl font-serif font-bold text-slate-400 rotate-[-45deg]">MAPA: {selectedModule.title}</span>
                                            </div>
                                        )}

                                        {selectedModule.type === 'lab' && (
                                            <div className="h-full bg-slate-900 text-green-500 font-mono p-8">
                                                <div className="border border-green-500 p-2 text-center mb-8">ANÁLISE FORENSE</div>
                                                <p>&gt; Amostra: {selectedModule.title}</p>
                                                <p>&gt; Status: {selectedModule.status}</p>
                                                <p className="mt-4">&gt; Resultado: POSITIVO PARA TOXINA.</p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500">Selecione um módulo para visualizar.</div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LayoutPrintScreen;
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
    Loader2,
    Settings
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

    // Module Content State (parsed from JSON)
    const [moduleBody, setModuleBody] = useState('');
    const [moduleHeader, setModuleHeader] = useState('');
    const [moduleFooter, setModuleFooter] = useState('');
    const [moduleStamp, setModuleStamp] = useState<string>('none');
    const [moduleSignature, setModuleSignature] = useState('');

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
                .order('created_at', { ascending: true });

            if (data) {
                setModules(data);
                if (data.length > 0) handleSelectModule(data[0]);
                else {
                    setSelectedModuleId(null);
                    resetEditor();
                }
            }
            setLoading(false);
        };
        fetchModules();
    }, [selectedCaseId]);

    const resetEditor = () => {
        setModuleBody('');
        setModuleHeader('');
        setModuleFooter('');
        setModuleStamp('none');
        setModuleSignature('');
    };

    const handleSelectModule = (module: KitModule) => {
        setSelectedModuleId(module.id);
        try {
            const parsed = JSON.parse(module.content);
            setModuleBody(parsed.body || module.content); // Fallback for legacy text
            setModuleHeader(parsed.header || '');
            setModuleFooter(parsed.footer || '');
            setModuleStamp(parsed.stamp || 'none');
            setModuleSignature(parsed.signature || '');
        } catch (e) {
            // Content is likely plain text
            setModuleBody(module.content);
            setModuleHeader('');
            setModuleFooter('');
            setModuleStamp('none');
            setModuleSignature('');
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return;

        const initialContent = JSON.stringify({
            body: 'Conteúdo inicial...',
            header: '',
            footer: '',
            stamp: 'none',
            signature: ''
        });

        const { data, error } = await supabase
            .from('modules')
            .insert({
                case_id: selectedCaseId,
                title: newModuleTitle,
                type: newModuleType,
                description: 'Novo módulo.',
                content: initialContent,
                status: 'draft'
            })
            .select()
            .single();

        if (data) {
            setModules([...modules, data]);
            handleSelectModule(data);
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
            const newModules = modules.filter(m => m.id !== id);
            setModules(newModules);
            if (selectedModuleId === id) {
                if (newModules.length > 0) handleSelectModule(newModules[0]);
                else {
                    setSelectedModuleId(null);
                    resetEditor();
                }
            }
            showNotification('Módulo excluído.', 'success');
        }
    };

    const handleSave = async () => {
        if (!selectedModuleId) return;
        setIsSaving(true);

        const contentJSON = JSON.stringify({
            body: moduleBody,
            header: moduleHeader,
            footer: moduleFooter,
            stamp: moduleStamp,
            signature: moduleSignature
        });

        const { error } = await supabase
            .from('modules')
            .update({ content: contentJSON })
            .eq('id', selectedModuleId);

        if (!error) {
            // Update local state
            setModules(modules.map(m => m.id === selectedModuleId ? { ...m, content: contentJSON } : m));
            showNotification('Alterações salvas.', 'success');
        } else {
            showNotification('Erro ao salvar.', 'error');
        }
        setIsSaving(false);
    };

    const handleExportPDF = async () => {
        if (!selectedModuleId || !printRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            // A4 Size
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`modulo-${newModuleTitle || 'export'}.pdf`);

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
                        onClick={handleSave}
                        disabled={!selectedModule}
                        isLoading={isSaving}
                        variant="secondary"
                        className="!w-auto"
                    >
                        <Save size={18} className="mr-2" />
                        Salvar
                    </Button>
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

            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)]">

                {/* Left Panel: Module Organizer */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full lg:col-span-3 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                            <GripVertical size={16} className="mr-2 text-slate-400" />
                            Módulos
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{modules.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && <div className="text-center p-4"><Loader2 className="animate-spin mx-auto text-brand-600" /></div>}
                        {!loading && modules.length === 0 && (
                            <div className="text-center p-8 text-slate-400 text-sm">Nenhum módulo encontrado.</div>
                        )}
                        {modules.map((module) => (
                            <div
                                key={module.id}
                                onClick={() => handleSelectModule(module)}
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
                                    <p className="text-xs text-slate-500 ml-9 truncate">{module.type.toUpperCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center justify-center w-full bg-white border border-brand-200 py-2 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                            <Plus size={14} className="mr-1" /> Novo Módulo
                        </button>
                    </div>
                </section>

                {/* Center Panel: Interactive Preview */}
                <section className="lg:col-span-6 flex flex-col h-full overflow-hidden bg-slate-200/50 rounded-xl border border-slate-200 relative">
                    {/* Preview Toolbar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm pointer-events-auto flex items-center space-x-2">
                            <Eye size={16} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Visualização
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-300">
                        {selectedModule ? (
                            <div
                                ref={printRef}
                                className={`include-in-pdf relative shadow-2xl bg-white transition-all duration-300 origin-top`}
                                style={{
                                    width: selectedModule.type === 'envelope' ? '600px' : '595px', // A4 width px at 72dpi
                                    height: selectedModule.type === 'envelope' ? '400px' : '842px', // A4 height px
                                    minWidth: selectedModule.type === 'envelope' ? '600px' : '595px',
                                    minHeight: selectedModule.type === 'envelope' ? '400px' : '842px',
                                }}
                            >
                                <div className="w-full h-full p-12 flex flex-col relative overflow-hidden">
                                    {/* Custom Header */}
                                    {moduleHeader && (
                                        <div className="absolute top-8 left-12 right-12 text-center border-b-2 border-slate-800 pb-2 mb-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">{moduleHeader}</p>
                                        </div>
                                    )}

                                    {/* Stamps Layer */}
                                    {moduleStamp !== 'none' && (
                                        <div className="absolute top-20 right-10 rotate-[-15deg] pointer-events-none opacity-80 z-20">
                                            <div className={`
                                                border-4 px-4 py-2 text-2xl font-black uppercase tracking-widest
                                                ${moduleStamp === 'confidential' ? 'border-red-600 text-red-600' : ''}
                                                ${moduleStamp === 'top_secret' ? 'border-red-800 text-red-800' : ''}
                                                ${moduleStamp === 'evidence' ? 'border-blue-600 text-blue-600' : ''}
                                                ${moduleStamp === 'copy' ? 'border-slate-400 text-slate-400' : ''}
                                            `}>
                                                {moduleStamp.replace('_', ' ')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Body Content */}
                                    <div className="flex-1 mt-8">
                                        {selectedModule.type === 'document' && (
                                            <div className="prose prose-sm max-w-none font-serif text-slate-900">
                                                <h1 className="uppercase text-3xl font-bold mb-6 text-slate-900">{selectedModule.title}</h1>
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {moduleBody}
                                                </div>
                                            </div>
                                        )}
                                        {selectedModule.type === 'envelope' && (
                                            <div className="h-full flex flex-col items-center justify-center border-4 border-double border-red-900/20 bg-[#fdfbf7]">
                                                <h2 className="text-4xl font-serif font-bold text-slate-800 mb-2">{selectedModule.title}</h2>
                                                <div className="w-32 h-1 bg-slate-800 my-4"></div>
                                                <p className="font-mono text-sm text-slate-500">CONFIDENCIAL</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Signatures */}
                                    {moduleSignature && (
                                        <div className="mt-12 flex justify-end">
                                            <div className="text-center w-48">
                                                <div className="font-handwriting text-2xl text-blue-900 mb-1 transform -rotate-2">{moduleSignature}</div>
                                                <div className="border-t border-slate-400 pt-1 text-xs text-slate-500 uppercase">Assinatura Responsável</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom Footer */}
                                    {moduleFooter && (
                                        <div className="absolute bottom-6 left-12 right-12 text-center border-t border-slate-300 pt-2">
                                            <p className="text-[10px] text-slate-400">{moduleFooter}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <p>Selecione um módulo para editar</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Panel: Customization Properties */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full lg:col-span-3 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                            <Settings size={16} className="mr-2 text-slate-400" />
                            Personalização
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {selectedModule ? (
                            <>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Conteúdo Principal</label>
                                    <textarea
                                        className="w-full text-sm border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 min-h-[150px]"
                                        placeholder="Digite o conteúdo do documento..."
                                        value={moduleBody}
                                        onChange={(e) => setModuleBody(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Cabeçalho & Rodapé</label>
                                    <input
                                        className="w-full text-sm border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                        placeholder="Texto do Cabeçalho"
                                        value={moduleHeader}
                                        onChange={(e) => setModuleHeader(e.target.value)}
                                    />
                                    <input
                                        className="w-full text-sm border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                        placeholder="Texto do Rodapé"
                                        value={moduleFooter}
                                        onChange={(e) => setModuleFooter(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Carimbos</label>
                                    <select
                                        className="w-full text-sm border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                        value={moduleStamp}
                                        onChange={(e) => setModuleStamp(e.target.value)}
                                    >
                                        <option value="none">Sem Carimbo</option>
                                        <option value="confidential">CONFIDENCIAL</option>
                                        <option value="top_secret">TOP SECRET</option>
                                        <option value="evidence">EVIDÊNCIA</option>
                                        <option value="copy">CÓPIA</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Assinatura</label>
                                    <input
                                        className="w-full text-sm border-slate-200 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                        placeholder="Nome da Assinatura"
                                        value={moduleSignature}
                                        onChange={(e) => setModuleSignature(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400">A assinatura aparecerá no final do documento.</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400 py-8">
                                Selecione um módulo para ver as opções.
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default LayoutPrintScreen;
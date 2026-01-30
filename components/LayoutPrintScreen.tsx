import React, { useState, useEffect } from 'react';
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
    Download,
    ChevronDown,
    Briefcase
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface LayoutPrintScreenProps {
    onBack: () => void;
}

// Mock Data Types
type ModuleType = 'envelope' | 'document' | 'map' | 'lab';

interface KitModule {
    id: string;
    type: ModuleType;
    title: string;
    status: 'ready' | 'incomplete';
    description: string;
}

interface CaseOption {
    id: string;
    title: string;
    kitId: string;
}

const LayoutPrintScreen: React.FC<LayoutPrintScreenProps> = ({ onBack }) => {

    // Available Cases Mock
    const availableCases: CaseOption[] = [
        { id: 'case-1', title: 'O Enigma do Relógio', kitId: '#204' },
        { id: 'case-2', title: 'Operação Coldbridge', kitId: '#205' },
        { id: 'case-3', title: 'O Último Suspiro', kitId: '#206' },
    ];

    const [selectedCaseId, setSelectedCaseId] = useState<string>(availableCases[0].id);

    // Initial Modules (Default for Case 1)
    const [modules, setModules] = useState<KitModule[]>([]);

    // Effect to switch modules when case changes
    useEffect(() => {
        // Simulate fetching modules for different cases
        let newModules: KitModule[] = [];
        if (selectedCaseId === 'case-1') {
            newModules = [
                { id: '1', type: 'envelope', title: 'Envelope A: Cena do Crime', status: 'ready', description: 'Contém evidências iniciais e relatório policial.' },
                { id: '2', type: 'document', title: 'Relatório Policial #890', status: 'ready', description: 'Documento A4, papel timbrado Scotland Yard.' },
                { id: '3', type: 'document', title: 'Depoimento: A. Pendelton', status: 'incomplete', description: 'Falta revisar ortografia no 2º parágrafo.' },
                { id: '4', type: 'map', title: 'Mapa: Londres Vitoriana', status: 'ready', description: 'Mapa A3 dobrável com marcações em vermelho.' },
                { id: '5', type: 'lab', title: 'Laudo Toxicológico', status: 'ready', description: 'Cartão de análise química com revelação UV.' },
                { id: '6', type: 'envelope', title: 'Envelope B: Solução', status: 'ready', description: 'Envelope lacrado com a resolução do caso.' },
            ];
        } else if (selectedCaseId === 'case-2') {
            newModules = [
                { id: '10', type: 'envelope', title: 'Dossiê Confidencial', status: 'ready', description: 'Pasta parda com carimbo TOP SECRET.' },
                { id: '11', type: 'document', title: 'Interceptação de Rádio', status: 'ready', description: 'Transcrição de código morse.' },
                { id: '12', type: 'map', title: 'Planta Baixa: Embaixada', status: 'incomplete', description: 'Falta rota de fuga.' },
            ];
        } else {
            newModules = [
                { id: '20', type: 'document', title: 'Diário do Capitão', status: 'ready', description: 'Páginas envelhecidas com manchas de água.' },
                { id: '21', type: 'lab', title: 'Amostra de Ectoplasma', status: 'ready', description: 'Frasco simulado em papel vegetal.' },
            ];
        }
        setModules(newModules);
        setSelectedId(newModules[0]?.id || '');
    }, [selectedCaseId]);


    const [selectedId, setSelectedId] = useState<string>('1');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const selectedModule = modules.find(m => m.id === selectedId);
    const currentCase = availableCases.find(c => c.id === selectedCaseId);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showNotification('Layout do kit salvo com sucesso!', 'success');
        }, 1500);
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            showNotification('PDF Final gerado e enviado para download.', 'success');
        }, 2500);
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Move item (Simulated Drag and Drop)
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newModules = [...modules];
        if (direction === 'up' && index > 0) {
            [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];
        } else if (direction === 'down' && index < newModules.length - 1) {
            [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
        }
        setModules(newModules);
    };

    const getIcon = (type: ModuleType) => {
        switch (type) {
            case 'envelope': return <Mail size={18} />;
            case 'map': return <Map size={18} />;
            case 'lab': return <FlaskConical size={18} />;
            default: return <FileText size={18} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

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
                                    {availableCases.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-mono">
                                Kit {currentCase?.kitId}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="!w-auto"
                    >
                        <Save size={18} className="mr-2" />
                        <span className="hidden sm:inline">Salvar Layout</span>
                        <span className="sm:hidden">Salvar</span>
                    </Button>
                    <Button
                        onClick={handleExport}
                        isLoading={isExporting}
                        className="!w-auto bg-brand-600 hover:bg-brand-700"
                    >
                        <Printer size={18} className="mr-2" />
                        <span className="hidden sm:inline">Gerar PDF Final</span>
                        <span className="sm:hidden">PDF</span>
                    </Button>
                </div>
            </header>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

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
                            {modules.map((module, index) => (
                                <div
                                    key={module.id}
                                    onClick={() => setSelectedId(module.id)}
                                    className={`
                            group flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200 relative
                            ${selectedId === module.id
                                            ? 'bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                        `}
                                >
                                    {/* Drag Handle (Visual) */}
                                    <div className="flex flex-col items-center justify-center mr-3 mt-1 text-slate-300 group-hover:text-slate-400">
                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }} className="hover:text-slate-600 p-0.5"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current"></div></button>
                                        <GripVertical size={14} className="my-0.5" />
                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }} className="hover:text-slate-600 p-0.5"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-current"></div></button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`flex items-center text-sm font-medium ${selectedId === module.id ? 'text-brand-700' : 'text-slate-700'}`}>
                                                <span className={`mr-2 p-1.5 rounded-md ${selectedId === module.id ? 'bg-brand-100' : 'bg-slate-100'}`}>
                                                    {getIcon(module.type)}
                                                </span>
                                                {module.title}
                                            </span>
                                            {module.status === 'ready' ? (
                                                <div className="text-emerald-500"><CheckCircle2 size={16} /></div>
                                            ) : (
                                                <div className="text-amber-500"><AlertCircle size={16} /></div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 ml-9 truncate">{module.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <button className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center justify-center w-full">
                                + Adicionar Novo Módulo
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
                            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm pointer-events-auto">
                                <span className="text-xs text-slate-500">Formato: </span>
                                <span className="text-xs font-mono font-medium text-slate-800">
                                    {selectedModule?.type === 'envelope' ? 'C5 (162x229mm)' : 'A4 (210x297mm)'}
                                </span>
                            </div>
                        </div>

                        {/* Simulated Paper Canvas */}
                        <div className="flex-1 overflow-auto flex items-center justify-center p-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                            {selectedModule ? (
                                <div
                                    className={`
                                relative shadow-2xl transition-all duration-500 transform
                                ${selectedModule.type === 'envelope' ? 'w-[600px] h-[400px] bg-[#dcbfa3]' : 'w-[500px] h-[700px] bg-white'}
                            `}
                                >
                                    {/* Content Simulation */}
                                    <div className="w-full h-full p-12 flex flex-col relative">

                                        {/* Texture Overlay */}
                                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

                                        {selectedModule.type === 'envelope' && (
                                            <>
                                                <div className="absolute top-8 right-8 w-24 h-28 border-2 border-dashed border-red-800/30 flex items-center justify-center rotate-3">
                                                    <span className="text-red-900/40 text-xs font-bold uppercase text-center">Local<br />Selo</span>
                                                </div>
                                                <div className="absolute bottom-12 left-12">
                                                    <div className="text-red-800 font-serif text-2xl font-bold uppercase tracking-widest border-4 border-red-800 p-2 rotate-[-5deg] inline-block opacity-80">
                                                        Confidencial
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="text-center font-serif text-slate-800">
                                                        <p className="text-lg italic mb-2">Para o detetive responsável</p>
                                                        <h2 className="text-3xl font-bold uppercase tracking-widest">{selectedModule.title}</h2>
                                                        <p className="text-sm mt-4 text-slate-600">Londres, 1890</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedModule.type === 'document' && (
                                            <>
                                                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-8">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-8 w-8 bg-slate-900 rounded-full"></div>
                                                        <span className="font-bold text-lg font-serif">Scotland Yard</span>
                                                    </div>
                                                    <span className="font-mono text-sm">REF: #890-B</span>
                                                </div>
                                                <div className="font-serif text-slate-800 space-y-4 leading-relaxed text-justify text-sm">
                                                    <p><strong>Data:</strong> 22 de Outubro de 1890</p>
                                                    <p><strong>Assunto:</strong> {selectedModule.title}</p>
                                                    <div className="h-px bg-slate-300 w-1/2 my-4"></div>
                                                    <p>
                                                        O oficial chegou ao local às 03:00 da manhã. A neblina estava densa.
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    </p>
                                                    <p>
                                                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                                    </p>
                                                    {selectedModule.status === 'incomplete' && (
                                                        <div className="bg-amber-100 border border-amber-300 p-2 text-amber-800 text-xs mt-4 text-center">
                                                            [ Conteúdo ainda em revisão ]
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {selectedModule.type === 'map' && (
                                            <div className="w-full h-full border-4 border-slate-800 p-2">
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center border border-slate-300 relative overflow-hidden">
                                                    {/* Abstract Map Grid */}
                                                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                                                        {[...Array(36)].map((_, i) => (
                                                            <div key={i} className="border border-slate-200/50"></div>
                                                        ))}
                                                    </div>
                                                    <span className="font-serif text-4xl text-slate-300 font-bold rotate-[-15deg] z-10">MAPA DA CIDADE</span>
                                                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md z-20"></div>
                                                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-slate-800 rounded-full z-20"></div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedModule.type === 'lab' && (
                                            <div className="w-full h-full bg-slate-900 text-green-400 font-mono p-4 flex flex-col">
                                                <div className="border border-green-500/30 p-2 mb-4 text-center text-xs uppercase tracking-widest">
                                                    Análise Forense
                                                </div>
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between"><span>Amostra:</span> <span>X-99</span></div>
                                                    <div className="flex justify-between"><span>Toxina:</span> <span>Detectada</span></div>
                                                    <div className="h-px bg-green-500/30 my-2"></div>
                                                    <p className="opacity-70">&gt; Iniciando sequência de análise...</p>
                                                    <p className="opacity-70">&gt; Composto Arsênico encontrado.</p>
                                                </div>
                                                <div className="mt-auto text-center border-t border-green-500/30 pt-2">
                                                    <FlaskConical className="mx-auto mb-1 opacity-50" size={24} />
                                                    <span className="text-[10px] uppercase">Confidencial</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <Printer size={48} className="mb-4 opacity-50" />
                                    <p>Selecione um módulo para visualizar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Validation Footer for Document */}
                    {selectedModule?.status === 'incomplete' && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
                            <AlertCircle className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" size={18} />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-800">Atenção Necessária</h4>
                                <p className="text-xs text-amber-700 mt-0.5">Este documento contém campos não preenchidos ou marcados para revisão. A exportação final pode conter placeholders.</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default LayoutPrintScreen;
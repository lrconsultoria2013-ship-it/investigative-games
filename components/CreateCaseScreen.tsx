import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Sparkles,
    Save,
    FileDown,
    BookOpen,
    Users,
    Search,
    CheckCircle2,
    AlertTriangle,
    PenTool,
    Keyboard,
    UploadCloud,
    Plus,
    Trash2,
    FileText,
    GripVertical,
    MoreVertical,
    File,
    X,
    ChevronUp,
    ChevronDown,
    AlertCircle,
    Loader2
} from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { supabase } from '../lib/supabase';
import StorageSetup from './StorageSetup';

interface CreateCaseScreenProps {
    onBack: () => void;
    onNavigateToLayout?: () => void;
    caseId?: string | null;
}

type CreationMode = 'ai' | 'manual';
type DocType = 'text' | 'file';

interface CaseDocument {
    id: string;
    title: string;
    summary: string;
    type: DocType;
    content: string; // Text content or File name or URL
    category: 'narrative' | 'evidence' | 'profile';
    ageRating: string;
    fileObj?: File; // Temporary file object for uploads
}

const CreateCaseScreen: React.FC<CreateCaseScreenProps> = ({ onBack, onNavigateToLayout, caseId }) => {
    // Mode State
    const [creationMode, setCreationMode] = useState<CreationMode>('manual');
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [loadingCase, setLoadingCase] = useState(false);

    // Case Metadata
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('mystery');
    const [age, setAge] = useState('14');
    const [complexity, setComplexity] = useState('medium');
    const [aiPrompt, setAiPrompt] = useState('');

    // Documents State
    const [documents, setDocuments] = useState<CaseDocument[]>([
        {
            id: 'doc-1',
            title: 'Introdução do Caso',
            summary: 'Carta inicial para o detetive.',
            type: 'text',
            content: '',
            category: 'narrative',
            ageRating: '14'
        }
    ]);
    const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showStorageSetup, setShowStorageSetup] = useState(false);

    // Load Case Data if Editing
    useEffect(() => {
        if (!caseId) return;

        const loadCase = async () => {
            setLoadingCase(true);
            try {
                // 1. Fetch Case Details
                const { data: caseData, error: caseError } = await supabase
                    .from('cases')
                    .select('*')
                    .eq('id', caseId)
                    .single();

                if (caseError) throw caseError;

                if (caseData) {
                    setTitle(caseData.title);
                    setTheme(caseData.theme);
                    setAge(caseData.age_rating || '14');
                    setComplexity(caseData.complexity || 'medium');
                    setAiPrompt(caseData.summary || ''); // Assuming summary can be aiPrompt
                }

                // 2. Fetch Modules (Documents)
                const { data: modulesData, error: modulesError } = await supabase
                    .from('modules')
                    .select('*')
                    .eq('case_id', caseId)
                    .order('created_at', { ascending: true });

                if (modulesError) throw modulesError;

                if (modulesData && modulesData.length > 0) {
                    const mappedDocs: CaseDocument[] = modulesData.map((m: any) => {
                        let content = m.content;
                        try {
                            const parsed = JSON.parse(m.content);
                            content = parsed.body || m.content;
                        } catch (e) {
                            // Content is plain text
                        }

                        // Determine type based on content URL (basic check)
                        const isFile = (m.type === 'evidence' && (content.startsWith('http') || content.includes('[Arquivo:')));

                        return {
                            id: m.id,
                            title: m.title,
                            summary: m.description || '',
                            type: isFile ? 'file' : 'text',
                            content: content,
                            category: m.type === 'evidence' ? 'evidence' : 'narrative',
                            ageRating: '14'
                        };
                    });
                    setDocuments(mappedDocs);
                    setSelectedDocId(mappedDocs[0].id);
                }

            } catch (err) {
                console.error('Error loading case:', err);
                showNotification('Erro ao carregar dados do caso.', 'error');
            } finally {
                setLoadingCase(false);
            }
        };

        loadCase();
    }, [caseId]);

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // --- Actions ---

    const handleAddDocument = () => {
        const newId = `doc-${Date.now()}`;
        const newDoc: CaseDocument = {
            id: newId,
            title: 'Novo Documento',
            summary: '',
            type: 'text',
            content: '',
            category: 'evidence',
            ageRating: age
        };
        setDocuments([...documents, newDoc]);
        setSelectedDocId(newId);
    };

    const handleRemoveDocument = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (documents.length <= 1) {
            showNotification('O caso precisa de pelo menos um documento.', 'error');
            return;
        }

        const newDocs = documents.filter(d => d.id !== id);
        setDocuments(newDocs);
        if (selectedDocId === id) {
            setSelectedDocId(newDocs[0].id);
        }
    };

    const handleUpdateDocument = (id: string, field: keyof CaseDocument, value: any) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === id ? { ...doc, [field]: value } : doc
        ));
    };

    const handleMoveDocument = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newDocs = [...documents];
        if (direction === 'up' && index > 0) {
            [newDocs[index], newDocs[index - 1]] = [newDocs[index - 1], newDocs[index]];
        } else if (direction === 'down' && index < newDocs.length - 1) {
            [newDocs[index], newDocs[index + 1]] = [newDocs[index + 1], newDocs[index]];
        }
        setDocuments(newDocs);
    };

    const handleGenerateAI = () => {
        if (!title) {
            showNotification("Defina um título para o caso antes de gerar.", 'error');
            return;
        }

        setIsGenerating(true);

        // Simulate AI Generation creating multiple documents
        setTimeout(() => {
            const aiDocs: CaseDocument[] = [
                {
                    id: 'ai-1',
                    title: 'Resumo do Enredo',
                    summary: 'Visão geral da narrativa gerada.',
                    type: 'text',
                    category: 'narrative',
                    content: `**Resumo do Caso:**\n\nNas ruas nevoentas da Londres de 1890, um renomado relojoeiro desaparece deixando apenas um relógio que anda para trás.`,
                    ageRating: age
                },
                {
                    id: 'ai-2',
                    title: 'Perfil: Arthur Pendelton',
                    summary: 'Ficha do relojoeiro desaparecido.',
                    type: 'text',
                    category: 'profile',
                    content: `Nome: Arthur Pendelton\nIdade: 54\nOcupação: Mestre Relojoeiro\n\nCaracterísticas: Paranoico, detalhista, tem dívidas de jogo.`,
                    ageRating: age
                },
                {
                    id: 'ai-3',
                    title: 'Pista: Bilhete Criptografado',
                    summary: 'Encontrado na gaveta secreta.',
                    type: 'text',
                    category: 'evidence',
                    content: `O bilhete diz: "Meia-noite nas docas. Traga o mecanismo ou o relógio para."`,
                    ageRating: age
                }
            ];

            setDocuments(aiDocs);
            setSelectedDocId(aiDocs[0].id);
            setIsGenerating(false);
            showNotification('História gerada e dividida em documentos!', 'success');
        }, 2500);
    };

    const uploadFile = async (file: File, path: string): Promise<string | null> => {
        try {
            console.log('Starting file upload:', { fileName: file.name, size: file.size, path });

            const { data, error } = await supabase.storage
                .from('case-files')
                .upload(path, file, { upsert: true });

            if (error) {
                console.error('Supabase storage upload error:', error);

                // Check for common errors
                if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
                    showNotification('❌ Bucket de storage não configurado. Veja o guia de configuração.', 'error');
                    console.error('STORAGE NOT CONFIGURED: Please create the "case-files" bucket in Supabase Dashboard');
                } else {
                    showNotification(`Erro no upload: ${error.message}`, 'error');
                }
                throw error;
            }

            console.log('File uploaded successfully:', data);

            const { data: { publicUrl } } = supabase.storage
                .from('case-files')
                .getPublicUrl(path);

            console.log('Public URL generated:', publicUrl);
            return publicUrl;
        } catch (error: any) {
            console.error('Upload file exception:', error);
            if (!error.message?.includes('Bucket')) {
                showNotification(`Falha no upload do arquivo: ${error.message || 'Erro desconhecido'}`, 'error');
            }
            return null;
        }
    };


    const handleSaveCase = async () => {
        // Validate
        if (!title) {
            showNotification('O título do caso é obrigatório.', 'error');
            return;
        }

        setIsSaving(true);
        let currentCaseId = caseId;

        try {
            let error;

            // 1. Save or Update Case
            const casePayload = {
                title,
                theme,
                status: 'editing', // Default status
                age_rating: age,
                complexity,
                summary: documents[0]?.summary || '',
                copies_sold: 0 // New cases start with 0
            };

            console.log('Saving case with payload:', casePayload);

            if (currentCaseId) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('cases')
                    .update(casePayload)
                    .eq('id', currentCaseId);
                error = updateError;
            } else {
                // INSERT
                const { data: newCase, error: insertError } = await supabase
                    .from('cases')
                    .insert(casePayload)
                    .select()
                    .single();

                if (newCase) {
                    currentCaseId = newCase.id;
                    console.log('New case created with ID:', currentCaseId);
                }
                error = insertError;
            }

            if (error) throw error;
            if (!currentCaseId) throw new Error('Falha ao obter ID do caso.');

            // 2. Save Modules (Documents)
            console.log('Processing documents:', documents.length);

            for (const doc of documents) {
                let contentUrl = doc.content;

                console.log('Processing document:', {
                    id: doc.id,
                    title: doc.title,
                    type: doc.type,
                    hasFileObj: !!doc.fileObj,
                    contentPreview: doc.content.substring(0, 50)
                });

                // Upload File if it's a new file (fileObj exists)
                if (doc.type === 'file' && doc.fileObj) {
                    console.log('Uploading file for document:', doc.title);
                    // Upload to a folder named after the case ID
                    const fileName = `${currentCaseId}/${Date.now()}_${doc.fileObj.name}`;
                    const publicUrl = await uploadFile(doc.fileObj, fileName);

                    if (publicUrl) {
                        contentUrl = publicUrl;
                        console.log('File uploaded successfully, URL:', publicUrl);
                    } else {
                        console.error('Upload failed for document:', doc.title);
                        showNotification(`Falha ao fazer upload do arquivo: ${doc.title}`, 'error');
                        // Continue with other documents even if one fails
                        continue;
                    }
                }

                // Prepare content as JSON for LayoutPrintScreen compatibility
                const contentJSON = JSON.stringify({
                    body: contentUrl,
                    header: '',
                    footer: '',
                    stamp: 'none',
                    signature: ''
                });

                const modulePayload = {
                    case_id: currentCaseId,
                    title: doc.title,
                    description: doc.summary,
                    type: 'document', // Use 'document' type for all modules
                    content: contentJSON, // Save as JSON
                    status: 'draft',
                };

                console.log('Saving module with payload:', modulePayload);

                // Upsert logic
                // If ID is clean UUID, update. If temp ID, insert.
                const isTempId = doc.id.startsWith('doc-') || doc.id.startsWith('ai-');

                if (isTempId) {
                    const { error: insertError } = await supabase.from('modules').insert(modulePayload);
                    if (insertError) {
                        console.error('Error inserting module:', insertError);
                        throw insertError;
                    }
                } else {
                    const { error: updateError } = await supabase.from('modules').update(modulePayload).eq('id', doc.id);
                    if (updateError) {
                        console.error('Error updating module:', updateError);
                        throw updateError;
                    }
                }
            }

            console.log('All documents saved successfully');
            showNotification('Caso salvo com sucesso!', 'success');
            // Optional: Navigate to detail or list view
            setTimeout(() => onBack(), 1500);

        } catch (error: any) {
            console.error('Error saving case:', error);
            showNotification(`Erro ao salvar o caso: ${error.message || 'Erro desconhecido'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (onNavigateToLayout) onNavigateToLayout();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="group flex items-center text-slate-500 hover:text-brand-700 transition-colors pr-2"
                    >
                        <div className="p-2 group-hover:bg-brand-50 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Novo Caso Investigativo</h1>
                        <p className="text-xs text-slate-400 font-mono">ID: NEW-SESSION-{new Date().getFullYear()}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="secondary"
                        className="!w-auto text-slate-600"
                        onClick={() => onBack()}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveCase}
                        className="!w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                        isLoading={isSaving}
                        disabled={isSaving}
                    >
                        <Save size={18} className="mr-2" />
                        Salvar Caso
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)]">

                {/* Left Panel: Configuration & Document List */}
                <section className="lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">

                    {/* Case Parameters Card */}
                    <Card className="flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700">Parâmetros do Caso</h3>
                            <div className="flex bg-slate-100 rounded p-0.5">
                                <button
                                    onClick={() => setCreationMode('manual')}
                                    className={`p-1.5 rounded transition-colors ${creationMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Entrada Manual"
                                >
                                    <Keyboard size={16} />
                                </button>
                                <button
                                    onClick={() => setCreationMode('ai')}
                                    className={`p-1.5 rounded transition-colors ${creationMode === 'ai' ? 'bg-white shadow text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Gerar com IA"
                                >
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Input
                                label="Título"
                                placeholder="Ex: O Caso do Relógio"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    label="Faixa Etária"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    options={[{ value: '10', label: '10+' }, { value: '14', label: '14+' }, { value: '18', label: '18+' }]}
                                />
                                <Select
                                    label="Tema"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    options={[{ value: 'mystery', label: 'Mistério' }, { value: 'horror', label: 'Terror' }, { value: 'scifi', label: 'Sci-Fi' }]}
                                />
                            </div>

                            {creationMode === 'ai' && (
                                <div className="bg-brand-50 rounded-lg p-3 border border-brand-100 mt-2">
                                    <TextArea
                                        label="Contexto para IA"
                                        placeholder="Descreva o crime..."
                                        rows={2}
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="bg-white text-xs"
                                    />
                                    <Button onClick={handleGenerateAI} isLoading={isGenerating} className="mt-2 text-xs py-1.5">
                                        <Sparkles size={14} className="mr-2" /> Gerar Documentos
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Documents List (Modular) */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documentos do Caso</span>
                            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{documents.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {documents.map((doc, index) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDocId(doc.id)}
                                    className={`
                                group relative p-3 rounded-lg border transition-all cursor-pointer flex items-start
                                ${selectedDocId === doc.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                            : 'bg-white border-slate-100 hover:border-slate-300'}
                            `}
                                >
                                    {/* Reorder Controls */}
                                    <div className="flex flex-col items-center justify-center mr-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleMoveDocument(index, 'up', e)} className="hover:text-slate-600"><ChevronUp size={14} /></button>
                                        <GripVertical size={14} />
                                        <button onClick={(e) => handleMoveDocument(index, 'down', e)} className="hover:text-slate-600"><ChevronDown size={14} /></button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center">
                                                {doc.category === 'evidence' && <Search size={14} className="text-amber-500 mr-2" />}
                                                {doc.category === 'narrative' && <BookOpen size={14} className="text-blue-500 mr-2" />}
                                                {doc.category === 'profile' && <Users size={14} className="text-emerald-500 mr-2" />}
                                                <span className={`text-sm font-medium truncate ${selectedDocId === doc.id ? 'text-blue-800' : 'text-slate-700'}`}>
                                                    {doc.title || 'Sem título'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {doc.type === 'file' && <File size={12} className="text-slate-400" />}
                                                {doc.type === 'text' && <FileText size={12} className="text-slate-400" />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate pl-6">
                                            {doc.summary || 'Sem resumo...'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleRemoveDocument(e, doc.id)}
                                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remover documento"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={handleAddDocument}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-500 hover:text-brand-600 hover:bg-white transition-all text-sm font-medium flex items-center justify-center"
                            >
                                <Plus size={16} className="mr-2" /> Adicionar Documento
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right Panel: Editor & Preview */}
                <section className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                    {selectedDoc ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full animate-fadeIn">

                            {/* Editor Toolbar */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-xl">
                                <div className="flex items-center space-x-2 text-sm text-slate-500">
                                    <span className="font-semibold text-slate-800">Editando:</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{selectedDoc.id}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateDocument(selectedDoc.id, 'type', 'text')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center ${selectedDoc.type === 'text' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <PenTool size={12} className="mr-2" /> Editor de Texto
                                    </button>
                                    <button
                                        onClick={() => handleUpdateDocument(selectedDoc.id, 'type', 'file')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center ${selectedDoc.type === 'file' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <UploadCloud size={12} className="mr-2" /> Upload de Arquivo
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col overflow-y-auto">
                                {/* Metadata Inputs */}
                                <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-12 gap-4">
                                    <div className="col-span-8">
                                        <Input
                                            label="Título do Documento"
                                            value={selectedDoc.title}
                                            onChange={(e) => handleUpdateDocument(selectedDoc.id, 'title', e.target.value)}
                                            placeholder="Ex: Carta da Vítima"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Select
                                            label="Categoria"
                                            value={selectedDoc.category}
                                            onChange={(e) => handleUpdateDocument(selectedDoc.id, 'category', e.target.value as any)}
                                            options={[
                                                { value: 'narrative', label: 'Narrativa/História' },
                                                { value: 'evidence', label: 'Evidência/Pista' },
                                                { value: 'profile', label: 'Perfil/Personagem' },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-12">
                                        <Input
                                            label="Resumo Curto (para o Agente Virtual)"
                                            value={selectedDoc.summary}
                                            onChange={(e) => handleUpdateDocument(selectedDoc.id, 'summary', e.target.value)}
                                            placeholder="Descreva brevemente o conteúdo para a IA entender..."
                                        />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-6">
                                    {selectedDoc.type === 'text' ? (
                                        <div className="h-full flex flex-col">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Conteúdo do Documento</label>
                                            <textarea
                                                className="flex-1 w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none font-serif text-lg leading-relaxed text-slate-800"
                                                placeholder="Digite ou cole o texto da história aqui..."
                                                value={selectedDoc.content}
                                                onChange={(e) => handleUpdateDocument(selectedDoc.id, 'content', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Arquivo Anexo</label>
                                            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer relative group">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            console.log("File selected:", file.name); // Debug
                                                            handleUpdateDocument(selectedDoc.id, 'content', `[Arquivo: ${file.name}]`);
                                                            handleUpdateDocument(selectedDoc.id, 'fileObj', file);
                                                        }
                                                    }}
                                                />
                                                {selectedDoc.fileObj ? (
                                                    <div className="text-center z-10 pointer-events-none">
                                                        <FileText size={48} className="mx-auto text-brand-600 mb-4" />
                                                        <p className="font-medium text-slate-800">{selectedDoc.fileObj.name}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{(selectedDoc.fileObj.size / 1024).toFixed(1)} KB</p>
                                                        <p className="text-xs text-emerald-600 mt-2 font-semibold">Pronto para upload</p>
                                                        <div className="mt-4 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs inline-flex items-center shadow-sm">
                                                            Trocar arquivo
                                                        </div>
                                                    </div>
                                                ) : (selectedDoc.content && (selectedDoc.content.startsWith('[Arquivo:') || selectedDoc.content.startsWith('http')) ? (
                                                    <div className="text-center z-10 w-full px-4">
                                                        {selectedDoc.content.startsWith('http') && selectedDoc.content.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                            <div className="mb-4 relative inline-block">
                                                                <img
                                                                    src={selectedDoc.content}
                                                                    alt="Preview"
                                                                    className="h-40 w-auto object-contain rounded shadow-sm bg-white"
                                                                />
                                                                {/* Make sure the image doesn't block clicks from bubbling to input if needed, but input is absolute on top */}
                                                            </div>
                                                        ) : (
                                                            <FileText size={48} className="mx-auto text-brand-600 mb-4" />
                                                        )}
                                                        <p className="font-medium text-slate-800 max-w-full truncate px-4 block">
                                                            {selectedDoc.content.startsWith('http') ? 'Arquivo salvo na nuvem' : selectedDoc.content}
                                                        </p>
                                                        {selectedDoc.content.startsWith('http') && (
                                                            <a
                                                                href={selectedDoc.content}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs text-brand-600 hover:underline mt-1 block relative z-30 pointer-events-auto"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Ver arquivo original
                                                            </a>
                                                        )}
                                                        <p className="text-xs text-emerald-600 mt-2 font-semibold">Arquivo selecionado</p>

                                                        {/* Button style for "Replace" */}
                                                        <div className="mt-4 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center shadow-sm group-hover:bg-slate-50 transition-colors">
                                                            <Search size={16} className="mr-2" />
                                                            Escolher outro arquivo
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-8 z-10 pointer-events-none">
                                                        <UploadCloud size={64} className="mx-auto text-slate-300 mb-6 group-hover:text-brand-400 transition-colors" />
                                                        <p className="font-medium text-lg text-slate-700 mb-2">Upload de Arquivo</p>
                                                        <p className="text-sm text-slate-500 mb-6">Arraste PDF, Imagens ou Texto aqui</p>

                                                        {/* The requested button */}
                                                        <div className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm inline-flex items-center shadow-md group-hover:bg-brand-700 transition-transform transform group-hover:scale-105 active:scale-95">
                                                            <Search size={18} className="mr-2" />
                                                            Selecionar Arquivo
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-between items-center">
                                <div className="text-xs text-slate-400 flex items-center">
                                    {selectedDoc.content ? <CheckCircle2 size={14} className="text-emerald-500 mr-1" /> : <AlertTriangle size={14} className="text-amber-500 mr-1" />}
                                    {selectedDoc.content ? 'Conteúdo preenchido' : 'Conteúdo pendente'}
                                </div>
                                <Button
                                    variant="secondary"
                                    className="!w-auto"
                                    onClick={handleExport}
                                >
                                    <FileDown size={16} className="mr-2" /> Exportar PDF Modular
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-600">Nenhum documento selecionado</h3>
                            <p className="max-w-xs mt-2">Selecione um documento à esquerda ou adicione um novo para começar a editar.</p>
                            <Button onClick={handleAddDocument} className="mt-6 !w-auto">
                                <Plus size={16} className="mr-2" /> Criar Documento
                            </Button>
                        </div>
                    )}
                </section>
            </main>

            {/* Storage Setup Modal */}
            {showStorageSetup && (
                <StorageSetup onClose={() => setShowStorageSetup(false)} />
            )}
        </div>
    );
};

export default CreateCaseScreen;
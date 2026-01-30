import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface CreateCaseScreenProps {
  onBack: () => void;
  onNavigateToLayout?: () => void;
}

type CreationMode = 'ai' | 'manual';
type DocType = 'text' | 'file';

interface CaseDocument {
  id: string;
  title: string;
  summary: string;
  type: DocType;
  content: string; // Text content or File name
  category: 'narrative' | 'evidence' | 'profile';
  ageRating: string;
}

const CreateCaseScreen: React.FC<CreateCaseScreenProps> = ({ onBack, onNavigateToLayout }) => {
  // Mode State
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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
    
    // Rota simulada: /cases/document/add
    console.log(`[Route] Navigating to /cases/document/add -> Created ${newId}`);
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

    // Rota simulada: /cases/document/delete/{doc_id}
    console.log(`[Route] DELETE /cases/document/delete/${id}`);
  };

  const handleUpdateDocument = (id: string, field: keyof CaseDocument, value: string) => {
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

  const handleSaveCase = () => {
      // Validate
      if (!title) {
          showNotification('O título do caso é obrigatório.', 'error');
          return;
      }
      // Rota simulada: /cases/save
      console.log('[Route] POST /cases/save', { title, documents });
      showNotification('Caso salvo com sucesso!', 'success');
  };

  const handleExport = () => {
      // Rota simulada: /cases/export-pdf
      console.log('[Route] POST /cases/export-pdf');
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
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
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
                onClick={() => onBack()} // Rota simulada /dashboard
            >
                Cancelar
            </Button>
            <Button 
                onClick={handleSaveCase}
                className="!w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
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
                            options={[ {value:'10',label:'10+'}, {value:'14',label:'14+'}, {value:'18',label:'18+'} ]}
                         />
                         <Select 
                            label="Tema"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            options={[ {value:'mystery',label:'Mistério'}, {value:'horror',label:'Terror'}, {value:'scifi',label:'Sci-Fi'} ]}
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
                                    <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUpdateDocument(selectedDoc.id, 'content', `[Arquivo: ${file.name}]`);
                                            }}
                                        />
                                        {selectedDoc.content && selectedDoc.content.startsWith('[Arquivo:') ? (
                                            <div className="text-center">
                                                <FileText size={48} className="mx-auto text-brand-600 mb-4" />
                                                <p className="font-medium text-slate-800">{selectedDoc.content}</p>
                                                <p className="text-xs text-emerald-600 mt-2">Arquivo pronto para upload</p>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8">
                                                <UploadCloud size={48} className="mx-auto text-slate-300 mb-4" />
                                                <p className="font-medium">Arraste um arquivo PDF, DOCX ou TXT</p>
                                                <p className="text-xs mt-2">ou clique para selecionar</p>
                                            </div>
                                        )}
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
    </div>
  );
};

export default CreateCaseScreen;
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Database, Copy, ExternalLink } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { initializeStorage } from '../lib/initStorage';

/**
 * Storage Setup Component
 * Helps users configure the Supabase storage bucket
 */
const StorageSetup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [showSQL, setShowSQL] = useState(false);

    const sqlScript = `-- Storage RLS Policies for case-files bucket

-- 1. Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

-- 2. Allow public downloads
CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-files');

-- 3. Allow authenticated users to update files
CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'case-files');

-- 4. Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'case-files');`;

    const handleCreateBucket = async () => {
        setStatus('creating');
        setMessage('Criando bucket de storage...');

        const result = await initializeStorage();

        if (result.success) {
            setStatus('success');
            setMessage('Bucket criado com sucesso! Agora configure as políticas RLS.');
            setShowSQL(true);
        } else {
            setStatus('error');
            setMessage(`Erro: ${result.error}`);
        }
    };

    const handleCopySQL = () => {
        navigator.clipboard.writeText(sqlScript);
        alert('SQL copiado para a área de transferência!');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Database className="text-brand-600" size={32} />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Configurar Storage</h2>
                                <p className="text-sm text-slate-500">Necessário para upload de arquivos</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${status === 'success' ? 'bg-emerald-50 text-emerald-800' :
                                status === 'error' ? 'bg-red-50 text-red-800' :
                                    'bg-blue-50 text-blue-800'
                            }`}>
                            {status === 'success' ? <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" /> :
                                status === 'error' ? <AlertCircle size={20} className="mt-0.5 flex-shrink-0" /> :
                                    <Database size={20} className="mt-0.5 flex-shrink-0 animate-pulse" />}
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    {/* Step 1: Create Bucket */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-3 flex items-center">
                            <span className="bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                            Criar Bucket de Storage
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Clique no botão abaixo para criar automaticamente o bucket "case-files" no Supabase.
                        </p>
                        <Button
                            onClick={handleCreateBucket}
                            disabled={status === 'creating' || status === 'success'}
                            isLoading={status === 'creating'}
                            className="w-full"
                        >
                            {status === 'success' ? '✅ Bucket Criado' : 'Criar Bucket Automaticamente'}
                        </Button>
                    </div>

                    {/* Step 2: Configure Policies */}
                    {showSQL && (
                        <div className="mb-6">
                            <h3 className="font-bold text-lg mb-3 flex items-center">
                                <span className="bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                                Configurar Políticas RLS
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Copie o SQL abaixo e execute no Supabase Dashboard para configurar as permissões de acesso.
                            </p>

                            {/* SQL Script */}
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 relative">
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                    {sqlScript}
                                </pre>
                                <button
                                    onClick={handleCopySQL}
                                    className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                                >
                                    <Copy size={14} />
                                    <span>Copiar</span>
                                </button>
                            </div>

                            {/* Link to SQL Editor */}
                            <a
                                href="https://supabase.com/dashboard/project/wbvkjqfxdpbhpkjzqfqr/sql/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                            >
                                <ExternalLink size={16} />
                                <span>Abrir SQL Editor no Supabase</span>
                            </a>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-sm mb-2">📝 Instruções:</h4>
                        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Clique em "Criar Bucket Automaticamente"</li>
                            <li>Copie o script SQL que aparecerá</li>
                            <li>Abra o SQL Editor no Supabase (link acima)</li>
                            <li>Cole e execute o script SQL</li>
                            <li>Pronto! O upload de arquivos estará funcionando</li>
                        </ol>
                    </div>

                    {/* Close Button */}
                    <div className="mt-6 flex justify-end">
                        <Button variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StorageSetup;

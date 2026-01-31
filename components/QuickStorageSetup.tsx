import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { supabase } from '../lib/supabase';

/**
 * Quick Storage Setup Component
 * One-click solution to create storage bucket
 */
const QuickStorageSetup: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [showSQL, setShowSQL] = useState(false);

    const sqlScript = `-- Políticas de Storage para case-files

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'case-files');

CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'case-files');`;

    const handleSetup = async () => {
        setStatus('creating');
        setMessage('Criando bucket de storage...');

        try {
            // Check if bucket exists
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();

            if (listError) {
                throw listError;
            }

            const bucketExists = buckets?.some(b => b.name === 'case-files');

            if (!bucketExists) {
                // Create bucket
                const { error } = await supabase.storage.createBucket('case-files', {
                    public: true,
                    fileSizeLimit: 52428800,
                    allowedMimeTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain'
                    ]
                });

                if (error) {
                    throw error;
                }

                setStatus('success');
                setMessage('✅ Bucket criado com sucesso!');
            } else {
                setStatus('success');
                setMessage('✅ Bucket já existe!');
            }

            setShowSQL(true);

        } catch (error: any) {
            console.error('Erro:', error);
            setStatus('error');
            setMessage(`Erro: ${error.message || 'Erro desconhecido'}. Você pode precisar de permissões de admin.`);
        }
    };

    const handleCopySQL = () => {
        navigator.clipboard.writeText(sqlScript);
        alert('✅ SQL copiado para a área de transferência!');
    };

    const handleOpenSQL = () => {
        window.open('https://supabase.com/dashboard/project/wbvkjqfxdpbhpkjzqfqr/sql/new', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-3xl mx-auto">
                <Card className="p-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-brand-100 p-3 rounded-lg">
                            <Database className="text-brand-600" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Configurar Storage</h1>
                            <p className="text-slate-500">Configure o bucket para upload de arquivos</p>
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${status === 'success' ? 'bg-emerald-50 border border-emerald-200' :
                                status === 'error' ? 'bg-red-50 border border-red-200' :
                                    'bg-blue-50 border border-blue-200'
                            }`}>
                            {status === 'success' ? (
                                <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                            ) : status === 'error' ? (
                                <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                            ) : (
                                <Database size={20} className="text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
                            )}
                            <p className={`text-sm font-medium ${status === 'success' ? 'text-emerald-800' :
                                    status === 'error' ? 'text-red-800' :
                                        'text-blue-800'
                                }`}>{message}</p>
                        </div>
                    )}

                    {/* Step 1 */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <div className="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                                1
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Criar Bucket</h2>
                        </div>
                        <p className="text-slate-600 mb-4 ml-11">
                            Clique no botão para criar o bucket "case-files" automaticamente.
                        </p>
                        <div className="ml-11">
                            <Button
                                onClick={handleSetup}
                                disabled={status === 'creating' || status === 'success'}
                                isLoading={status === 'creating'}
                                className="w-full sm:w-auto"
                            >
                                {status === 'success' ? '✅ Bucket Criado' :
                                    status === 'creating' ? 'Criando...' :
                                        'Criar Bucket Agora'}
                            </Button>
                        </div>
                    </div>

                    {/* Step 2 - SQL */}
                    {showSQL && (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                                    2
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Executar SQL</h2>
                            </div>
                            <p className="text-slate-600 mb-4 ml-11">
                                Copie o SQL abaixo e execute no Supabase Dashboard para configurar as permissões.
                            </p>

                            <div className="ml-11">
                                {/* SQL Box */}
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 relative">
                                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                        {sqlScript}
                                    </pre>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={handleCopySQL}
                                        variant="secondary"
                                        className="!w-auto"
                                    >
                                        <Copy size={16} className="mr-2" />
                                        Copiar SQL
                                    </Button>
                                    <Button
                                        onClick={handleOpenSQL}
                                        className="!w-auto"
                                    >
                                        <ExternalLink size={16} className="mr-2" />
                                        Abrir SQL Editor
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 ml-11">
                        <h3 className="font-semibold text-slate-800 mb-3">📝 Instruções:</h3>
                        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Clique em "Criar Bucket Agora"</li>
                            <li>Aguarde a confirmação de sucesso</li>
                            <li>Clique em "Copiar SQL"</li>
                            <li>Clique em "Abrir SQL Editor"</li>
                            <li>Cole o SQL e clique em "Run"</li>
                            <li>Pronto! Volte para a aplicação e teste o upload</li>
                        </ol>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default QuickStorageSetup;

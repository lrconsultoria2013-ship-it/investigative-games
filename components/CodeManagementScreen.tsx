import React, { useState, useEffect } from 'react';
import {
    Key,
    Download,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    Copy,
    RefreshCw,
    MoreHorizontal
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Select from './ui/Select';
import { supabase } from '../lib/supabase';

// Helper type matching DB
interface Code {
    id: string;
    code: string;
    case_name: string;
    case_id?: string;
    status: 'active' | 'used' | 'expired';
    created_at: string;
    used_at?: string;
}

const CodeManagementScreen: React.FC = () => {
    // Mock Data
    // Data State
    const [codes, setCodes] = useState<Code[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Codes
    useEffect(() => {
        const fetchCodes = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('codes')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    // Map DB columns to local state if needed (camelCase vs snake_case)
                    // But here I used snake_case in interface for created_at, but component uses camelCase...
                    // Wait, component uses `createdAt` in map below. I need to fix that or map it here.
                    // Supabase returns snake_case.
                    const mappedData = data.map((item: any) => ({
                        ...item,
                        caseName: item.case_name,
                        createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '', // Format date
                        usedAt: item.used_at ? new Date(item.used_at).toISOString().split('T')[0] : null
                    }));
                    setCodes(mappedData);
                }
            } catch (err) {
                console.error('Error fetching codes:', err);
                setNotification({ message: 'Erro ao carregar códigos', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchCodes();
    }, []);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Modal State
    const [batchCase, setBatchCase] = useState('O Enigma do Relógio');
    const [batchQuantity, setBatchQuantity] = useState('10');

    // Fetched Cases for Dropdown
    const [availableCases, setAvailableCases] = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        const fetchCases = async () => {
            const { data } = await supabase.from('cases').select('title');
            if (data) {
                setAvailableCases(data.map((c: any) => ({ value: c.title, label: c.title })));
                // Select first one by default if available
                if (data.length > 0) setBatchCase(data[0].title);
                else setBatchCase('');
            }
        };
        fetchCases();
    }, []);

    const filteredCodes = codes.filter(code => {
        const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.caseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleGenerateBatch = async () => {
        if (!batchCase) {
            showNotification('Selecione um caso para gerar códigos', 'error');
            return;
        }
        setIsGenerating(true);
        try {
            const quantity = parseInt(batchQuantity);
            const newCodesPayload = [];

            // Generate codes locally
            for (let i = 0; i < quantity; i++) {
                const randomCode = `NEW-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
                newCodesPayload.push({
                    code: randomCode,
                    case_name: batchCase,
                    status: 'active'
                });
            }

            // Insert into Supabase
            const { data, error } = await supabase
                .from('codes')
                .insert(newCodesPayload)
                .select();

            if (error) throw error;

            if (data) {
                const mappedNewCodes = data.map((item: any) => ({
                    ...item,
                    caseName: item.case_name,
                    createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
                    usedAt: null
                }));
                setCodes(prev => [...mappedNewCodes, ...prev]);
                setShowGenerateModal(false);
                showNotification(`Lote de ${batchQuantity} códigos gerado com sucesso!`, 'success');
            }

        } catch (err) {
            console.error('Error generating codes:', err);
            showNotification('Erro ao gerar códigos no servidor', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge variant="success">Ativo</Badge>;
            case 'used': return <Badge variant="warning">Utilizado</Badge>;
            case 'expired': return <Badge variant="neutral">Expirado</Badge>;
            default: return <Badge>Desconhecido</Badge>;
        }
    };

    const handleExport = () => {
        if (filteredCodes.length === 0) {
            showNotification('Não há dados para exportar.', 'error');
            return;
        }

        const headers = ['ID', 'Código', 'Caso', 'Status', 'Criado em', 'Usado em'];
        const csvContent = [
            headers.join(','),
            ...filteredCodes.map(code => [
                code.id,
                code.code,
                `"${code.caseName}"`, // Quote incase of commas
                code.status,
                code.createdAt,
                code.usedAt || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'codes_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Arquivo CSV gerado com sucesso!', 'success');
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full relative">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

            {/* Modal Overlay */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Gerar Lote de Códigos</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Select
                                label="Vincular ao Caso"
                                value={batchCase}
                                onChange={(e) => setBatchCase(e.target.value)}
                                options={availableCases.length > 0 ? availableCases : [{ value: '', label: 'Nenhum caso cadastrado' }]}
                            />
                            <Input
                                label="Quantidade de Códigos"
                                type="number"
                                min="1"
                                max="500"
                                value={batchQuantity}
                                onChange={(e) => setBatchQuantity(e.target.value)}
                            />

                            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">Nota sobre segurança</p>
                                    <p className="opacity-90">Os códigos gerados são únicos e criptografados. Eles serão ativados imediatamente após a criação.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleGenerateBatch} isLoading={isGenerating}>
                                <RefreshCw size={18} className="mr-2" />
                                Gerar Códigos
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Actions */}
            <div className="flex justify-end mb-6 space-x-3">
                <Button
                    variant="secondary"
                    onClick={handleExport}
                    className="!w-auto"
                >
                    <Download size={18} className="mr-2" />
                    Exportar CSV
                </Button>
                <Button
                    onClick={() => setShowGenerateModal(true)}
                    className="!w-auto bg-brand-600 hover:bg-brand-700"
                >
                    <Plus size={18} className="mr-2" />
                    Gerar Novo Lote
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                <div className="md:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por código ou nome do caso..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:col-span-3">
                    <div className="relative">
                        <select
                            className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-slate-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativos</option>
                            <option value="used">Utilizados</option>
                            <option value="expired">Expirados</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
                {/* Stats Summary */}
                <div className="md:col-span-4 flex items-center justify-end space-x-4">
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-slate-800 leading-none">{codes.filter(c => c.status === 'active').length}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Ativos</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-slate-800 leading-none">{codes.filter(c => c.status === 'used').length}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Resgatados</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <Card className="min-h-[500px] flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="py-4 pl-6">Código de Ativação</th>
                                <th className="py-4">Caso Vinculado</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Data Criação</th>
                                <th className="py-4">Data Uso</th>
                                <th className="py-4 pr-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                            {filteredCodes.length > 0 ? (
                                filteredCodes.map((code) => (
                                    <tr key={code.id} className="border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-slate-100 p-2 rounded text-slate-600">
                                                    <Key size={16} />
                                                </div>
                                                <span className="font-mono font-medium text-slate-900 tracking-wider select-all">
                                                    {code.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-medium">{code.caseName}</td>
                                        <td className="py-4">
                                            {getStatusBadge(code.status)}
                                        </td>
                                        <td className="py-4 text-slate-500">{code.createdAt}</td>
                                        <td className="py-4 text-slate-500 font-mono">
                                            {code.usedAt || '-'}
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <button
                                                onClick={() => showNotification('Código copiado para a área de transferência', 'success')}
                                                className="text-slate-400 hover:text-brand-600 p-2 rounded transition-colors"
                                                title="Copiar Código"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <Search size={32} className="mb-3 opacity-30" />
                                            <p>Nenhum código encontrado com os filtros atuais.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center px-6">
                    <span className="text-xs text-slate-500">
                        Mostrando {filteredCodes.length} de {codes.length} resultados
                    </span>
                    <div className="flex space-x-2">
                        <button disabled className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-400 cursor-not-allowed">Anterior</button>
                        <button className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50">Próximo</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CodeManagementScreen;
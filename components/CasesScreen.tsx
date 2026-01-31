import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    FileText,
    Briefcase,
    Clock,
    Users,
    Printer,
    Edit3,
    Trash2,
    Box,
    MapPin,
    Eye
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Case, CaseStatus } from '../types';
import { supabase } from '../lib/supabase';


interface CasesScreenProps {
    onCreateCase: () => void;
    onEditCase: (id: string) => void;
    onNavigateToLayout: (id: string) => void;
}

const CasesScreen: React.FC<CasesScreenProps> = ({ onCreateCase, onEditCase, onNavigateToLayout }) => {
    /* Supabase Integration */
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCases = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setCases(data as Case[]);
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
            setNotification({ message: 'Erro ao carregar casos', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.theme.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: CaseStatus) => {
        switch (status) {
            case 'ready_to_print':
                return <Badge variant="warning">Pronto p/ Impressão</Badge>;
            case 'distributed':
                return <Badge variant="success">Distribuído</Badge>;
            case 'editing':
            default:
                return <Badge variant="info">Em Edição</Badge>;
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja arquivar este caso?')) {
            try {
                const { error } = await supabase
                    .from('cases')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setCases(cases.filter(c => c.id !== id));
                setNotification({ message: 'Caso arquivado com sucesso', type: 'success' });
            } catch (error) {
                console.error('Error deleting case:', error);
                setNotification({ message: 'Erro ao arquivar caso', type: 'error' });
            }
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full relative">

            {/* Filters & Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

                <div className="flex flex-1 w-full md:w-auto gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título ou tema..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="h-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-slate-700 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos os Status</option>
                            <option value="editing">Em Edição</option>
                            <option value="ready_to_print">Prontos</option>
                            <option value="distributed">Distribuídos</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>

                <Button
                    onClick={onCreateCase}
                    className="!w-auto bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-900/10"
                >
                    <Plus size={18} className="mr-2" />
                    Novo Caso
                </Button>
            </div>

            {/* Cases Grid / List */}
            <Card className="min-h-[500px] flex flex-col p-0 overflow-hidden border-0 shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="py-4 pl-6">Detalhes do Caso</th>
                                <th className="py-4">Tema & Gênero</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Métricas</th>
                                <th className="py-4">Última Edição</th>
                                <th className="py-4 pr-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                            {filteredCases.length > 0 ? (
                                filteredCases.map((game) => (
                                    <tr key={game.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="h-12 w-12 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 border border-slate-300">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base">{game.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">ID: {game.id.substring(0, 8)}... • Versão 1.0</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                {game.theme}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {getStatusBadge(game.status)}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-xs text-slate-600">
                                                    <Box size={12} className="mr-1.5 text-slate-400" />
                                                    <span className="font-mono font-medium">{game.copies_sold}</span> cópias
                                                </div>
                                                <div className="flex items-center text-xs text-slate-600">
                                                    <Users size={12} className="mr-1.5 text-slate-400" />
                                                    <span className="font-mono font-medium">{Math.floor(game.copies_sold * 2.5)}</span> jogadores
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center text-slate-500 text-xs">
                                                <Clock size={12} className="mr-1.5" />
                                                {new Date(game.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                                    title="Editar Conteúdo"
                                                    onClick={() => onEditCase(game.id)}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Diagramação e Impressão"
                                                    onClick={() => onNavigateToLayout(game.id)}
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Arquivar Caso"
                                                    onClick={() => handleDelete(game.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Search size={32} className="opacity-40" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-700">Nenhum caso encontrado</h3>
                                            <p className="max-w-xs mt-2 text-sm">Tente ajustar seus filtros ou crie um novo mistério para começar.</p>
                                            <Button
                                                variant="secondary"
                                                className="mt-6 !w-auto"
                                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                            >
                                                Limpar Filtros
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CasesScreen;
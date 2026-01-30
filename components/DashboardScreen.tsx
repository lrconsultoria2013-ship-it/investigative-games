import React, { useEffect, useState } from 'react';
import {
    Briefcase,
    Key,
    Users,
    Box,
    FileText,
    MoreVertical,
    Loader2
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { supabase } from '../lib/supabase';

// Layout handled by AdminLayout in App.tsx

const DashboardScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        cases: 0,
        codes: 0,
        agents: 0,
        kits: 0
    });

    const [recentCases, setRecentCases] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Counts
                const { count: casesCount } = await supabase.from('cases').select('*', { count: 'exact', head: true });
                const { count: codesCount } = await supabase.from('codes').select('*', { count: 'exact', head: true }).eq('status', 'active');
                const { count: agentsCount } = await supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active');

                // Mock Kits count for now as we don't have a kits table, usually it's derived from codes or sales
                // For now, let's assume kits = codes generated
                const { count: kitsCount } = await supabase.from('codes').select('*', { count: 'exact', head: true });

                setStats({
                    cases: casesCount || 0,
                    codes: codesCount || 0,
                    agents: agentsCount || 0,
                    kits: kitsCount || 0
                });

                // Fetch Recent Cases
                const { data: casesData } = await supabase
                    .from('cases')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (casesData) setRecentCases(casesData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
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

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={48} />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                    title="Total de Casos"
                    value={stats.cases.toString()}
                    trend="Base de dados"
                    trendUp={true}
                    icon={<Briefcase className="text-brand-600" size={24} />}
                />
                <MetricCard
                    title="Kits/Códigos Gerados"
                    value={stats.kits.toString()}
                    trend="Total histórico"
                    trendUp={true}
                    icon={<Box className="text-emerald-600" size={24} />}
                />
                <MetricCard
                    title="Códigos Ativos"
                    value={stats.codes.toString()}
                    trend="Em circulação"
                    trendUp={true}
                    icon={<Key className="text-amber-600" size={24} />}
                />
                <MetricCard
                    title="Agentes Ativos"
                    value={stats.agents.toString()}
                    trend="Operacionais"
                    trendUp={true}
                    icon={<Users className="text-indigo-600" size={24} />}
                />
            </div>

            {/* Recent Cases Table */}
            <Card title="Casos Recentes" action={<a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-800">Ver todos</a>}>
                <div className="overflow-x-auto">
                    {recentCases.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Nenhum caso encontrado.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="pb-3 pl-2">Título do Caso</th>
                                    <th className="pb-3">Tema</th>
                                    <th className="pb-3">Data Criação</th>
                                    <th className="pb-3">Vendas</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 pr-2 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700">
                                {recentCases.map((game) => (
                                    <tr key={game.id} className="border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-2 font-medium text-slate-900 flex items-center">
                                            <div className="h-8 w-8 rounded bg-brand-100 text-brand-600 flex items-center justify-center mr-3">
                                                <FileText size={16} />
                                            </div>
                                            {game.title}
                                        </td>
                                        <td className="py-4">{game.theme}</td>
                                        <td className="py-4 text-slate-500">{new Date(game.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 font-mono">{game.copies_sold || 0}</td>
                                        <td className="py-4">
                                            {getStatusBadge(game.status)}
                                        </td>
                                        <td className="py-4 pr-2 text-right">
                                            <button className="text-slate-400 hover:text-brand-600 p-1 rounded transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

const MetricCard = ({ title, value, trend, trendUp, icon }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                {icon}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                {trend}
            </span>
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    </Card>
);

export default DashboardScreen;
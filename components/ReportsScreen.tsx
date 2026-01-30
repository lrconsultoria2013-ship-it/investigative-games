import React, { useState, useEffect } from 'react';
import {
    FileBarChart,
    Box,
    Key,
    Bot,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Loader2
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { supabase } from '../lib/supabase';

// Layout handled by AdminLayout in App.tsx

const ReportsScreen: React.FC = () => {
    // Filter States
    const [period, setPeriod] = useState('month');
    const [caseType, setCaseType] = useState('all');
    const [codeStatus, setCodeStatus] = useState('all');
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        cases: 0,
        codes: 0,
        agents: 0,
        kits: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const { count: casesCount } = await supabase.from('cases').select('*', { count: 'exact', head: true });
                const { count: codesCount } = await supabase.from('codes').select('*', { count: 'exact', head: true }).eq('status', 'active');
                const { count: agentsCount } = await supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active');
                const { count: kitsCount } = await supabase.from('codes').select('*', { count: 'exact', head: true });

                setStats({
                    cases: casesCount || 0,
                    codes: codesCount || 0,
                    agents: agentsCount || 0,
                    kits: kitsCount || 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={48} />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                    {notification.message}
                </div>
            )}

            {/* Filter Panel (Visual Only for now) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm opacity-50 pointer-events-none">
                <div className="text-center text-sm text-slate-500">Filtros indisponíveis (Dados Insuficientes)</div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Casos Criados"
                    value={stats.cases.toString()}
                    trend="Base de dados"
                    trendPositive={true}
                    icon={<Box className="text-white" size={24} />}
                    color="bg-brand-600"
                />
                <KPICard
                    title="Kits Gerados"
                    value={stats.kits.toString()}
                    trend="Total"
                    trendPositive={true}
                    icon={<FileBarChart className="text-white" size={24} />}
                    color="bg-emerald-500"
                />
                <KPICard
                    title="Códigos Ativados"
                    value={stats.codes.toString()}
                    trend="Em uso"
                    trendPositive={true}
                    icon={<Key className="text-white" size={24} />}
                    color="bg-indigo-500"
                />
                <KPICard
                    title="Agentes IA"
                    value={stats.agents.toString()}
                    trend="Ativos"
                    trendPositive={true}
                    icon={<Bot className="text-white" size={24} />}
                    color="bg-amber-500"
                />
            </div>

            {/* Charts Section - Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Evolução de Ativações" className="lg:col-span-2 min-h-[320px]">
                    <div className="h-64 flex items-center justify-center text-slate-400">
                        Dados insuficientes para gerar gráficos.
                    </div>
                </Card>

                <Card title="Status dos Agentes">
                    <div className="h-64 flex items-center justify-center text-slate-400">
                        Dados insuficientes.
                    </div>
                </Card>
            </div>

            {/* Detailed Data Table */}
            <Card title="Detalhamento de Métricas">
                <div className="p-8 text-center text-slate-500">
                    Nenhuma atividade recente registrada.
                </div>
            </Card>
        </div>
    );
};

const KPICard = ({ title, value, trend, trendPositive, icon, color }: { title: string, value: string, trend: string, trendPositive: boolean, icon: React.ReactNode, color: string }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${color} opacity-90 transition-opacity group-hover:opacity-100`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            <div className="flex items-center mt-2">
                {trendPositive ? <TrendingUp size={14} className="text-emerald-500 mr-1" /> : <TrendingDown size={14} className="text-red-500 mr-1" />}
                <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend}
                </span>
            </div>
        </div>
    </div>
);

export default ReportsScreen;
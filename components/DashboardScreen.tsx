import React from 'react';
import { 
  Briefcase, 
  Key, 
  Users,
  Box,
  FileText,
  MoreVertical,
  Search,
  Plus
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Case, CaseStatus } from '../types';

// NOTE: Layout logic moved to AdminLayout. This component now only renders the dashboard content.

const DashboardScreen: React.FC = () => {
  // Mock Data
  const recentCases: Case[] = [
    { id: '1', title: 'O Mistério do Solar Tudor', theme: 'Mistério Clássico', status: 'ready_to_print', created_at: '22 Out, 2024', copies_sold: 145 },
    { id: '2', title: 'Operação Coldbridge', theme: 'Espionagem', status: 'editing', created_at: '25 Out, 2024', copies_sold: 0 },
    { id: '3', title: 'O Último Suspiro', theme: 'Terror Lovecraftiano', status: 'distributed', created_at: '10 Out, 2024', copies_sold: 890 },
    { id: '4', title: 'Protocolo Zero', theme: 'Cyberpunk', status: 'editing', created_at: '26 Out, 2024', copies_sold: 0 },
  ];

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

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard 
                title="Total de Casos" 
                value="24" 
                trend="+2 este mês" 
                trendUp={true}
                icon={<Briefcase className="text-brand-600" size={24} />} 
            />
            <MetricCard 
                title="Kits Gerados" 
                value="1,203" 
                trend="+12% vs mês ant." 
                trendUp={true}
                icon={<Box className="text-emerald-600" size={24} />} 
            />
            <MetricCard 
                title="Códigos Ativos" 
                value="856" 
                trend="-5 expiram hoje" 
                trendUp={false} // Warning/Negative context
                icon={<Key className="text-amber-600" size={24} />} 
            />
            <MetricCard 
                title="Jogadores" 
                value="15.4k" 
                trend="+840 novos" 
                trendUp={true}
                icon={<Users className="text-indigo-600" size={24} />} 
            />
        </div>

        {/* Charts & Graphs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Activity Chart */}
            <Card title="Engajamento dos Jogadores" className="lg:col-span-2 min-h-[300px]">
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="h-3 w-3 bg-brand-500 rounded-full"></span>
                            <span className="text-xs text-slate-500">Resoluções</span>
                            <span className="h-3 w-3 bg-slate-200 rounded-full ml-2"></span>
                            <span className="text-xs text-slate-500">Tentativas</span>
                        </div>
                        <select className="text-xs border-none bg-slate-50 rounded-md p-1 text-slate-600 focus:ring-0">
                            <option>Últimos 7 dias</option>
                            <option>Últimos 30 dias</option>
                        </select>
                    </div>
                    {/* CSS-only Bar Chart simulation */}
                    <div className="flex items-end justify-between h-48 w-full space-x-2 pt-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group relative">
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-slate-800 text-white p-1 rounded">
                                    {h}
                                </div>
                                <div className="w-full bg-slate-100 rounded-t-sm relative h-48">
                                    <div 
                                        className="absolute bottom-0 w-full bg-brand-500 rounded-t-sm hover:bg-brand-400 transition-all duration-300" 
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div 
                                        className="absolute bottom-0 w-full bg-brand-200/30 rounded-t-sm pointer-events-none" 
                                        style={{ height: `${h + 20 > 100 ? 100 : h + 20}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-2">{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Status Donut Chart */}
            <Card title="Status dos Agentes (IA)">
                <div className="flex flex-col items-center justify-center h-full pb-4">
                    <div className="relative h-48 w-48 mt-4">
                        {/* SVG Donut Chart */}
                        <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                            {/* Ring 1: Active */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="70 100" strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
                            {/* Ring 2: Warning */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-70" className="transition-all duration-1000 ease-out" />
                            {/* Ring 3: Offline */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 100" strokeDashoffset="-90" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800">92%</span>
                            <span className="text-xs text-slate-500">Operacional</span>
                        </div>
                    </div>
                    <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>Ativos</div>
                            <span className="font-semibold text-slate-700">70%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>Treinamento</div>
                            <span className="font-semibold text-slate-700">20%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Inativos</div>
                            <span className="font-semibold text-slate-700">10%</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        {/* Recent Cases Table */}
        <Card title="Casos Recentes" action={<a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-800">Ver todos</a>}>
            <div className="overflow-x-auto">
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
                                <td className="py-4 text-slate-500">{game.created_at}</td>
                                <td className="py-4 font-mono">{game.copies_sold > 0 ? game.copies_sold : '-'}</td>
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
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
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
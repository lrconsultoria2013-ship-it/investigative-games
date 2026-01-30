import React, { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  Filter, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Box,
  Key,
  Bot,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

// Layout handled by AdminLayout in App.tsx

const ReportsScreen: React.FC = () => {
  // Filter States
  const [period, setPeriod] = useState('month');
  const [caseType, setCaseType] = useState('all');
  const [codeStatus, setCodeStatus] = useState('all');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Notification Toast */}
      {notification && (
          <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
             {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
             {notification.message}
          </div>
      )}

        {/* Filter Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center mb-3 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <Filter size={14} className="mr-2" /> Filtros de Análise
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Período</label>
                    <div className="relative">
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                        >
                            <option value="week">Última Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="year">Este Ano</option>
                        </select>
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Tipo de Caso</label>
                    <select 
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="mystery">Mistério Clássico</option>
                        <option value="scifi">Ficção Científica</option>
                        <option value="educational">Educativo</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Status do Código</label>
                    <select 
                        value={codeStatus}
                        onChange={(e) => setCodeStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="used">Utilizados</option>
                        <option value="expired">Expirados</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <Button variant="secondary" onClick={() => showNotification('Filtros aplicados.', 'success')}>
                        Aplicar Filtros
                    </Button>
                </div>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
                title="Casos Criados" 
                value="24" 
                trend="+2 este mês" 
                trendPositive={true}
                icon={<Box className="text-white" size={24} />}
                color="bg-brand-600"
            />
             <KPICard 
                title="Kits Gerados" 
                value="1,203" 
                trend="+12% vs. anterior" 
                trendPositive={true}
                icon={<FileBarChart className="text-white" size={24} />}
                color="bg-emerald-500"
            />
            <KPICard 
                title="Códigos Ativados" 
                value="856" 
                trend="72% taxa de uso" 
                trendPositive={true}
                icon={<Key className="text-white" size={24} />}
                color="bg-indigo-500"
            />
            <KPICard 
                title="Interações de Agentes" 
                value="14.2k" 
                trend="-5% vs. anterior" 
                trendPositive={false}
                icon={<Bot className="text-white" size={24} />}
                color="bg-amber-500"
            />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart: Code Activations */}
            <Card title="Evolução de Ativações (Últimas 12 Semanas)" className="lg:col-span-2 min-h-[320px]">
                <div className="h-64 w-full flex items-end justify-between pt-6 relative">
                    {/* Y-Axis Lines (Background) */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="w-full h-px bg-slate-100"></div>
                        <div className="w-full h-px bg-slate-100"></div>
                        <div className="w-full h-px bg-slate-100"></div>
                        <div className="w-full h-px bg-slate-100"></div>
                        <div className="w-full h-px bg-slate-100"></div>
                    </div>
                    
                    {/* Line Path (SVG) */}
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                         <defs>
                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2"></stop>
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        {/* Fake smooth curve */}
                        <path 
                            d="M0,200 C50,180 100,220 150,150 C200,80 250,120 300,100 C350,80 400,40 450,60 C500,80 550,20 600,10 L600,250 L0,250 Z" 
                            fill="url(#gradient)" 
                            className="text-brand-500"
                        />
                         <path 
                            d="M0,200 C50,180 100,220 150,150 C200,80 250,120 300,100 C350,80 400,40 450,60 C500,80 550,20 600,10" 
                            fill="none" 
                            stroke="#2563eb" 
                            strokeWidth="3" 
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="w-full flex justify-between absolute bottom-0 translate-y-6 text-xs text-slate-400">
                        <span>Sem 1</span>
                        <span>Sem 3</span>
                        <span>Sem 6</span>
                        <span>Sem 9</span>
                        <span>Sem 12</span>
                    </div>
                </div>
            </Card>

            {/* Donut Chart: Agent Status */}
            <Card title="Status dos Agentes">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="relative h-40 w-40">
                        {/* SVG Donut */}
                        <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="65 100" strokeDashoffset="0" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-65" />
                             <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-90" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-slate-800">100%</span>
                            <span className="text-[10px] text-slate-500 uppercase">Uptime</span>
                        </div>
                    </div>
                    <div className="w-full mt-6 space-y-2 px-4">
                        <LegendItem color="bg-emerald-500" label="Ativos" value="65%" />
                        <LegendItem color="bg-amber-500" label="Aprendizado" value="25%" />
                        <LegendItem color="bg-red-500" label="Inativos" value="10%" />
                    </div>
                </div>
            </Card>
        </div>

        {/* Detailed Data Table */}
        <Card title="Detalhamento de Métricas" action={<Button variant="ghost" className="!w-auto !py-1 !text-xs">Ver Tudo</Button>}>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold bg-slate-50/50">
                            <th className="py-3 pl-4">Caso / Kit</th>
                            <th className="py-3">Código Vinculado</th>
                            <th className="py-3">Agente Principal</th>
                            <th className="py-3 text-center">Interações</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Última Atualização</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-3 pl-4">
                                    <div className="font-medium text-slate-900">O Enigma do Relógio</div>
                                    <div className="text-xs text-slate-500">Kit #{200 + item}</div>
                                </td>
                                <td className="py-3 font-mono text-xs">TRTH-892{item}-X</td>
                                <td className="py-3 flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mr-2">
                                        <Bot size={14} />
                                    </div>
                                    Inspetor Lestrade
                                </td>
                                <td className="py-3 text-center">
                                    <span className="bg-slate-100 text-slate-700 py-0.5 px-2 rounded-full text-xs font-medium">
                                        {10 + item * 5}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <Badge variant={item % 3 === 0 ? 'warning' : 'success'}>
                                        {item % 3 === 0 ? 'Pausado' : 'Monitorando'}
                                    </Badge>
                                </td>
                                <td className="py-3 text-slate-500 text-xs">
                                    Há {item * 10} min
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

const LegendItem = ({ color, label, value }: { color: string, label: string, value: string }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full ${color} mr-2`}></span>
            <span className="text-slate-600">{label}</span>
        </div>
        <span className="font-semibold text-slate-800">{value}</span>
    </div>
);

export default ReportsScreen;
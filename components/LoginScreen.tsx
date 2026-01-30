import React, { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Fingerprint, Search, ArrowRight } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Insira um e-mail válido.';
    }

    if (!password) {
      newErrors.password = 'A senha é obrigatória.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear global errors

    if (!validate()) return;

    setIsLoading(true);

    // Simulate API Call - Allowing any credentials for testing
    setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      
      {/* Left Column - Visual / Brand Storytelling */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
             {/* Abstract pattern simulating a map or evidence board */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L100 0 L100 100 Z" fill="#1e293b" />
                <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <line x1="20" y1="35" x2="80" y2="80" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,2" />
                <rect x="70" y="70" width="20" height="20" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </svg>
        </div>
        
        <div className="z-10 relative">
            <div className="flex items-center space-x-2 text-brand-400 mb-6">
                <Search size={24} />
                <span className="font-semibold tracking-wider uppercase text-sm">Plataforma Administrativa</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
                Desvende o potencial <br/> 
                <span className="text-brand-400">das suas histórias.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
                Gerencie casos, pistas e narrativas em um só lugar. Onde cada detalhe conta e cada decisão importa.
            </p>
        </div>

        <div className="z-10 relative">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
                © 2024 True Crime Press. All rights reserved.
            </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        
        <div className="w-full max-w-md space-y-8">
            {/* Header / Logo Section */}
            <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-brand-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-900/20">
                    <Fingerprint size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Bem-vindo de volta
                </h2>
                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                    Acesse o Sistema de Criação e Gestão de Jogos Investigativos para continuar seu trabalho.
                </p>
            </div>

            {/* Form Section */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {errors.form && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-100">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Erro no acesso
                                </h3>
                                <div className="mt-1 text-sm text-red-700">
                                    {errors.form}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        id="email"
                        label="E-mail Corporativo"
                        type="email"
                        placeholder="nome@investigacao.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail size={18} />}
                        error={errors.email}
                        autoComplete="email"
                    />

                    <div>
                        <Input
                            id="password"
                            label="Senha de Acesso"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            error={errors.password}
                            autoComplete="current-password"
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />
                        <div className="flex justify-end mt-2">
                            <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" isLoading={isLoading}>
                        Entrar na Plataforma
                        {!isLoading && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-50 text-slate-500">
                        Modo de Testes Ativado
                    </span>
                </div>
            </div>
            
            <div className="text-center text-xs text-slate-400">
                <p>Qualquer e-mail e senha são aceitos.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
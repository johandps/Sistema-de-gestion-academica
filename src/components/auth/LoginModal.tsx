import React, { useState } from 'react';
import { 
  Lock, Mail, GraduationCap, ShieldAlert, 
  ArrowRight, CheckCircle2, UserCheck, ShieldCheck, BookOpen 
} from 'lucide-react';
import { authService } from '../../services';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState('admin@unitec.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = authService.login(username, password);
      setLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Credenciales inválidas');
      }
    }, 300);
  };

  const handleQuickFill = (userEmail: string) => {
    setUsername(userEmail);
    setPassword('secret123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Acceso Institucional SIGA</h2>
          <p className="text-xs text-indigo-100 mt-1">
            Sistema de Gestión Académica - Universidad Nacional de Innovación & Tecnología
          </p>
          <span className="inline-block mt-2 text-[10px] uppercase font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
            Requerimiento Funcional RF-01 / RF-02
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. santiago.ramirez@unitec.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Roles for Demonstration */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Perfiles de Prueba Rápidos (Evaluación)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@unitec.edu')}
                className="p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-left transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">Administrador</div>
                  <div className="text-[10px] text-purple-700">admin@unitec.edu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('coordinador@unitec.edu')}
                className="p-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-left transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">Coordinador</div>
                  <div className="text-[10px] text-indigo-700">coord@unitec.edu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('carlos.restrepo@unitec.edu')}
                className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-left transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">Docente</div>
                  <div className="text-[10px] text-emerald-700">carlos.restrepo@...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('santiago.ramirez@unitec.edu')}
                className="p-2 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-900 text-left transition-colors flex items-center gap-2"
              >
                <GraduationCap className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">Estudiante</div>
                  <div className="text-[10px] text-sky-700">santiago.ramirez@...</div>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

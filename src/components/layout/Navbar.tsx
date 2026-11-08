import React, { useState } from 'react';
import { 
  GraduationCap, ShieldCheck, Database, Layers, 
  LogOut, UserCircle2, ChevronDown, Check, Menu, X, Printer
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { userRepository } from '../../repositories';
import { triggerGlobalPrint } from '../../utils/printHelper';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  onOpenArchitecture: () => void;
  onOpenBackup: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onOpenArchitecture,
  onOpenBackup,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const users = userRepository.findAll();

  const getRoleBadgeStyle = (rol: UserRole) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COORDINADOR':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DOCENTE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ESTUDIANTE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">SIGA</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                    v2.5 Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                  Universidad Nacional de Innovación & Tecnología (UNITEC)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Architecture & Specs Button */}
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
              title="Ver Arquitectura en Capas, Mapeo Spring Boot / Hibernate y Swagger REST"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Arquitectura & REST</span>
            </button>

            {/* Backup & Restore (RNF-09) */}
            <button
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
              title="Respaldo y Restauración de Base de Datos Institucional (RNF-09)"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Respaldo</span>
            </button>

            {/* Global Print Action (window.print()) */}
            <button
              onClick={() => triggerGlobalPrint('SIGA - Sistema Institucional de Gestión Académica')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Imprimir vista actual (window.print()) con estilos institucionales"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all text-left shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.nombreCompleto.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                    {currentUser.nombreCompleto}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                    {currentUser.rol.toLowerCase()}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(currentUser.rol)}`}>
                  {currentUser.rol}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Simular Roles y Permisos (RF-02)
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cambie instantáneamente entre perfiles para validar las restricciones de seguridad:
                    </p>
                  </div>

                  <div className="py-1 max-h-64 overflow-y-auto">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-indigo-50/70 font-semibold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-slate-900 truncate">{u.nombreCompleto}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getRoleBadgeStyle(u.rol)}`}>
                              {u.rol}
                            </span>
                            <span className="truncate">{u.email}</span>
                          </div>
                        </div>
                        {u.id === currentUser.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión (RF-01)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Users, UserCheck, BookOpen, Calendar, 
  ClipboardCheck, Award, FileText, History, 
  GraduationCap, LayoutDashboard, Layers, Database, Lock
} from 'lucide-react';
import { UserRole } from '../../types';

export type ActiveTab = 
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'academics'
  | 'groups'
  | 'enrollment'
  | 'grades'
  | 'studentPortal'
  | 'reports'
  | 'audit'
  | 'architecture';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  rfCode?: string;
  allowedRoles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Panel Institucional',
    icon: LayoutDashboard,
    allowedRoles: ['ADMIN', 'COORDINADOR', 'DOCENTE'],
  },
  {
    id: 'studentPortal',
    label: 'Mi Portal Estudiante',
    icon: GraduationCap,
    rfCode: 'RF-09',
    allowedRoles: ['ESTUDIANTE', 'ADMIN', 'COORDINADOR'],
    badge: 'Notas & Horario',
  },
  {
    id: 'students',
    label: 'Estudiantes',
    icon: Users,
    rfCode: 'RF-03',
    allowedRoles: ['ADMIN', 'COORDINADOR'],
  },
  {
    id: 'teachers',
    label: 'Cuerpo Docente',
    icon: UserCheck,
    rfCode: 'RF-04',
    allowedRoles: ['ADMIN', 'COORDINADOR'],
  },
  {
    id: 'academics',
    label: 'Programas y Asignaturas',
    icon: BookOpen,
    rfCode: 'RF-05',
    allowedRoles: ['ADMIN', 'COORDINADOR'],
  },
  {
    id: 'groups',
    label: 'Periodos y Grupos',
    icon: Calendar,
    rfCode: 'RF-06',
    allowedRoles: ['ADMIN', 'COORDINADOR'],
  },
  {
    id: 'enrollment',
    label: 'Matrícula Académica',
    icon: ClipboardCheck,
    rfCode: 'RF-07',
    allowedRoles: ['ADMIN', 'COORDINADOR'],
    badge: 'Cupos',
  },
  {
    id: 'grades',
    label: 'Registro Calificaciones',
    icon: Award,
    rfCode: 'RF-08',
    allowedRoles: ['DOCENTE', 'COORDINADOR', 'ADMIN'],
  },
  {
    id: 'reports',
    label: 'Reportes y Métricas',
    icon: FileText,
    rfCode: 'RF-10',
    allowedRoles: ['ADMIN', 'COORDINADOR', 'DOCENTE'],
  },
  {
    id: 'audit',
    label: 'Pista de Auditoría',
    icon: History,
    rfCode: 'RF-12',
    allowedRoles: ['ADMIN'],
    badge: 'Seguridad',
  },
  {
    id: 'architecture',
    label: 'Arquitectura & REST API',
    icon: Layers,
    rfCode: 'RNF-04/10',
    allowedRoles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
    badge: 'Spring/JPA',
  },
];

interface SidebarProps {
  currentRole: UserRole;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const visibleItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(currentRole));

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      } no-print`}>
        
        {/* Navigation links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Módulos de Sistema</span>
            <span className="text-[9px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">
              {currentRole}
            </span>
          </div>

          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.rfCode && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-indigo-700/80 text-indigo-100' 
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300 border border-slate-700'
                    }`}>
                      {item.rfCode}
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* System Architecture info footer */}
        <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-200 text-[11px] truncate">Control RBAC Activo</p>
              <p className="text-[10px] text-slate-400 leading-tight">Acceso restringido según RF-02</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

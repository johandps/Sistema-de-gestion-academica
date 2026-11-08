import React from 'react';
import { 
  Users, UserCheck, BookOpen, Calendar, 
  Award, TrendingUp, Layers, CheckCircle2, 
  ArrowRight, ShieldCheck, History, Sparkles 
} from 'lucide-react';
import { User } from '../../types';
import { 
  studentService, teacherService, academicService, 
  groupPeriodService, enrollmentService, gradeService, auditService 
} from '../../services';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardOverviewProps {
  currentUser: User;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ currentUser, onNavigate }) => {
  const students = studentService.getAll();
  const teachers = teacherService.getAll();
  const programs = academicService.getPrograms();
  const activePeriod = groupPeriodService.getActivePeriod();
  const groups = groupPeriodService.getGroups(activePeriod?.id);
  const enrollments = enrollmentService.getEnrollmentsByGroup('').filter(e => e.estado === 'MATRICULADA');
  const recentLogs = auditService.getAllLogs().slice(0, 5);

  const activeStudentsCount = students.filter(s => s.estado === 'ACTIVO').length;
  const activeTeachersCount = teachers.filter(t => t.activo).length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Institutional Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Periodo Vigente: {activePeriod?.nombre || '2026-I'}
              </span>
              <span className="text-[11px] text-slate-400">
                Autenticado como: <strong>{currentUser.nombreCompleto}</strong> ({currentUser.rol})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              Consola Integral de Gestión Académica - SIGA Enterprise
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Plataforma institucional de control docente, planes de estudio, matrículas con validación de cupos atómicos, registro de evaluaciones y auditoría inmutable.
            </p>
          </div>

          <button
            onClick={() => onNavigate('architecture')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Ver Arquitectura en Capas</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estudiantes */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiantes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{activeStudentsCount} Activos en Sistema</p>
          </div>
        </div>

        {/* Docentes */}
        <div 
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuerpo Docente</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{activeTeachersCount} Profesores Habilitados</p>
          </div>
        </div>

        {/* Programas */}
        <div 
          onClick={() => onNavigate('academics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Programas Académicos</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{programs.length}</div>
            <p className="text-[11px] text-sky-700 font-semibold mt-0.5">Ingeniería, Admin, Derecho</p>
          </div>
        </div>

        {/* Grupos en Oferta */}
        <div 
          onClick={() => onNavigate('groups')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grupos Ofertados</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{groups.length}</div>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Secciones con Horarios</p>
          </div>
        </div>

      </div>

      {/* Quick Flow Actions & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Operations */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm">Flujos Operativos Rápidos</h2>
            <span className="text-xs text-indigo-600 font-semibold">Accesos directos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => onNavigate('enrollment')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Matricular Estudiante</span>
                <span className="text-slate-500 text-[11px]">Validación de cupos atómicos (RF-07)</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('grades')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Planilla de Notas</span>
                <span className="text-slate-500 text-[11px]">Cortes 30/30/40 y cálculo (RF-08)</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('studentPortal')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-left transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Portal del Estudiante</span>
                <span className="text-slate-500 text-[11px]">Boletín y horarios (RF-09)</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Reportería y CSV</span>
                <span className="text-slate-500 text-[11px]">Sábana de notas y KPIs (RF-10)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Audit Trail (RF-12) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-slate-900 text-sm">Pista Reciente de Auditoría (RF-12)</h2>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                      {log.accion}
                    </span>
                    <span className="text-slate-400 text-[10px]">{log.fechaHora.substring(11, 19)}</span>
                  </div>
                  <p className="font-medium text-slate-800 truncate mt-0.5">{log.descripcion}</p>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  {log.usuarioNombre.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

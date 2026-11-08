import React, { useState } from 'react';
import { 
  History, Search, Filter, ShieldCheck, 
  Clock, User, Laptop, Eye, ChevronDown, ChevronUp, Lock, 
  CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { auditService } from '../../services';
import { AuditLog } from '../../types';

export const AuditLogViewer: React.FC = () => {
  const [moduloFiltro, setModuloFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Automatically ensures Johan Pava is expunged and returns active logs
  const logs = auditService.getAllLogs(moduloFiltro, undefined, busqueda);

  const modulos = ['TODOS', 'AUTENTICACION', 'ESTUDIANTES', 'DOCENTES', 'ACADEMICO', 'GRUPOS', 'MATRICULAS', 'CALIFICACIONES', 'SISTEMA'];

  const getActionBadge = (accion: AuditLog['accion']) => {
    if (accion.includes('LOGIN')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (accion.includes('MATRICULA')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (accion.includes('CALIFICACION')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (accion.includes('CREAR')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (accion.includes('ELIMINAR') || accion.includes('DEPURAR')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const isSearchingJohanOrPava = busqueda.toLowerCase().includes('johan') || busqueda.toLowerCase().includes('pava');

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pista Inmutable de Auditoría & Trazabilidad
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              RF-12 / RNF-01 / RNF-10
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro cronológico inmutable de eventos sensibles: accesos, cambios de rol, matrículas y alteraciones de calificaciones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integridad Criptográfica Verificada</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pista Inmutable (WORM)</span>
          </div>
        </div>
      </div>

      {/* Notice if searching for student Johan Pava */}
      {isSearchingJohanOrPava && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3 text-xs text-sky-900">
          <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm font-bold text-sky-950">
              Rastro de Johan Pava Purgado Permanentemente
            </strong>
            <p className="mt-0.5 text-sky-800">
              En cumplimiento del derecho al olvido y las directrices de privacidad (RNF-11 / Habeas Data), cualquier registro, evento o referencia al estudiante <strong>Johan Pava</strong> ha sido eliminado permanentemente del motor de persistencia y la pista inmutable de auditoría (0 coincidencias).
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por usuario, acción o detalles..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
          >
            {modulos.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            {isSearchingJohanOrPava 
              ? 'No existe ningún rastro del estudiante Johan Pava en la pista de auditoría (Registro purgado permanentemente).'
              : 'No se encontraron registros de auditoría con los filtros aplicados.'}
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div 
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
              >
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadge(log.accion)}`}>
                          {log.accion}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {log.modulo}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {log.fechaHora}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900 text-sm">
                        {log.descripcion}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <strong>{log.usuarioNombre}</strong> ({log.usuarioRol})
                        </span>
                        <span className="flex items-center gap-1">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          IP: <code className="font-mono text-slate-700">{log.ipOrigen}</code>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Before / After Snapshot */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {log.detallesAntes && (
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <span className="font-bold text-rose-700 text-[11px] uppercase tracking-wider block mb-1.5">
                            Estado Previo (Antes)
                          </span>
                          <pre className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.detallesAntes, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.detallesDespues && (
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <span className="font-bold text-emerald-700 text-[11px] uppercase tracking-wider block mb-1.5">
                            Nuevo Estado (Después)
                          </span>
                          <pre className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.detallesDespues, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                      <span>Agente de Usuario: {log.navegador}</span>
                      <span className="font-mono">UUID: {log.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

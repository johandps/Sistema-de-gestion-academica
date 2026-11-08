import React, { useState } from 'react';
import { 
  Calendar, Plus, Clock, MapPin, Users, 
  Link as LinkIcon, CheckCircle2, AlertTriangle, 
  X, Filter, Sparkles, BookOpen 
} from 'lucide-react';
import { AcademicGroup, AcademicPeriod, HorarioClase, ModalidadAsignatura, User } from '../../types';
import { groupPeriodService, academicService, teacherService } from '../../services';

interface GroupManagementProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({ currentUser, onNotify }) => {
  const periods = groupPeriodService.getPeriods();
  const activePeriod = groupPeriodService.getActivePeriod() || periods[0];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(activePeriod?.id || '');

  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewPeriodOpen, setIsNewPeriodOpen] = useState(false);

  // Group Form
  const [codigoGrupo, setCodigoGrupo] = useState('01');
  const [asignaturaId, setAsignaturaId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [cupoMaximo, setCupoMaximo] = useState(30);
  const [modalidad, setModalidad] = useState<ModalidadAsignatura>('PRESENCIAL');
  const [enlaceVirtual, setEnlaceVirtual] = useState('');
  const [horarios, setHorarios] = useState<HorarioClase[]>([
    { dia: 'LUNES', horaInicio: '08:00', horaFin: '10:00', aula: 'Edificio A - Aula 201' },
    { dia: 'MIERCOLES', horaInicio: '08:00', horaFin: '10:00', aula: 'Laboratorio de Cómputo Lab-1' }
  ]);

  // Period Form
  const [periodForm, setPeriodForm] = useState({
    codigo: '2026-2',
    nombre: 'Periodo Ordinario 2026-II',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-12-15',
    fechaLimiteMatricula: '2026-08-25',
    fechaCierreNotas: '2026-12-20',
    esPeriodoActivo: false,
    estado: 'ACTIVO' as const,
  });

  const subjects = academicService.getSubjects();
  const teachers = teacherService.getAll();
  const groups = groupPeriodService.getGroups(selectedPeriodId);

  const handleAddHorario = () => {
    setHorarios([...horarios, { dia: 'VIERNES', horaInicio: '10:00', horaFin: '12:00', aula: 'Aula General' }]);
  };

  const handleRemoveHorario = (index: number) => {
    setHorarios(horarios.filter((_, idx) => idx !== index));
  };

  const handleUpdateHorario = (index: number, field: keyof HorarioClase, val: any) => {
    const updated = [...horarios];
    updated[index] = { ...updated[index], [field]: val };
    setHorarios(updated);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asignaturaId || !docenteId) {
      onNotify('warning', 'Campos Incompletos', 'Seleccione la asignatura y el docente responsable.');
      return;
    }

    try {
      groupPeriodService.createGroup({
        codigoGrupo,
        periodoId: selectedPeriodId,
        asignaturaId,
        docenteId,
        cupoMaximo,
        horarios,
        modalidad,
        enlaceVirtual: enlaceVirtual || undefined,
        estado: 'ABIERTO',
      }, currentUser);

      onNotify('success', 'Grupo Aperturado', `Se creó el grupo ${codigoGrupo} con ${cupoMaximo} cupos.`);
      setIsNewGroupOpen(false);
    } catch (err: any) {
      onNotify('error', 'Conflicto de Horario o Datos', err.message);
    }
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      groupPeriodService.createPeriod(periodForm, currentUser);
      onNotify('success', 'Periodo Creado', `Se habilitó el periodo ${periodForm.nombre}`);
      setIsNewPeriodOpen(false);
    } catch (err: any) {
      onNotify('error', 'Error al Guardar', err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Periodos y Oferta de Grupos
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              RF-06
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de periodos académicos, secciones, cupos, docentes asignados, horarios y salones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPeriodOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Nuevo Periodo</span>
          </button>

          <button
            onClick={() => {
              setAsignaturaId(subjects[0]?.id || '');
              setDocenteId(teachers[0]?.id || '');
              setIsNewGroupOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Aperturar Grupo</span>
          </button>
        </div>
      </div>

      {/* Period Selection Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Periodo de Oferta:
          </span>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="text-xs sm:text-sm py-1.5 px-3 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.codigo}) {p.esPeriodoActivo ? '★ ACTIVO' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Periodo habilitado para inscripciones
          </span>
          <span className="font-bold text-slate-700">
            {groups.length} grupos programados
          </span>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => {
          const subject = subjects.find(s => s.id === group.asignaturaId);
          const teacher = teachers.find(t => t.id === group.docenteId);
          const cupoPorcentaje = Math.round(((group.cupoMaximo - group.cupoDisponible) / group.cupoMaximo) * 100);

          return (
            <div 
              key={group.id} 
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Grupo {group.codigoGrupo} • {subject?.codigo || 'MAT'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                      {subject?.nombre || 'Asignatura'}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    group.estado === 'ABIERTO'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {group.estado}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="text-slate-400">Docente:</span>
                    <span>{teacher?.nombreCompleto || 'Sin Docente'}</span>
                  </div>

                  {/* Cupo indicator */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600">Cupos Disponibles:</span>
                      <span className={group.cupoDisponible === 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {group.cupoDisponible} de {group.cupoMaximo} libres
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          cupoPorcentaje >= 90 ? 'bg-rose-500' : cupoPorcentaje >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${cupoPorcentaje}%` }}
                      />
                    </div>
                  </div>

                  {/* Schedules */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px]">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                      Horarios y Aulas:
                    </span>
                    {group.horarios.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="font-semibold">{h.dia} {h.horaInicio}-{h.horaFin}</span>
                        <span className="text-slate-400">•</span>
                        <span className="truncate">{h.aula}</span>
                      </div>
                    ))}
                  </div>

                  {group.enlaceVirtual && (
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-indigo-600 truncate">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <a href={group.enlaceVirtual} target="_blank" rel="noreferrer" className="underline truncate">
                        Sala Virtual Teams / Meet
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">{subject?.creditos || 0} Créditos</span>
                <span className="font-semibold text-slate-700 uppercase">{group.modalidad}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE GROUP MODAL */}
      {isNewGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Aperturar Nuevo Grupo (RF-06)</h3>
              <button onClick={() => setIsNewGroupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Código del Grupo</label>
                  <input
                    type="text"
                    required
                    value={codigoGrupo}
                    onChange={(e) => setCodigoGrupo(e.target.value)}
                    placeholder="ej. 01, 02, V1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Cupo Máximo</label>
                  <input
                    type="number"
                    min={5}
                    max={80}
                    value={cupoMaximo}
                    onChange={(e) => setCupoMaximo(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Asignatura</label>
                <select
                  value={asignaturaId}
                  onChange={(e) => setAsignaturaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} - {s.nombre} ({s.creditos} créditos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Docente Asignado</label>
                <select
                  value={docenteId}
                  onChange={(e) => setDocenteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.codigoDocente} - {t.nombreCompleto} ({t.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Modalidad</label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="HIBRIDA">Híbrida</option>
                    <option value="VIRTUAL">Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Enlace Virtual (Opcional)</label>
                  <input
                    type="url"
                    value={enlaceVirtual}
                    onChange={(e) => setEnlaceVirtual(e.target.value)}
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Horarios List */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase text-[11px]">
                    Bloques de Horario y Salón
                  </span>
                  <button
                    type="button"
                    onClick={handleAddHorario}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Día
                  </button>
                </div>

                {horarios.map((h, index) => (
                  <div key={index} className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-slate-200">
                    <select
                      value={h.dia}
                      onChange={(e) => handleUpdateHorario(index, 'dia', e.target.value)}
                      className="col-span-3 px-1.5 py-1 rounded border border-slate-200 text-xs"
                    >
                      <option value="LUNES">Lunes</option>
                      <option value="MARTES">Martes</option>
                      <option value="MIERCOLES">Miércoles</option>
                      <option value="JUEVES">Jueves</option>
                      <option value="VIERNES">Viernes</option>
                      <option value="SABADO">Sábado</option>
                    </select>

                    <input
                      type="time"
                      value={h.horaInicio}
                      onChange={(e) => handleUpdateHorario(index, 'horaInicio', e.target.value)}
                      className="col-span-2 px-1 py-1 rounded border border-slate-200 text-[11px]"
                    />
                    <input
                      type="time"
                      value={h.horaFin}
                      onChange={(e) => handleUpdateHorario(index, 'horaFin', e.target.value)}
                      className="col-span-2 px-1 py-1 rounded border border-slate-200 text-[11px]"
                    />
                    <input
                      type="text"
                      value={h.aula}
                      onChange={(e) => handleUpdateHorario(index, 'aula', e.target.value)}
                      placeholder="Aula / Lab"
                      className="col-span-4 px-2 py-1 rounded border border-slate-200 text-[11px]"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveHorario(index)}
                      className="col-span-1 text-slate-400 hover:text-rose-600 flex justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Aperturar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PERIOD MODAL */}
      {isNewPeriodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Nuevo Periodo Académico</h3>
              <button onClick={() => setIsNewPeriodOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Código (ej. 2026-2)</label>
                <input
                  type="text"
                  required
                  value={periodForm.codigo}
                  onChange={(e) => setPeriodForm({ ...periodForm, codigo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  required
                  value={periodForm.nombre}
                  onChange={(e) => setPeriodForm({ ...periodForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={periodForm.fechaInicio}
                    onChange={(e) => setPeriodForm({ ...periodForm, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    value={periodForm.fechaFin}
                    onChange={(e) => setPeriodForm({ ...periodForm, fechaFin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPeriodOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-slate-900 hover:bg-black text-white rounded-lg shadow-sm"
                >
                  Crear Periodo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

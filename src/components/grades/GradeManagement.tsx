import React, { useState } from 'react';
import { 
  Award, CheckCircle2, AlertCircle, Save, 
  Send, Users, BookOpen, Download, HelpCircle, ShieldCheck 
} from 'lucide-react';
import { User, AcademicGroup, Student, Subject, GradeRecord, GradeItem } from '../../types';
import { 
  groupPeriodService, academicService, teacherService, 
  studentService, enrollmentService, gradeService, reportService 
} from '../../services';

interface GradeManagementProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const GradeManagement: React.FC<GradeManagementProps> = ({ currentUser, onNotify }) => {
  const activePeriod = groupPeriodService.getActivePeriod();
  const allGroups = groupPeriodService.getGroups(activePeriod?.id);

  // If user is DOCENTE, only show groups assigned to their teacher ID
  const isTeacher = currentUser.rol === 'DOCENTE';
  const myGroups = isTeacher
    ? allGroups.filter(g => g.docenteId === currentUser.referenciaId)
    : allGroups;

  const [selectedGroupId, setSelectedGroupId] = useState<string>(myGroups[0]?.id || '');
  const [gradesDraft, setGradesDraft] = useState<Record<string, GradeItem[]>>({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());

  const currentGroup = allGroups.find(g => g.id === selectedGroupId);
  const subject = currentGroup ? academicService.getSubjects().find(s => s.id === currentGroup.asignaturaId) : null;
  const teacher = currentGroup ? teacherService.getAll().find(t => t.id === currentGroup.docenteId) : null;

  // Enrollments in this group
  const enrollments = currentGroup ? enrollmentService.getEnrollmentsByGroup(currentGroup.id).filter(e => e.estado === 'MATRICULADA') : [];
  const students = studentService.getAll();

  // Get or initialize grade draft for a matricula
  const getEvaluaciones = (matriculaId: string, studentId: string): GradeItem[] => {
    if (gradesDraft[matriculaId]) {
      return gradesDraft[matriculaId];
    }
    const existing = gradeService.getGradeByEnrollment(matriculaId);
    if (existing && existing.evaluaciones && existing.evaluaciones.length > 0) {
      return existing.evaluaciones;
    }
    return [
      { nombre: 'Corte 1 (30%)', porcentaje: 30, calificacion: null },
      { nombre: 'Corte 2 (30%)', porcentaje: 30, calificacion: null },
      { nombre: 'Examen Final (40%)', porcentaje: 40, calificacion: null },
    ];
  };

  const handleGradeChange = (matriculaId: string, evalIndex: number, valueStr: string) => {
    const num = valueStr === '' ? null : parseFloat(valueStr);
    if (num !== null && (num < 0 || num > 5.0)) {
      onNotify('warning', 'Rango Inválido', 'Las calificaciones deben estar comprendidas entre 0.0 y 5.0');
      return;
    }

    const currentEvals = [...getEvaluaciones(matriculaId, '')];
    currentEvals[evalIndex] = { ...currentEvals[evalIndex], calificacion: num };

    setGradesDraft({
      ...gradesDraft,
      [matriculaId]: currentEvals,
    });

    setDirtyRows(prev => new Set(prev).add(matriculaId));
  };

  const calculateDefinitiva = (items: GradeItem[]): number => {
    let sum = 0;
    for (const item of items) {
      if (item.calificacion !== null && item.calificacion !== undefined) {
        sum += item.calificacion * (item.porcentaje / 100);
      }
    }
    return Math.round(sum * 10) / 10;
  };

  const handleSaveGrades = (matriculaId: string, publicar: boolean = true) => {
    try {
      const existingGrade = gradeService.getGradeByEnrollment(matriculaId);
      if (!existingGrade) {
        onNotify('error', 'Error', 'Registro de calificación no encontrado.');
        return;
      }

      const evals = getEvaluaciones(matriculaId, '');
      gradeService.updateGrades(existingGrade.id, evals, currentUser, publicar);

      setDirtyRows(prev => {
        const next = new Set(prev);
        next.delete(matriculaId);
        return next;
      });

      onNotify('success', 'Calificaciones Guardadas', `Notas registradas exitosamente y publicadas al estudiante.`);
    } catch (err: any) {
      onNotify('error', 'Error de Validación', err.message);
    }
  };

  const handleSaveAllDirty = () => {
    let count = 0;
    dirtyRows.forEach(matId => {
      try {
        const existingGrade = gradeService.getGradeByEnrollment(matId);
        if (existingGrade) {
          const evals = getEvaluaciones(matId, '');
          gradeService.updateGrades(existingGrade.id, evals, currentUser, true);
          count++;
        }
      } catch (err) {
        console.error(err);
      }
    });

    setDirtyRows(new Set());
    onNotify('success', 'Libro de Calificaciones Actualizado', `Se guardaron las calificaciones de ${count} estudiantes.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Registro y Planilla de Calificaciones
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              RF-08
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Captura de notas por cortes parciales (30%, 30%, 40%), ponderación institucional automática y publicación de definitivas.
          </p>
        </div>

        {dirtyRows.size > 0 && (
          <button
            onClick={handleSaveAllDirty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer animate-pulse"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Cambios ({dirtyRows.size})</span>
          </button>
        )}
      </div>

      {/* Group Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Seleccionar Grupo a Calificar
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-0.5 text-xs sm:text-sm py-1.5 px-3 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50"
            >
              {myGroups.map(g => {
                const s = academicService.getSubjects().find(subj => subj.id === g.asignaturaId);
                return (
                  <option key={g.id} value={g.id}>
                    Grupo {g.codigoGrupo} • {s?.codigo} - {s?.nombre}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {currentGroup && (
          <div className="flex items-center gap-4 text-xs text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Docente</span>
              <span className="font-bold text-slate-800">{teacher?.nombreCompleto || 'Sin Asignar'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Inscritos</span>
              <span className="font-bold text-indigo-700">{enrollments.length} Estudiantes</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Créditos</span>
              <span className="font-bold text-slate-800">{subject?.creditos}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3 text-center w-28">Corte 1 (30%)</th>
                <th className="px-4 py-3 text-center w-28">Corte 2 (30%)</th>
                <th className="px-4 py-3 text-center w-28">Examen Final (40%)</th>
                <th className="px-4 py-3 text-center w-24">Definitiva</th>
                <th className="px-4 py-3 text-center w-28">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No hay estudiantes matriculados en este grupo.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => {
                  const student = students.find(s => s.id === enr.estudianteId);
                  const evals = getEvaluaciones(enr.id, enr.estudianteId);
                  const def = calculateDefinitiva(evals);
                  const isAprobado = def >= 3.0;
                  const isDirty = dirtyRows.has(enr.id);

                  return (
                    <tr key={enr.id} className={`hover:bg-slate-50/80 transition-colors ${isDirty ? 'bg-amber-50/40' : ''}`}>
                      
                      {/* Student Info */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {student?.primerNombre} {student?.primerApellido}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student?.codigoEstudiantil} • CC {student?.numeroDocumento}
                        </div>
                      </td>

                      {/* Corte 1 */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="5.0"
                          value={evals[0]?.calificacion ?? ''}
                          onChange={(e) => handleGradeChange(enr.id, 0, e.target.value)}
                          placeholder="0.0"
                          className="w-20 px-2.5 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        />
                      </td>

                      {/* Corte 2 */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="5.0"
                          value={evals[1]?.calificacion ?? ''}
                          onChange={(e) => handleGradeChange(enr.id, 1, e.target.value)}
                          placeholder="0.0"
                          className="w-20 px-2.5 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        />
                      </td>

                      {/* Examen Final */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="5.0"
                          value={evals[2]?.calificacion ?? ''}
                          onChange={(e) => handleGradeChange(enr.id, 2, e.target.value)}
                          placeholder="0.0"
                          className="w-20 px-2.5 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        />
                      </td>

                      {/* Calculated Final Grade */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                          def >= 3.0 ? 'text-emerald-700 bg-emerald-50' : def > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-400'
                        }`}>
                          {def.toFixed(1)}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          def >= 3.0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : def > 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {def >= 3.0 ? 'APROBADA' : def > 0 ? 'REPROBADA' : 'EN CURSO'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSaveGrades(enr.id, true)}
                          disabled={!isDirty}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto ${
                            isDirty 
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isDirty ? 'Guardar' : 'Al Día'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escala institucional: 0.0 a 5.0 (Aprobación mínima: 3.0). Cambios auditados bajo RF-12.</span>
          </div>
          <div className="font-semibold text-slate-700">
            Ponderación: Corte 1 (30%) + Corte 2 (30%) + Examen Final (40%) = 100%
          </div>
        </div>
      </div>

    </div>
  );
};

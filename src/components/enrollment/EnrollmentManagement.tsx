import React, { useState } from 'react';
import { 
  ClipboardCheck, Users, Search, Plus, CheckCircle2, 
  AlertCircle, Clock, Trash2, ShieldAlert, Sparkles, User, BookOpen 
} from 'lucide-react';
import { Student, AcademicGroup, Subject, Teacher, Enrollment } from '../../types';
import { 
  studentService, groupPeriodService, academicService, 
  teacherService, enrollmentService 
} from '../../services';

interface EnrollmentManagementProps {
  currentUser: any;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({ currentUser, onNotify }) => {
  const activePeriod = groupPeriodService.getActivePeriod();
  const students = studentService.getAll();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchStudentText, setSearchStudentText] = useState('');
  
  // Available groups in period
  const groups = groupPeriodService.getGroups(activePeriod?.id);
  const subjects = academicService.getSubjects();
  const teachers = teacherService.getAll();

  // Reload trigger
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentEnrollments = enrollmentService
    .getEnrollmentsByStudent(selectedStudentId)
    .filter(e => e.estado === 'MATRICULADA' && e.periodoId === activePeriod?.id);

  const handleEnroll = (groupId: string) => {
    if (!selectedStudentId) {
      onNotify('warning', 'Selección Requerida', 'Seleccione primero un estudiante para realizar la matrícula.');
      return;
    }

    try {
      enrollmentService.enroll(selectedStudentId, groupId, currentUser);
      onNotify('success', 'Matrícula Exitosa', 'La asignatura fue matriculada correctamente y el cupo fue descontado.');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      onNotify('error', 'Validación de Matrícula (RF-07)', err.message);
    }
  };

  const handleCancelEnrollment = (enrollmentId: string) => {
    try {
      enrollmentService.cancelEnrollment(enrollmentId, currentUser);
      onNotify('info', 'Matrícula Cancelada', 'Se canceló la matrícula y se liberó un cupo en el grupo.');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Cancelar', err.message);
    }
  };

  const filteredStudents = students.filter(s => 
    s.codigoEstudiantil.toLowerCase().includes(searchStudentText.toLowerCase()) ||
    `${s.primerNombre} ${s.primerApellido}`.toLowerCase().includes(searchStudentText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Proceso de Matrícula Académica
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              RF-07 / RNF-07
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inscripción de estudiantes en asignaturas y grupos del periodo {activePeriod?.codigo || '2026-1'}, con control atómico de cupos y prevención de duplicados.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Periodo Activo: {activePeriod?.nombre || '2026-I'}</span>
        </div>
      </div>

      {/* Grid: Left Column (Student Selection & Current Load), Right Column (Available Groups) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Student Selector & Matriculated Courses */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Seleccionar Estudiante a Matricular
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchStudentText}
                onChange={(e) => setSearchStudentText(e.target.value)}
                placeholder="Filtrar por código o nombre..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white font-medium"
            >
              {filteredStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.codigoEstudiantil} - {s.primerNombre} {s.primerApellido} (Sem {s.semestreActual})
                </option>
              ))}
            </select>

            {selectedStudent && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800">
                    {selectedStudent.primerNombre} {selectedStudent.primerApellido}
                  </span>
                  <span className="font-mono text-indigo-700 font-bold">
                    {selectedStudent.codigoEstudiantil}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Documento: {selectedStudent.tipoDocumento} {selectedStudent.numeroDocumento}</span>
                  <span className="font-bold text-emerald-700">{selectedStudent.estado}</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Enrolled Courses */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Carga Matriculada ({studentEnrollments.length} asignaturas)
              </span>
              <span className="text-[11px] font-bold text-indigo-700">
                {studentEnrollments.reduce((acc, enr) => {
                  const s = subjects.find(sub => sub.id === enr.asignaturaId);
                  return acc + (s?.creditos || 0);
                }, 0)} Créditos Inscritos
              </span>
            </div>

            {studentEnrollments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                El estudiante no tiene asignaturas matriculadas en este periodo.
              </div>
            ) : (
              <div className="space-y-2">
                {studentEnrollments.map(enr => {
                  const subject = subjects.find(s => s.id === enr.asignaturaId);
                  const group = groups.find(g => g.id === enr.grupoId);
                  const teacher = teachers.find(t => t.id === group?.docenteId);

                  return (
                    <div 
                      key={enr.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                            {subject?.codigo} - G{group?.codigoGrupo}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {subject?.nombre}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Prof: {teacher?.nombreCompleto || 'Por designar'} • {subject?.creditos} Créditos
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancelEnrollment(enr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                        title="Cancelar Matrícula (Liberar Cupo)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right: Available Groups Catalog with Real-Time Quotas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Asignaturas y Grupos Disponibles en Oferta
            </h2>
            <span className="text-xs text-slate-500">
              {groups.length} grupos habilitados
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {groups.map(grp => {
              const subject = subjects.find(s => s.id === grp.asignaturaId);
              const teacher = teachers.find(t => t.id === grp.docenteId);
              const hasCupo = grp.cupoDisponible > 0;
              const isAlreadyEnrolled = studentEnrollments.some(e => e.asignaturaId === grp.asignaturaId);

              return (
                <div 
                  key={grp.id}
                  className={`p-4 rounded-xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                    !hasCupo 
                      ? 'border-slate-200 opacity-75' 
                      : isAlreadyEnrolled
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {subject?.codigo}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{subject?.nombre}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                        Grupo {grp.codigoGrupo}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>Docente:</strong> {teacher?.nombreCompleto || 'Por designar'}</span>
                      <span><strong>Créditos:</strong> {subject?.creditos}</span>
                      <span><strong>Modalidad:</strong> {grp.modalidad}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {grp.horarios.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {h.dia} {h.horaInicio}-{h.horaFin} ({h.aula})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quota & Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cupos Disponibles</span>
                      <span className={`text-xs font-bold ${hasCupo ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {grp.cupoDisponible} de {grp.cupoMaximo} Libres
                      </span>
                    </div>

                    {isAlreadyEnrolled ? (
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Matriculada
                      </span>
                    ) : !hasCupo ? (
                      <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        Sin Cupos
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(grp.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Matricular</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

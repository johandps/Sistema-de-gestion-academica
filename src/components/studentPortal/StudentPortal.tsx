import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Clock, Award, 
  Printer, CheckCircle2, AlertCircle, FileText, Calendar, Sparkles, UserCheck,
  Download, X, ShieldCheck
} from 'lucide-react';
import { User, Student } from '../../types';
import { 
  studentService, gradeService, groupPeriodService, 
  academicService, teacherService 
} from '../../services';
import { 
  printViaHiddenIframe, downloadHtmlDocument, generateStudentCertificateHtml, 
  triggerGlobalPrint 
} from '../../utils/printHelper';

interface StudentPortalProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser, onNotify }) => {
  const activePeriod = groupPeriodService.getActivePeriod();
  const students = studentService.getAll();

  // If current user is ESTUDIANTE, find their student entity
  const isStudentRole = currentUser.rol === 'ESTUDIANTE';
  const defaultStudent = isStudentRole 
    ? students.find(s => s.id === currentUser.referenciaId || s.emailInstitucional === currentUser.email)
    : students[0];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudent?.id || students[0]?.id || '');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const activeStudent = students.find(s => s.id === selectedStudentId);

  const programs = academicService.getPrograms();
  const studentProgram = activeStudent ? programs.find(p => p.id === activeStudent.programaId) : null;

  // Grade records & enrolled subjects
  const studentResults = activeStudent ? gradeService.getGradesByStudent(activeStudent.id) : [];

  // Calculate semester GPA from published grades
  const gradedCourses = studentResults.filter(r => r.grade && r.grade.notaDefinitiva > 0);
  const promedioPeriodo = gradedCourses.length > 0
    ? Math.round((gradedCourses.reduce((acc, curr) => acc + curr.grade.notaDefinitiva, 0) / gradedCourses.length) * 10) / 10
    : 0.0;

  const totalCreditosPeriodo = studentResults.reduce((acc, curr) => acc + (curr.subject?.creditos || 0), 0);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleExecutePrint = () => {
    if (!activeStudent) return;
    const html = generateStudentCertificateHtml({
      student: activeStudent,
      program: studentProgram,
      period: activePeriod,
      results: studentResults,
      promedioPeriodo,
      totalCreditos: totalCreditosPeriodo,
    });
    printViaHiddenIframe(`Boletin_${activeStudent.codigoEstudiantil}`, html);
  };

  const handleDownloadCopy = () => {
    if (!activeStudent) return;
    const html = generateStudentCertificateHtml({
      student: activeStudent,
      program: studentProgram,
      period: activePeriod,
      results: studentResults,
      promedioPeriodo,
      totalCreditos: totalCreditosPeriodo,
    });
    downloadHtmlDocument(`Boletin_Oficial_${activeStudent.codigoEstudiantil}`, `Boletín Oficial - ${activeStudent.codigoEstudiantil}`, html);
    onNotify('success', 'Documento Generado', 'Se descargó el boletín oficial imprimible en HTML/PDF.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal del Estudiante & Consulta de Resultados
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              RF-09 / RNF-11
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta de asignaturas matriculadas, horarios de clase, cortes evaluativos y boletín oficial de calificaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* If viewing as Admin or Coordinator, allow selecting any student */}
          {!isStudentRole && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Ver como:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 font-bold bg-white text-slate-800"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.codigoEstudiantil} - {s.primerNombre} {s.primerApellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => triggerGlobalPrint(`Boletin_${activeStudent?.codigoEstudiantil || 'Estudiante'}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Imprimir directamente con window.print() y estilos institucionales"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Imprimir Boletín</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer"
            title="Abrir vista previa del documento oficial y exportación PDF"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Vista Previa</span>
          </button>
        </div>
      </div>

      {/* Official Print Header (Only visible on window.print) */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">UNIVERSIDAD NACIONAL DE INNOVACIÓN & TECNOLOGÍA</h2>
            <p className="text-xs font-bold text-slate-700 uppercase">Sistema Institucional de Gestión Académica (SIGA)</p>
            <p className="text-xs text-slate-600">Boletín Oficial de Calificaciones y Horario Académico</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Periodo: {activePeriod?.nombre || '2026-I'}</p>
            <p>Fecha de emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {activeStudent && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs border border-slate-300 p-3 rounded">
            <div><strong>Estudiante:</strong> {activeStudent.primerNombre} {activeStudent.primerApellido}</div>
            <div><strong>Código:</strong> {activeStudent.codigoEstudiantil}</div>
            <div><strong>Documento:</strong> {activeStudent.tipoDocumento} {activeStudent.numeroDocumento}</div>
            <div><strong>Programa:</strong> {studentProgram?.nombre}</div>
          </div>
        )}
      </div>

      {/* Student Profile & GPA Card */}
      {activeStudent && (
        <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white p-6 rounded-2xl shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center font-extrabold text-2xl shadow-inner border border-white/20">
                {activeStudent.primerNombre.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-sky-500/30 text-sky-200 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                    {activeStudent.codigoEstudiantil}
                  </span>
                  <span className="text-[11px] font-bold text-sky-300">
                    Semestre {activeStudent.semestreActual}
                  </span>
                </div>
                <h2 className="text-xl font-black mt-1 tracking-tight">
                  {activeStudent.primerNombre} {activeStudent.segundoNombre || ''} {activeStudent.primerApellido} {activeStudent.segundoApellido || ''}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{studentProgram?.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-sky-200 block font-bold">
                  Promedio Periodo
                </span>
                <span className="text-3xl font-black text-white">
                  {promedioPeriodo > 0 ? promedioPeriodo.toFixed(1) : 'S.C.'}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-sky-200 block font-bold">
                  Créditos Inscritos
                </span>
                <span className="text-3xl font-black text-sky-300">
                  {totalCreditosPeriodo}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-sky-200 block font-bold">
                  Asignaturas
                </span>
                <span className="text-3xl font-black text-emerald-300">
                  {studentResults.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses & Detailed Grades Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Asignaturas Matriculadas y Calificaciones Publicadas</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Periodo Académico: {activePeriod?.codigo || '2026-1'}
          </span>
        </div>

        {studentResults.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No tienes asignaturas matriculadas actualmente en este periodo.
          </div>
        ) : (
          <div className="space-y-4">
            {studentResults.map(({ grade, enrollment, subject, group, teacher }) => {
              const def = grade?.notaDefinitiva || 0;
              const isAprobada = def >= 3.0;

              return (
                <div 
                  key={enrollment.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                >
                  {/* Subject Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {subject?.codigo} - Grupo {group?.codigoGrupo}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{subject?.nombre}</h4>
                        <span className="text-xs text-slate-500 font-medium">({subject?.creditos} Créditos)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Docente: <strong>{teacher?.nombreCompleto || 'Por designar'}</strong> • Modalidad: {group?.modalidad}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Nota Definitiva</span>
                        <span className={`text-xl font-black font-mono ${
                          def >= 3.0 ? 'text-emerald-700' : def > 0 ? 'text-rose-700' : 'text-slate-400'
                        }`}>
                          {def > 0 ? def.toFixed(1) : 'S.C.'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        def >= 3.0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : def > 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {def >= 3.0 ? 'APROBADA' : def > 0 ? 'REPROBADA' : 'EN CURSO'}
                      </span>
                    </div>
                  </div>

                  {/* Cuts Breakdown Table */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {grade.evaluaciones.map((ev, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">{ev.nombre}</span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {ev.porcentaje}%
                              </span>
                            </div>
                            {ev.observaciones && (
                              <p className="text-[11px] text-slate-500 mt-1 italic leading-tight">
                                "{ev.observaciones}"
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/80 flex justify-between items-baseline">
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Calificación</span>
                            <span className="text-base font-black font-mono text-slate-900">
                              {ev.calificacion !== null ? ev.calificacion.toFixed(1) : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Class Schedule Badges */}
                    {group && group.horarios && group.horarios.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-slate-500 text-[11px] uppercase">Horarios de Clase:</span>
                        {group.horarios.map((h, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {h.dia} {h.horaInicio}-{h.horaFin} ({h.aula})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Signatures Block for Student Transcript (Visible ONLY during window.print()) */}
      <div className="hidden print-only signatures-print-block">
        <div className="signature-box">
          <strong>Ing. Mauricio Bermúdez</strong><br />
          Coordinación de Registro y Control Académico<br />
          Firma Digitalizada Certificada
        </div>
        <div className="signature-box">
          <strong>Dra. Sofía Alarcón Rivera</strong><br />
          Secretaría General y Rectoría<br />
          UNITEC - Sede Central
        </div>
      </div>

      {/* Security Footer (Visible ONLY during window.print()) */}
      <div className="hidden print-only print-footer-audit">
        <div>Certificación Oficial emitida a través de SIGA Enterprise v2.5.</div>
        <div className="font-mono">Hash Verificador: SIGA-EST-{activeStudent?.codigoEstudiantil}-{Date.now().toString().slice(-6)}</div>
      </div>

      {/* OFFICIAL PRINT PREVIEW & EXPORT MODAL */}
      {isPrintModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-6 flex flex-col max-h-[92vh]">
            
            {/* Modal Control Bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 rounded-t-2xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Vista Previa de Impresión Oficial • Boletín de Calificaciones
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Descargar copia digital HTML / PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descargar Archivo</span>
                </button>
                <button
                  onClick={handleExecutePrint}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Abrir diálogo de impresión nativa"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Sheet Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/80">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-slate-300 max-w-2xl mx-auto text-xs text-slate-900 font-sans space-y-4">
                
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-slate-950">
                      Universidad Nacional de Innovación & Tecnología
                    </h2>
                    <p className="text-[10px] font-bold text-slate-600 uppercase">
                      División de Registro, Admisiones y Control Académico
                    </p>
                    <p className="text-xs font-extrabold text-indigo-800 mt-1">
                      Boletín Oficial de Calificaciones y Horario Académico
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded text-right font-mono text-[10px]">
                    <span className="font-bold text-slate-800 block">FOLIO-{activeStudent.codigoEstudiantil}</span>
                    <span className="text-[9px] text-slate-500">VAL-CERT-2026</span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-[11px]">
                  <div><strong>Estudiante:</strong> {activeStudent.primerNombre} {activeStudent.primerApellido}</div>
                  <div><strong>Código:</strong> <span className="font-mono font-bold text-indigo-700">{activeStudent.codigoEstudiantil}</span></div>
                  <div><strong>Documento:</strong> {activeStudent.tipoDocumento} {activeStudent.numeroDocumento}</div>
                  <div><strong>Programa:</strong> {studentProgram?.nombre}</div>
                  <div><strong>Periodo:</strong> {activePeriod?.nombre || '2026-I'}</div>
                  <div><strong>Semestre:</strong> Semestre {activeStudent.semestreActual} • {activeStudent.estado}</div>
                </div>

                {/* Grades Table */}
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase text-[9px] font-bold border border-slate-300">
                      <th className="p-2 border border-slate-300">Código</th>
                      <th className="p-2 border border-slate-300">Asignatura</th>
                      <th className="p-2 text-center border border-slate-300">Créditos</th>
                      <th className="p-2 text-center border border-slate-300">C1 (30%)</th>
                      <th className="p-2 text-center border border-slate-300">C2 (30%)</th>
                      <th className="p-2 text-center border border-slate-300">Final (40%)</th>
                      <th className="p-2 text-center border border-slate-300">Definitiva</th>
                      <th className="p-2 text-center border border-slate-300">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">Sin materias matriculadas</td>
                      </tr>
                    ) : (
                      studentResults.map(({ grade, subject, teacher }) => {
                        const def = grade?.notaDefinitiva || 0;
                        const isAprob = def >= 3.0;
                        return (
                          <tr key={grade.id} className="border border-slate-300">
                            <td className="p-2 font-mono font-bold border border-slate-300">{subject?.codigo}</td>
                            <td className="p-2 border border-slate-300">
                              <strong>{subject?.nombre}</strong>
                              <div className="text-[9px] text-slate-500">Prof: {teacher?.nombreCompleto || 'Por designar'}</div>
                            </td>
                            <td className="p-2 text-center font-bold border border-slate-300">{subject?.creditos}</td>
                            <td className="p-2 text-center font-mono border border-slate-300">{grade.evaluaciones?.[0]?.calificacion ?? '-'}</td>
                            <td className="p-2 text-center font-mono border border-slate-300">{grade.evaluaciones?.[1]?.calificacion ?? '-'}</td>
                            <td className="p-2 text-center font-mono border border-slate-300">{grade.evaluaciones?.[2]?.calificacion ?? '-'}</td>
                            <td className="p-2 text-center font-mono font-black border border-slate-300 text-xs">
                              {def > 0 ? def.toFixed(1) : '-'}
                            </td>
                            <td className="p-2 text-center font-bold border border-slate-300">
                              <span className={isAprob ? 'text-emerald-700' : def > 0 ? 'text-rose-700' : 'text-slate-500'}>
                                {isAprob ? 'APROBADA' : def > 0 ? 'REPROBADA' : 'EN CURSO'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Summary Totals */}
                <div className="flex justify-end gap-5 pt-2 border-t border-slate-200 text-right">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Créditos Inscritos</span>
                    <span className="text-sm font-bold text-slate-900">{totalCreditosPeriodo} Créditos</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Promedio del Periodo</span>
                    <span className="text-sm font-black text-indigo-700">{promedioPeriodo > 0 ? promedioPeriodo.toFixed(2) : 'S.C.'}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 px-4 text-center text-[10px]">
                  <div className="border-t border-slate-900 pt-1">
                    <strong>Ing. Mauricio Bermúdez</strong><br />
                    Coordinación de Registro y Control Académico
                  </div>
                  <div className="border-t border-slate-900 pt-1">
                    <strong>Dra. Sofía Alarcón Rivera</strong><br />
                    Secretaría General y Rectoría
                  </div>
                </div>

                {/* Footer validation */}
                <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Expedido: {new Date().toLocaleDateString()}</span>
                  <span>Verificación Digital: SIGA-{activeStudent.codigoEstudiantil}-{Date.now().toString().slice(-6)}</span>
                </div>

              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="bg-white px-5 py-3 rounded-b-2xl border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                Documento oficial válido para trámites institucionales y de posgrado.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleExecutePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

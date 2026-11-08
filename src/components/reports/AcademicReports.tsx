import React, { useState } from 'react';
import { 
  FileText, Download, Filter, BarChart3, 
  TrendingUp, Users, BookOpen, Award, CheckCircle2, AlertCircle, Printer, X 
} from 'lucide-react';
import { groupPeriodService, academicService, reportService } from '../../services';
import { printViaHiddenIframe, downloadHtmlDocument, generateAcademicReportHtml, triggerGlobalPrint } from '../../utils/printHelper';

export const AcademicReports: React.FC = () => {
  const periods = groupPeriodService.getPeriods();
  const activePeriod = groupPeriodService.getActivePeriod() || periods[0];
  const programs = academicService.getPrograms();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(activePeriod?.id || '');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('TODOS');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const summary = reportService.generateAcademicSummary(selectedPeriodId, selectedProgramId);

  const handleDownloadCSV = () => {
    if (!summary.grupos || summary.grupos.length === 0) return;
    const csvContent = reportService.exportReportCSV(summary.grupos);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_academico_${summary.periodo.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tasaAprobacion = summary.totalMatriculados > 0
    ? Math.round((summary.aprobados / summary.totalMatriculados) * 100)
    : 0;

  const handleExecutePrint = () => {
    const reportHtml = generateAcademicReportHtml({
      periodoNombre: summary.periodo,
      totalGrupos: summary.totalGrupos,
      totalMatriculados: summary.totalMatriculados,
      aprobados: summary.aprobados,
      reprobados: summary.reprobados,
      enCurso: summary.enCurso,
      promedioGeneral: summary.promedioGeneral,
      grupos: summary.grupos
    });
    printViaHiddenIframe(`Reporte_Academico_${summary.periodo}`, reportHtml);
  };

  const handleDownloadCopy = () => {
    const reportHtml = generateAcademicReportHtml({
      periodoNombre: summary.periodo,
      totalGrupos: summary.totalGrupos,
      totalMatriculados: summary.totalMatriculados,
      aprobados: summary.aprobados,
      reprobados: summary.reprobados,
      enCurso: summary.enCurso,
      promedioGeneral: summary.promedioGeneral,
      grupos: summary.grupos
    });
    downloadHtmlDocument(`reporte_academico_${summary.periodo.replace(/\s+/g, '_')}.html`, `Reporte Académico Institucional - ${summary.periodo}`, reportHtml);
  };

  return (
    <div className="space-y-6">

      {/* Official Institutional Print Header (Visible ONLY when printing via window.print()) */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              UNIVERSIDAD NACIONAL DE INNOVACIÓN & TECNOLOGÍA
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              Vicerrectoría Académica • Dirección de Planeación y Calidad Institucional
            </p>
            <p className="text-xs font-semibold text-indigo-800 mt-1">
              Informe Oficial de Rendimiento Académico y Consolidado de Matrículas (RF-10)
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold font-mono">FOLIO-REP-{summary.periodo.replace(/\s+/g, '')}</p>
            <p className="text-slate-600">Fecha de emisión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-[10px] text-slate-500 font-mono">SIGA Enterprise v2.5</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div><span className="font-bold">Periodo Evaluado:</span> {summary.periodo}</div>
          <div><span className="font-bold">Programa:</span> {selectedProgramId === 'TODOS' ? 'Todos los Programas Académicos' : (programs.find(p => p.id === selectedProgramId)?.nombre || selectedProgramId)}</div>
          <div><span className="font-bold">Total Matrículas:</span> {summary.totalMatriculados} estudiantes inscritos</div>
          <div><span className="font-bold">Tasa Aprobación:</span> {tasaAprobacion}% (Promedio General: {summary.promedioGeneral.toFixed(1)}/5.0)</div>
        </div>
      </div>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Reportes y Métricas Académicas Institucionales
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              RF-10
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consolidado de estudiantes matriculados, grupos, resultados académicos y rendimiento global por periodo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Global print trigger utilizing window.print() and CSS rules */}
          <button
            onClick={() => triggerGlobalPrint(`SIGA_Reporte_Academico_${summary.periodo}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Imprimir directamente este informe con window.print() y estilos institucionales"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Imprimir Informe</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Abrir vista previa del documento oficial y exportación PDF"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Vista Previa</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase">Periodo:</span>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="text-xs sm:text-sm py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase">Programa:</span>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="text-xs sm:text-sm py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="TODOS">Todos los Programas Académicos</option>
            {programs.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Matrículas Totales</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.totalMatriculados}</span>
            <span className="text-[11px] text-slate-500">en {summary.totalGrupos} grupos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tasa de Aprobación</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{tasaAprobacion}%</span>
            <span className="text-[11px] text-slate-500">{summary.aprobados} aprobados</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Promedio Institucional</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{summary.promedioGeneral.toFixed(1)}</span>
            <span className="text-[11px] text-slate-500">sobre 5.0</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Grupos Abiertos</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.totalGrupos}</span>
            <span className="text-[11px] text-slate-500">secciones activas</span>
          </div>
        </div>

      </div>

      {/* Detailed Groups Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Sábana de Rendimiento Académico por Asignatura y Grupo
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Filtro: {summary.periodo}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Asignatura / Código</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Docente a Cargo</th>
                <th className="px-4 py-3 text-center">Matriculados</th>
                <th className="px-4 py-3 text-center">Cupos Libres</th>
                <th className="px-4 py-3 text-center">Promedio Calificaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary.grupos.map((grp) => (
                <tr key={grp.grupoId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{grp.asignatura}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{grp.codigoAsignatura} • {grp.creditos} Créditos</div>
                  </td>

                  <td className="px-4 py-3.5 font-bold font-mono text-indigo-700">
                    Grupo {grp.codigoGrupo}
                  </td>

                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {grp.docente}
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold">
                    {grp.matriculados} / {grp.cupoMaximo}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      grp.cupoDisponible > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {grp.cupoDisponible}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="font-black font-mono text-sm text-slate-900">
                      {grp.promedioNotas > 0 ? grp.promedioNotas.toFixed(1) : 'S.C.'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Block (Visible ONLY during window.print()) */}
      <div className="hidden print-only signatures-print-block">
        <div className="signature-box">
          <strong>Dirección de Admisiones y Registro</strong><br />
          Firma y Sello de Certificación
        </div>
        <div className="signature-box">
          <strong>Decanatura Académica</strong><br />
          Validado bajo SIGA Enterprise v2.5
        </div>
      </div>

      {/* Security Footer (Visible ONLY during window.print()) */}
      <div className="hidden print-only print-footer-audit">
        <div>Documento oficial expedido por el Sistema Institucional de Gestión Académica (SIGA).</div>
        <div className="font-mono">Trazabilidad Segura: SIGA-REP-{Date.now().toString().slice(-8)}</div>
      </div>

      {/* Print Preview & Execution Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Documento Oficial: Informe de Rendimiento Académico
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vista previa de alta fidelidad para impresión y exportación digital PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecutePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={handleDownloadCopy}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                  title="Cerrar vista previa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Sheet Preview */}
            <div className="p-4 sm:p-8 bg-slate-100/80 overflow-y-auto flex-1 text-slate-900">
              <div className="max-w-[780px] mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 text-xs">
                
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                      Universidad Nacional de Innovación & Tecnología
                    </h2>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Vicerrectoría Académica • Dirección de Planeación y Calidad
                    </p>
                    <p className="text-xs font-bold text-indigo-700 mt-1">
                      Informe Oficial de Rendimiento Académico y Consolidado de Matrículas (RF-10)
                    </p>
                  </div>
                  <div className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right font-mono text-[10px]">
                    <div className="font-bold text-slate-900">FOLIO-REP-{Date.now().toString().slice(-6)}</div>
                    <div className="text-[8px] text-slate-500 font-sans uppercase">Sello de Auditoría</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 text-[11px]">
                  <div><span className="font-bold text-slate-700">Periodo Académico:</span> {summary.periodo}</div>
                  <div><span className="font-bold text-slate-700">Programa:</span> {selectedProgramId === 'TODOS' ? 'Todos los Programas' : (programs.find(p => p.id === selectedProgramId)?.nombre || selectedProgramId)}</div>
                  <div><span className="font-bold text-slate-700">Total Secciones:</span> {summary.totalGrupos} grupos</div>
                  <div><span className="font-bold text-slate-700">Total Inscripciones:</span> {summary.totalMatriculados} estudiantes</div>
                </div>

                {/* Indicators Strip */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Matrículas</span>
                    <strong className="text-sm font-extrabold text-slate-900">{summary.totalMatriculados}</strong>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-emerald-700 block">Aprobación</span>
                    <strong className="text-sm font-extrabold text-emerald-700">{tasaAprobacion}%</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Promedio</span>
                    <strong className="text-sm font-extrabold text-indigo-700">{summary.promedioGeneral.toFixed(1)} / 5.0</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Grupos</span>
                    <strong className="text-sm font-extrabold text-slate-900">{summary.totalGrupos}</strong>
                  </div>
                </div>

                {/* Table of groups */}
                <table className="w-full border-collapse text-[11px] mb-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border border-slate-300">
                      <th className="p-1.5 text-left border border-slate-300">Código</th>
                      <th className="p-1.5 text-left border border-slate-300">Asignatura</th>
                      <th className="p-1.5 text-center border border-slate-300">Grupo</th>
                      <th className="p-1.5 text-left border border-slate-300">Docente</th>
                      <th className="p-1.5 text-center border border-slate-300">Matriculados</th>
                      <th className="p-1.5 text-center border border-slate-300">Cupos</th>
                      <th className="p-1.5 text-center border border-slate-300">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.grupos.map((g) => (
                      <tr key={g.grupoId} className="border border-slate-300">
                        <td className="p-1.5 font-mono font-bold border border-slate-300">{g.codigoAsignatura}</td>
                        <td className="p-1.5 border border-slate-300 font-semibold">{g.asignatura}</td>
                        <td className="p-1.5 text-center font-bold border border-slate-300">G{g.codigoGrupo}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-700">{g.docente}</td>
                        <td className="p-1.5 text-center font-bold border border-slate-300">{g.matriculados} / {g.cupoMaximo}</td>
                        <td className="p-1.5 text-center border border-slate-300">{g.cupoDisponible}</td>
                        <td className="p-1.5 text-center font-mono font-bold border border-slate-300">{g.promedioNotas > 0 ? g.promedioNotas.toFixed(1) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 pt-4 flex justify-between px-8 text-center text-[10px] text-slate-600">
                  <div className="w-52 border-t border-slate-800 pt-1.5">
                    <strong className="text-slate-900 block">Dirección de Admisiones y Registro</strong>
                    <span>Firma y Sello de Certificación</span>
                  </div>
                  <div className="w-52 border-t border-slate-800 pt-1.5">
                    <strong className="text-slate-900 block">Decanatura Académica</strong>
                    <span>Validado bajo SIGA Enterprise v2.5</span>
                  </div>
                </div>

                {/* Footer validation */}
                <div className="mt-6 pt-2 border-t border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400">
                  <div>Documento oficial generado por el Sistema Institucional de Gestión Académica (SIGA).</div>
                  <div className="font-mono">UUID: SIGA-{Date.now().toString().slice(-8)}</div>
                </div>

              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">
                Sugerencia: En el diálogo de impresión elija <strong>Guardar como PDF</strong> o su impresora física.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleExecutePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Proceder a Imprimir</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

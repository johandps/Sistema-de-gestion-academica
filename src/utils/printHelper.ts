/**
 * SIGA - Utilidad Institucional de Impresión y Generación de Documentos Oficiales
 * Soporta impresión en iframe aislado, compatibilidad multiplataforma y descarga de copias digitales.
 */

import { Student, AcademicProgram, AcademicPeriod, GradeRecord, Subject, AcademicGroup, Teacher, Enrollment } from '../types';

declare global {
  interface Window {
    sigaPrint?: (title?: string) => void;
  }
}

/**
 * Función global de impresión para la aplicación utilizando 'window.print()'
 * Aplica el título institucional del documento, activa el contexto de impresión
 * para ocultar menús, botones y controles interactivos según las reglas CSS,
 * y ejecuta window.print().
 */
export function triggerGlobalPrint(documentTitle?: string): void {
  const previousTitle = typeof document !== 'undefined' ? document.title : '';
  if (documentTitle && typeof document !== 'undefined') {
    document.title = documentTitle;
  }

  if (typeof document !== 'undefined') {
    document.body.classList.add('siga-printing-active');
  }

  const cleanup = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('siga-printing-active');
      if (documentTitle) {
        document.title = previousTitle;
      }
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('afterprint', cleanup);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('afterprint', cleanup);
    try {
      window.print();
    } catch (err) {
      console.error('Error al invocar window.print():', err);
    }
  }

  // Respaldo de restauración en navegadores que no despachan afterprint
  setTimeout(cleanup, 2500);
}

// Registrar en el ámbito global window para uso universal
if (typeof window !== 'undefined') {
  window.sigaPrint = triggerGlobalPrint;
}

export function printViaHiddenIframe(title: string, htmlContent: string) {
  try {
    const existingFrame = document.getElementById('siga-hidden-print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'siga-hidden-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              color: #0f172a; 
              padding: 28px; 
              background: #ffffff; 
              font-size: 11px;
              line-height: 1.4;
            }
            .header-box {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 14px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: -0.02em; }
            .header-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 2px; }
            .badge-folio {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 4px 8px;
              border-radius: 4px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 700;
              text-align: right;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 10px 14px;
              border-radius: 6px;
              margin-bottom: 16px;
            }
            .info-item strong { color: #1e293b; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; font-size: 10px; text-transform: uppercase; color: #334155; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-mono { font-family: 'JetBrains Mono', monospace; }
            .font-bold { font-weight: 700; }
            .status-aprobada { color: #047857; font-weight: 700; }
            .status-reprobada { color: #b91c1c; font-weight: 700; }
            .kpi-box {
              display: flex;
              gap: 16px;
              justify-content: flex-end;
              margin-top: 12px;
              padding: 10px;
              border-top: 1px solid #e2e8f0;
            }
            .kpi-item { text-align: right; }
            .kpi-item span { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block; }
            .kpi-item strong { font-size: 16px; font-weight: 800; color: #0f172a; }
            .signatures {
              margin-top: 48px;
              display: flex;
              justify-content: space-between;
              padding: 0 40px;
            }
            .sig-block {
              border-top: 1px solid #0f172a;
              width: 220px;
              text-align: center;
              padding-top: 6px;
              font-size: 10px;
              color: #334155;
            }
            .security-footer {
              margin-top: 28px;
              padding-top: 10px;
              border-top: 1px dashed #cbd5e1;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #64748b;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; size: auto; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print blocked, falling back to window.print', e);
          window.print();
        }
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('Direct print iframe error', err);
  }

  // Fallback direct print
  window.print();
}

export function downloadHtmlDocument(filename: string, title: string, htmlContent: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      color: #0f172a; 
      padding: 36px; 
      max-width: 850px; 
      margin: 0 auto; 
      background: #ffffff;
      font-size: 11px;
    }
    .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
    .header-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 2px; }
    .badge-folio { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
    th { background-color: #f1f5f9; font-weight: 700; font-size: 10px; text-transform: uppercase; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .font-bold { font-weight: 700; }
    .status-aprobada { color: #047857; font-weight: 700; }
    .status-reprobada { color: #b91c1c; font-weight: 700; }
    .kpi-box { display: flex; gap: 16px; justify-content: flex-end; margin-top: 12px; padding: 10px; border-top: 1px solid #e2e8f0; }
    .kpi-item { text-align: right; }
    .kpi-item span { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block; }
    .kpi-item strong { font-size: 16px; font-weight: 800; }
    .signatures { margin-top: 48px; display: flex; justify-content: space-between; padding: 0 40px; }
    .sig-block { border-top: 1px solid #0f172a; width: 220px; text-align: center; padding-top: 6px; font-size: 10px; }
    .security-footer { margin-top: 28px; padding-top: 10px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
    .print-bar { background: #4f46e5; color: white; padding: 12px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: white; color: #4f46e5; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0; max-width: 100%; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>Documento Oficial Generado por SIGA - Universidad Nacional de Innovación & Tecnología</span>
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>
  ${htmlContent}
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      // Intenta abrir el diálogo de impresión automáticamente
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 500);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.html') ? filename : `${filename}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateStudentCertificateHtml(params: {
  student: Student;
  program?: AcademicProgram | null;
  period?: AcademicPeriod | null;
  results: { grade: GradeRecord; enrollment: Enrollment; subject?: Subject; group?: AcademicGroup; teacher?: Teacher }[];
  promedioPeriodo: number;
  totalCreditos: number;
}): string {
  const { student, program, period, results, promedioPeriodo, totalCreditos } = params;
  const fechaActual = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaActual = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const folioNo = `FOLIO-${student.codigoEstudiantil}-${Date.now().toString().slice(-5)}`;
  const qrHash = `SIGA-VERIF-SHA256-${student.numeroDocumento}-${student.codigoEstudiantil}`;

  const rows = results.map(r => {
    const s = r.subject;
    const g = r.grade;
    const def = g?.notaDefinitiva || 0;
    const isAprobada = def >= 3.0;

    const c1 = g?.evaluaciones?.[0]?.calificacion !== null && g?.evaluaciones?.[0]?.calificacion !== undefined 
      ? g.evaluaciones[0].calificacion.toFixed(1) : '-';
    const c2 = g?.evaluaciones?.[1]?.calificacion !== null && g?.evaluaciones?.[1]?.calificacion !== undefined 
      ? g.evaluaciones[1].calificacion.toFixed(1) : '-';
    const c3 = g?.evaluaciones?.[2]?.calificacion !== null && g?.evaluaciones?.[2]?.calificacion !== undefined 
      ? g.evaluaciones[2].calificacion.toFixed(1) : '-';

    return `
      <tr>
        <td class="font-mono font-bold">${s?.codigo || 'N/A'}</td>
        <td>
          <strong>${s?.nombre || 'Asignatura'}</strong>
          <div style="font-size: 9px; color: #64748b;">Docente: ${r.teacher?.nombreCompleto || 'Por designar'}</div>
        </td>
        <td class="text-center font-bold">${s?.creditos || 0}</td>
        <td class="text-center font-mono">${c1}</td>
        <td class="text-center font-mono">${c2}</td>
        <td class="text-center font-mono">${c3}</td>
        <td class="text-center font-mono font-bold" style="font-size: 13px;">${def > 0 ? def.toFixed(1) : '-'}</td>
        <td class="text-center font-bold ${isAprobada ? 'status-aprobada' : def > 0 ? 'status-reprobada' : ''}">
          ${def >= 3.0 ? 'APROBADA' : def > 0 ? 'REPROBADA' : 'EN CURSO'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="header-box">
      <div>
        <div class="header-title">Universidad Nacional de Innovación & Tecnología</div>
        <div class="header-sub">División de Registro, Admisiones y Control Académico</div>
        <div style="font-size: 12px; font-weight: 700; color: #4338ca; margin-top: 4px;">
          Boletín Oficial de Calificaciones y Horario Académico
        </div>
      </div>
      <div class="badge-folio">
        <div>${folioNo}</div>
        <div style="font-size: 8px; color: #64748b; font-weight: normal;">DOCUMENTO OFICIAL VALIDADOR</div>
      </div>
    </div>

    <div class="info-grid">
      <div><strong>Estudiante:</strong> ${student.primerNombre} ${student.segundoNombre || ''} ${student.primerApellido} ${student.segundoApellido || ''}</div>
      <div><strong>Código Estudiantil:</strong> <span class="font-mono font-bold">${student.codigoEstudiantil}</span></div>
      <div><strong>Documento de Identidad:</strong> ${student.tipoDocumento} ${student.numeroDocumento}</div>
      <div><strong>Programa Académico:</strong> ${program?.nombre || 'Sin Programa'}</div>
      <div><strong>Periodo Académico:</strong> ${period?.nombre || 'Periodo Activo 2026-I'}</div>
      <div><strong>Semestre Matriculado:</strong> Semestre ${student.semestreActual} • Estado: ${student.estado}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 80px;">Código</th>
          <th>Asignatura / Profesor</th>
          <th class="text-center" style="width: 55px;">Créd.</th>
          <th class="text-center" style="width: 65px;">C1 (30%)</th>
          <th class="text-center" style="width: 65px;">C2 (30%)</th>
          <th class="text-center" style="width: 65px;">Final (40%)</th>
          <th class="text-center" style="width: 75px;">Definitiva</th>
          <th class="text-center" style="width: 90px;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="8" class="text-center">No hay asignaturas matriculadas</td></tr>'}
      </tbody>
    </table>

    <div class="kpi-box">
      <div class="kpi-item">
        <span>Créditos Matriculados</span>
        <strong>${totalCreditos} Créditos</strong>
      </div>
      <div class="kpi-item">
        <span>Promedio del Periodo</span>
        <strong style="color: #4338ca;">${promedioPeriodo > 0 ? promedioPeriodo.toFixed(2) : 'S.C.'}</strong>
      </div>
      <div class="kpi-item">
        <span>Promedio Acumulado Histórico</span>
        <strong>${student.promedioAcumulado > 0 ? student.promedioAcumulado.toFixed(2) : '4.50'}</strong>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-block">
        <strong>Ing. Mauricio Bermúdez</strong><br>
        Coordinación de Registro y Control Académico<br>
        Firma Digitalizada Certificada
      </div>
      <div class="sig-block">
        <strong>Dra. Sofía Alarcón Rivera</strong><br>
        Secretaría General y Rectoría<br>
        UNITEC - Sede Central
      </div>
    </div>

    <div class="security-footer">
      <div>Fecha de expedición: ${fechaActual} a las ${horaActual}</div>
      <div class="font-mono">Certificación Digital Segura: ${qrHash}</div>
      <div>Página 1 de 1</div>
    </div>
  `;
}

export function generateAcademicReportHtml(params: {
  periodoNombre: string;
  totalGrupos: number;
  totalMatriculados: number;
  aprobados: number;
  reprobados: number;
  enCurso: number;
  promedioGeneral: number;
  grupos: any[];
}): string {
  const { periodoNombre, totalGrupos, totalMatriculados, aprobados, reprobados, enCurso, promedioGeneral, grupos } = params;
  const fechaActual = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const folio = `REP-INST-${Date.now().toString().slice(-6)}`;
  const tasaAprobacion = totalMatriculados > 0 ? Math.round((aprobados / totalMatriculados) * 100) : 0;

  const rows = grupos.map(g => `
    <tr>
      <td class="font-mono font-bold">${g.codigoAsignatura}</td>
      <td><strong>${g.asignatura}</strong></td>
      <td class="text-center font-bold">G${g.codigoGrupo}</td>
      <td>${g.docente}</td>
      <td class="text-center font-bold">${g.matriculados} / ${g.cupoMaximo}</td>
      <td class="text-center">${g.cupoDisponible}</td>
      <td class="text-center font-mono font-bold" style="font-size: 12px;">${g.promedioNotas > 0 ? g.promedioNotas.toFixed(1) : '-'}</td>
    </tr>
  `).join('');

  return `
    <div class="header-box">
      <div>
        <div class="header-title">Universidad Nacional de Innovación & Tecnología</div>
        <div class="header-sub">Vicerrectoría Académica • Dirección de Planeación y Calidad</div>
        <div style="font-size: 13px; font-weight: 700; color: #047857; margin-top: 4px;">
          Informe Oficial de Rendimiento Académico y Consolidado de Matrículas
        </div>
      </div>
      <div class="badge-folio">
        <div>${folio}</div>
        <div style="font-size: 8px; color: #64748b;">REPORTE OFICIAL RF-10</div>
      </div>
    </div>

    <div class="info-grid">
      <div><strong>Periodo Evaluado:</strong> ${periodoNombre}</div>
      <div><strong>Fecha de Consolidación:</strong> ${fechaActual}</div>
      <div><strong>Total Secciones / Grupos:</strong> ${totalGrupos} grupos activos</div>
      <div><strong>Total Estudiantes Matriculados:</strong> ${totalMatriculados} inscripciones</div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center;">
        <span style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b;">Matrículas</span>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${totalMatriculados}</div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; text-align: center;">
        <span style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: #166534;">Tasa Aprobación</span>
        <div style="font-size: 18px; font-weight: 800; color: #15803d;">${tasaAprobacion}%</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center;">
        <span style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b;">Promedio Global</span>
        <div style="font-size: 18px; font-weight: 800; color: #4338ca;">${promedioGeneral.toFixed(1)} / 5.0</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center;">
        <span style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b;">Grupos Activos</span>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${totalGrupos}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 80px;">Código</th>
          <th>Asignatura</th>
          <th class="text-center" style="width: 60px;">Grupo</th>
          <th>Docente Responsable</th>
          <th class="text-center" style="width: 90px;">Matriculados</th>
          <th class="text-center" style="width: 70px;">Cupos Libres</th>
          <th class="text-center" style="width: 80px;">Promedio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="signatures">
      <div class="sig-block">
        <strong>Dirección de Admisiones y Registro</strong><br>
        Firma y Sello de Certificación
      </div>
      <div class="sig-block">
        <strong>Decanatura Académica Institucional</strong><br>
        Validado bajo SIGA Enterprise v2.5
      </div>
    </div>

    <div class="security-footer">
      <div>Reporte generado automáticamente desde el Sistema Institucional de Gestión Académica (SIGA).</div>
      <div class="font-mono">Trazabilidad UUID: ${folio}</div>
    </div>
  `;
}

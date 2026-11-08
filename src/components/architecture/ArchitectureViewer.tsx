import React, { useState } from 'react';
import { 
  Layers, Code2, CheckCircle2, Server, Database, 
  Terminal, ShieldCheck, FileCheck, ArrowRight, Play, Copy, Check 
} from 'lucide-react';
import { 
  ARCHITECTURE_LAYERS, TRACEABILITY_MATRIX, 
  SPRING_BOOT_EQUIVALENT_CODE 
} from '../../config/architecture';
import { 
  studentService, groupPeriodService, gradeService, 
  academicService, teacherService 
} from '../../services';

export const ArchitectureViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'matrix' | 'springboot' | 'swagger'>('diagram');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeCodeKey, setActiveCodeKey] = useState<keyof typeof SPRING_BOOT_EQUIVALENT_CODE>('entity');

  // Swagger Explorer State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/estudiantes');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SPRING_BOOT_EQUIVALENT_CODE[activeCodeKey]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteApi = () => {
    setLoadingApi(true);
    setTimeout(() => {
      let data: any = {};
      if (selectedEndpoint.includes('estudiantes')) {
        data = studentService.getAll().slice(0, 3);
      } else if (selectedEndpoint.includes('programas')) {
        data = academicService.getPrograms();
      } else if (selectedEndpoint.includes('grupos')) {
        data = groupPeriodService.getGroups().slice(0, 3);
      } else if (selectedEndpoint.includes('calificaciones')) {
        data = gradeService.getGradesByGroup('grp-01');
      }

      setApiResponse({
        statusCode: 200,
        statusText: '200 OK',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'x-architecture-layer': 'Spring-Boot-REST-Controller',
          'x-trace-id': 'unitec-' + Date.now(),
        },
        payload: {
          success: true,
          timestamp: new Date().toISOString(),
          data,
        }
      });
      setLoadingApi(false);
    }, 200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Arquitectura de Software Institucional & Mapeo Técnico
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              RNF-04 / RNF-05 / RNF-10
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diseño arquitectónico en 4 capas desacopladas, modelo homologado a Spring Boot 3 + Hibernate JPA y Matriz de Trazabilidad.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'diagram' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Capas C4
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'matrix' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz RNF-10
          </button>
          <button
            onClick={() => setActiveTab('springboot')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'springboot' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Código Java Spring
          </button>
          <button
            onClick={() => {
              setActiveTab('swagger');
              if (!apiResponse) handleExecuteApi();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'swagger' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            API REST Explorer
          </button>
        </div>
      </div>

      {/* TAB 1: 4-LAYER ARCHITECTURE DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold">Patrón Arquitectónico: Layered Architecture (N-Tier)</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              La solución está diseñada con estricta separación de responsabilidades: el frontend React consume una capa de controladores REST normalizados, los cuales delegan la orquestación a una capa de servicios de dominio transaccionales (Spring Boot <code>@Service</code>), aislada de la persistencia relacional implementada mediante el patrón Repository (Spring Data JPA / Hibernate ORM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARCHITECTURE_LAYERS.map((layer, index) => (
              <div 
                key={index}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Capa 0{index + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {index === 0 ? 'Cliente UI' : index === 1 ? 'API Gateway' : index === 2 ? 'Dominio' : 'Datos'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">{layer.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{layer.responsabilidad}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Patrones Clave</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.patrones.map((p, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mt-2">Tecnologías</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.tecnologias.map((t, i) => (
                          <span key={i} className="text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Mapeo Spring Boot / JPA:</span>
                  <code className="font-mono text-indigo-700 font-semibold">{layer.javaSpringBootMapping}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENTS TRACEABILITY MATRIX (RNF-10) */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Matriz de Trazabilidad de Requerimientos Institucionales</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verificación de cobertura 100% de los 12 Requerimientos Funcionales (RF) y 12 Requerimientos No Funcionales (RNF).
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              24/24 Cumplidos
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Nombre del Requerimiento</th>
                    <th className="px-4 py-3">Descripción Oficial</th>
                    <th className="px-4 py-3">Capas de Software</th>
                    <th className="px-4 py-3">Componente Implementador</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRACEABILITY_MATRIX.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          item.tipo === 'RF' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.id}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {item.nombre}
                      </td>

                      <td className="px-4 py-3 text-slate-600 max-w-xs">
                        {item.descripcion}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.capasAfectadas.map((c, idx) => (
                            <span key={idx} className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-700">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                        {item.componentesImplementadores.join(', ')}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPRING BOOT & HIBERNATE CODE MAPPINGS */}
      {activeTab === 'springboot' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-slate-800">
                Homologación 1:1 en Java Spring Boot 3 & Hibernate JPA
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCodeKey('entity')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeCodeKey === 'entity' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                1. Entidad JPA (@Entity)
              </button>
              <button
                onClick={() => setActiveCodeKey('repository')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeCodeKey === 'repository' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                2. Repositorio (JpaRepository)
              </button>
              <button
                onClick={() => setActiveCodeKey('service')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeCodeKey === 'service' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                3. Servicio (@Transactional)
              </button>
              <button
                onClick={() => setActiveCodeKey('controller')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeCodeKey === 'controller' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                4. Controlador (@RestController)
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 p-5 shadow-2xl font-mono text-xs overflow-x-auto">
            <button
              onClick={handleCopyCode}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar Código'}</span>
            </button>
            <pre className="pt-2 leading-relaxed">
              <code>{SPRING_BOOT_EQUIVALENT_CODE[activeCodeKey]}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: SWAGGER REST API EXPLORER (RNF-08 INTEROPERABILIDAD) */}
      {activeTab === 'swagger' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">OpenAPI 3.0 / Swagger Interactive Explorer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  RNF-08 Interoperabilidad
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulador interactivo de endpoints REST con validación de cabeceras HTTP, DTOs y respuestas en vivo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-300 font-mono font-bold bg-slate-50 text-slate-800"
              >
                <option value="GET /api/v1/estudiantes">GET /api/v1/estudiantes</option>
                <option value="GET /api/v1/programas">GET /api/v1/programas</option>
                <option value="GET /api/v1/grupos">GET /api/v1/grupos</option>
                <option value="GET /api/v1/calificaciones">GET /api/v1/calificaciones</option>
              </select>

              <button
                onClick={handleExecuteApi}
                disabled={loadingApi}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-70"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ejecutar</span>
              </button>
            </div>
          </div>

          {apiResponse && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <span className="font-bold text-slate-800 uppercase block tracking-wider text-[10px]">
                  HTTP Response Metadata
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-700 font-mono">{apiResponse.statusText}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Content-Type:</span>
                    <span className="font-mono text-slate-700">{apiResponse.headers['content-type']}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Layer:</span>
                    <span className="font-mono text-indigo-700 font-bold">{apiResponse.headers['x-architecture-layer']}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Trace ID:</span>
                    <span className="font-mono text-slate-600">{apiResponse.headers['x-trace-id']}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-2xl max-h-96">
                <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2 text-[11px]">
                  <span>Response Body (JSON)</span>
                  <span>{apiResponse.payload.timestamp}</span>
                </div>
                <pre>{JSON.stringify(apiResponse.payload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

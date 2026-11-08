import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Layers, Award, 
  Clock, Hash, CheckCircle2, ChevronRight, X, Edit, School, Trash2, AlertTriangle
} from 'lucide-react';
import { AcademicProgram, Subject, User, ModalidadAsignatura } from '../../types';
import { academicService } from '../../services';

interface AcademicManagementProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const AcademicManagement: React.FC<AcademicManagementProps> = ({ currentUser, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'subjects'>('programs');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-01');
  const [subjectSearch, setSubjectSearch] = useState('');

  // Modals & Selection State
  const [isNewProgramOpen, setIsNewProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<AcademicProgram | null>(null);

  const [isNewSubjectOpen, setIsNewSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // Program form
  const [progForm, setProgForm] = useState({
    codigo: '',
    nombre: '',
    nivel: 'PREGRADO' as AcademicProgram['nivel'],
    facultad: 'Facultad de Ingeniería',
    duracionSemestres: 10,
    totalCreditos: 160,
    tituloOtorgado: '',
    activo: true,
    snies: '',
  });

  // Subject form
  const [subjForm, setSubjForm] = useState({
    codigo: '',
    nombre: '',
    programaId: 'prog-01',
    creditos: 3,
    semestre: 1,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL' as ModalidadAsignatura,
    descripcion: '',
    prerrequisitos: [] as string[],
    activo: true,
  });

  const programs = academicService.getPrograms();
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];
  const allSubjects = currentProgram ? academicService.getSubjects(currentProgram.id) : [];
  const filteredSubjects = allSubjects.filter(s => 
    s.nombre.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    s.codigo.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = academicService.createProgram(progForm, currentUser);
      onNotify('success', 'Programa Registrado', `Se creó el programa ${progForm.nombre}`);
      setIsNewProgramOpen(false);
      setSelectedProgramId(created.id);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Guardar', err.message);
    }
  };

  const handleOpenEditProgram = (prog: AcademicProgram) => {
    setEditingProgram(prog);
    setProgForm({
      codigo: prog.codigo,
      nombre: prog.nombre,
      nivel: prog.nivel,
      facultad: prog.facultad,
      duracionSemestres: prog.duracionSemestres,
      totalCreditos: prog.totalCreditos,
      tituloOtorgado: prog.tituloOtorgado,
      activo: prog.activo,
      snies: prog.snies || '',
    });
  };

  const handleSaveEditProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      academicService.updateProgram(editingProgram.id, progForm, currentUser);
      onNotify('success', 'Programa Actualizado', `Se actualizaron los datos del programa ${progForm.nombre}`);
      setEditingProgram(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Actualizar', err.message);
    }
  };

  const handleConfirmDeleteProgram = () => {
    if (!deletingProgram) return;
    try {
      academicService.deleteProgram(deletingProgram.id, currentUser);
      onNotify('success', 'Programa Eliminado', `El programa ${deletingProgram.nombre} y sus asignaturas fueron eliminados.`);
      setDeletingProgram(null);
      setRefreshKey(k => k + 1);
      const remaining = academicService.getPrograms();
      if (remaining.length > 0) {
        setSelectedProgramId(remaining[0].id);
      }
    } catch (err: any) {
      onNotify('error', 'Validación Institucional', err.message);
    }
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      academicService.createSubject({ ...subjForm, programaId: selectedProgramId }, currentUser);
      onNotify('success', 'Asignatura Creada', `Se añadió la asignatura ${subjForm.nombre} (${subjForm.codigo})`);
      setIsNewSubjectOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Guardar', err.message);
    }
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjForm({
      codigo: subj.codigo,
      nombre: subj.nombre,
      programaId: subj.programaId,
      creditos: subj.creditos,
      semestre: subj.semestre,
      horasSemanales: subj.horasSemanales,
      modalidad: subj.modalidad,
      descripcion: subj.descripcion,
      prerrequisitos: subj.prerrequisitos,
      activo: subj.activo,
    });
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      academicService.updateSubject(editingSubject.id, subjForm, currentUser);
      onNotify('success', 'Asignatura Actualizada', `Se actualizó la asignatura ${subjForm.nombre}`);
      setEditingSubject(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Actualizar', err.message);
    }
  };

  const handleConfirmDeleteSubject = () => {
    if (!deletingSubject) return;
    try {
      academicService.deleteSubject(deletingSubject.id, currentUser);
      onNotify('success', 'Asignatura Eliminada', `Se eliminó la asignatura ${deletingSubject.nombre} del plan de estudios.`);
      setDeletingSubject(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Validación Institucional', err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Programas y Malla Curricular
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              RF-05
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Definición de planes de estudio, asignaturas, créditos académicos, horas y prerrequisitos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProgForm({
                codigo: `PROG-${Math.floor(100 + Math.random() * 900)}`,
                nombre: '',
                nivel: 'PREGRADO',
                facultad: 'Facultad de Ingeniería',
                duracionSemestres: 10,
                totalCreditos: 160,
                tituloOtorgado: '',
                activo: true,
                snies: `${Math.floor(100000 + Math.random() * 90000)}`,
              });
              setIsNewProgramOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            <School className="w-4 h-4" />
            <span>Nuevo Programa</span>
          </button>

          <button
            onClick={() => {
              setSubjForm({
                codigo: `ASIG-${Math.floor(100 + Math.random() * 900)}`,
                nombre: '',
                programaId: selectedProgramId,
                creditos: 3,
                semestre: 1,
                horasSemanales: 4,
                modalidad: 'PRESENCIAL',
                descripcion: '',
                prerrequisitos: [],
                activo: true,
              });
              setIsNewSubjectOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Asignatura</span>
          </button>
        </div>
      </div>

      {/* Program Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">
          Programa Activo:
        </span>
        {programs.map(prog => (
          <button
            key={prog.id}
            onClick={() => setSelectedProgramId(prog.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedProgramId === prog.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {prog.nombre}
          </button>
        ))}
      </div>

      {/* Program Overview Banner */}
      {currentProgram && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                  Código: {currentProgram.codigo}
                </span>
                {currentProgram.snies && (
                  <span className="text-[11px] text-slate-300">SNIES: {currentProgram.snies}</span>
                )}
              </div>
              <h2 className="text-xl font-black mt-1 tracking-tight">{currentProgram.nombre}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{currentProgram.facultad}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Duración</span>
                <span className="font-bold text-sm text-slate-100">{currentProgram.duracionSemestres} Semestres</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Créditos</span>
                <span className="font-bold text-sm text-emerald-400">{currentProgram.totalCreditos} Créditos</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Asignaturas Activas</span>
                <span className="font-bold text-sm text-indigo-300">{allSubjects.length} Cursos</span>
              </div>
              
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/80">
                <button
                  onClick={() => handleOpenEditProgram(currentProgram)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-xs shadow-xs"
                  title="Editar datos del programa académico activo"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setDeletingProgram(currentProgram)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 hover:text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-xs border border-rose-500/30"
                  title="Eliminar programa académico activo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            placeholder="Buscar por código de materia o nombre..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredSubjects.length} asignaturas en el plan de estudio
        </span>
      </div>

      {/* Curriculum Grid grouped by semester */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map(sem => {
          const subjectsInSem = filteredSubjects.filter(s => s.semestre === sem);
          if (subjectsInSem.length === 0 && subjectSearch) return null;

          return (
            <div key={sem} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                    {sem}
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">Semestre {sem}</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {subjectsInSem.reduce((sum, s) => sum + s.creditos, 0)} créditos totales
                </span>
              </div>

              {subjectsInSem.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No hay materias registradas para este semestre.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subjectsInSem.map(subj => (
                    <div key={subj.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                            {subj.codigo}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{subj.nombre}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                            subj.modalidad === 'PRESENCIAL'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : subj.modalidad === 'HIBRIDA'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {subj.modalidad}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                          {subj.descripcion}
                        </p>
                        {subj.prerrequisitos.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                            <span className="font-bold text-slate-600">Prerrequisitos:</span>
                            {subj.prerrequisitos.map(pr => (
                              <span key={pr} className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 border border-slate-200">
                                {pr}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-900 text-sm block">{subj.creditos}</span>
                          <span className="text-[10px] uppercase text-slate-400">Créditos</span>
                        </div>
                        <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-900 text-sm block">{subj.horasSemanales}h</span>
                          <span className="text-[10px] uppercase text-slate-400">Semana</span>
                        </div>

                        <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                          <button
                            onClick={() => handleOpenEditSubject(subj)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Asignatura"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSubject(subj)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Asignatura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE PROGRAM MODAL */}
      {isNewProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Crear Programa Académico</h3>
              <button onClick={() => setIsNewProgramOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Código Programa</label>
                <input
                  type="text"
                  required
                  value={progForm.codigo}
                  onChange={(e) => setProgForm({ ...progForm, codigo: e.target.value })}
                  placeholder="ej. ING-IND"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Oficial</label>
                <input
                  type="text"
                  required
                  value={progForm.nombre}
                  onChange={(e) => setProgForm({ ...progForm, nombre: e.target.value })}
                  placeholder="ej. Ingeniería Industrial"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Facultad</label>
                <input
                  type="text"
                  required
                  value={progForm.facultad}
                  onChange={(e) => setProgForm({ ...progForm, facultad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Duración (Semestres)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={progForm.duracionSemestres}
                    onChange={(e) => setProgForm({ ...progForm, duracionSemestres: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Créditos</label>
                  <input
                    type="number"
                    value={progForm.totalCreditos}
                    onChange={(e) => setProgForm({ ...progForm, totalCreditos: parseInt(e.target.value) || 160 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título que Otorga</label>
                <input
                  type="text"
                  required
                  value={progForm.tituloOtorgado}
                  onChange={(e) => setProgForm({ ...progForm, tituloOtorgado: e.target.value })}
                  placeholder="ej. Ingeniero(a) Industrial"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProgramOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Guardar Programa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isNewSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Nueva Asignatura (RF-05)</h3>
              <button onClick={() => setIsNewSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={subjForm.codigo}
                    onChange={(e) => setSubjForm({ ...subjForm, codigo: e.target.value })}
                    placeholder="ej. SIS-302"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Semestre</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjForm.semestre}
                    onChange={(e) => setSubjForm({ ...subjForm, semestre: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre de la Asignatura</label>
                <input
                  type="text"
                  required
                  value={subjForm.nombre}
                  onChange={(e) => setSubjForm({ ...subjForm, nombre: e.target.value })}
                  placeholder="ej. Inteligencia Artificial y Machine Learning"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Créditos</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={subjForm.creditos}
                    onChange={(e) => setSubjForm({ ...subjForm, creditos: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Horas Semanales</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={subjForm.horasSemanales}
                    onChange={(e) => setSubjForm({ ...subjForm, horasSemanales: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Modalidad</label>
                <select
                  value={subjForm.modalidad}
                  onChange={(e) => setSubjForm({ ...subjForm, modalidad: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Descripción / Contenido</label>
                <textarea
                  rows={2}
                  value={subjForm.descripcion}
                  onChange={(e) => setSubjForm({ ...subjForm, descripcion: e.target.value })}
                  placeholder="Competencias, objetivos y núcleos temáticos..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubjectOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Guardar Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROGRAM MODAL */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Editar Programa: {editingProgram.codigo}</h3>
              <button onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProgram} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Código Programa</label>
                <input
                  type="text"
                  required
                  value={progForm.codigo}
                  onChange={(e) => setProgForm({ ...progForm, codigo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Oficial</label>
                <input
                  type="text"
                  required
                  value={progForm.nombre}
                  onChange={(e) => setProgForm({ ...progForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Facultad</label>
                <input
                  type="text"
                  required
                  value={progForm.facultad}
                  onChange={(e) => setProgForm({ ...progForm, facultad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Duración (Semestres)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={progForm.duracionSemestres}
                    onChange={(e) => setProgForm({ ...progForm, duracionSemestres: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Créditos</label>
                  <input
                    type="number"
                    value={progForm.totalCreditos}
                    onChange={(e) => setProgForm({ ...progForm, totalCreditos: parseInt(e.target.value) || 160 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título que Otorga</label>
                <input
                  type="text"
                  required
                  value={progForm.tituloOtorgado}
                  onChange={(e) => setProgForm({ ...progForm, tituloOtorgado: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Actualizar Programa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROGRAM MODAL */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar Programa Académico?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Esta acción suprimirá el programa de la oferta institucional y eliminará sus asignaturas y grupos asociados.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{deletingProgram.nombre}</span>
                <span className="font-mono text-indigo-700">{deletingProgram.codigo}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                {deletingProgram.facultad} • {deletingProgram.totalCreditos} Créditos
              </div>
              <p className="text-[11px] text-rose-700 font-medium pt-1.5 border-t border-rose-200/80">
                ⚠️ Si existen estudiantes activos adscritos a este programa, el sistema bloqueará la operación para garantizar la integridad institucional.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProgram}
                className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar Programa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Editar Asignatura: {editingSubject.codigo}</h3>
              <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubject} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={subjForm.codigo}
                    onChange={(e) => setSubjForm({ ...subjForm, codigo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Semestre</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjForm.semestre}
                    onChange={(e) => setSubjForm({ ...subjForm, semestre: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre de la Asignatura</label>
                <input
                  type="text"
                  required
                  value={subjForm.nombre}
                  onChange={(e) => setSubjForm({ ...subjForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Créditos</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={subjForm.creditos}
                    onChange={(e) => setSubjForm({ ...subjForm, creditos: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Horas Semanales</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={subjForm.horasSemanales}
                    onChange={(e) => setSubjForm({ ...subjForm, horasSemanales: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Modalidad</label>
                <select
                  value={subjForm.modalidad}
                  onChange={(e) => setSubjForm({ ...subjForm, modalidad: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={subjForm.descripcion}
                  onChange={(e) => setSubjForm({ ...subjForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Actualizar Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SUBJECT MODAL */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar Asignatura?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Esta acción suprimirá la materia de la malla curricular y eliminará sus grupos programados.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{deletingSubject.nombre}</span>
                <span className="font-mono text-indigo-700">{deletingSubject.codigo}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Semestre {deletingSubject.semestre} • {deletingSubject.creditos} Créditos • {deletingSubject.modalidad}
              </div>
              <p className="text-[11px] text-rose-700 font-medium pt-1.5 border-t border-rose-200/80">
                ⚠️ Si existen estudiantes con matrícula activa en curso para esta asignatura, el sistema impedirá su eliminación para preservar la consistencia académica.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubject}
                className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar Asignatura</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

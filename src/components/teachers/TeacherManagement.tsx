import React, { useState } from 'react';
import { 
  UserCheck, Search, Plus, Filter, Edit, 
  UserX, Mail, Phone, BookOpen, Briefcase, Award, X 
} from 'lucide-react';
import { Teacher, User, TipoDocumento } from '../../types';
import { teacherService } from '../../services';

interface TeacherManagementProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ currentUser, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepto, setSelectedDepto] = useState('TODOS');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    codigoDocente: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    nombreCompleto: '',
    emailInstitucional: '',
    telefono: '',
    tituloAcademico: '',
    departamento: 'Ingeniería de Sistemas y Computación',
    tipoContrato: 'TIEMPO_COMPLETO' as Teacher['tipoContrato'],
    activo: true,
    fechaContratacion: new Date().toISOString().substring(0, 10),
  });

  const teachers = teacherService.getAll(searchTerm, selectedDepto);

  const departamentos = [
    'Ingeniería de Sistemas y Computación',
    'Ciencias Económicas y Administrativas',
    'Jurisprudencia y Ciencias Políticas',
    'Ciencias Básicas y Matemáticas',
  ];

  const handleOpenCreate = () => {
    setFormData({
      codigoDocente: `DOC-${Math.floor(8000 + Math.random() * 999)}`,
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombreCompleto: '',
      emailInstitucional: '',
      telefono: '',
      tituloAcademico: '',
      departamento: departamentos[0],
      tipoContrato: 'TIEMPO_COMPLETO',
      activo: true,
      fechaContratacion: new Date().toISOString().substring(0, 10),
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      codigoDocente: t.codigoDocente,
      tipoDocumento: t.tipoDocumento,
      numeroDocumento: t.numeroDocumento,
      nombreCompleto: t.nombreCompleto,
      emailInstitucional: t.emailInstitucional,
      telefono: t.telefono,
      tituloAcademico: t.tituloAcademico,
      departamento: t.departamento,
      tipoContrato: t.tipoContrato,
      activo: t.activo,
      fechaContratacion: t.fechaContratacion,
    });
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      teacherService.create(formData, currentUser);
      onNotify('success', 'Docente Creado', `Se registró al docente ${formData.nombreCompleto}`);
      setIsCreateOpen(false);
    } catch (err: any) {
      onNotify('error', 'Error al Guardar', err.message);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      teacherService.update(editingTeacher.id, formData, currentUser);
      onNotify('success', 'Docente Actualizado', `Datos actualizados para ${formData.nombreCompleto}`);
      setEditingTeacher(null);
    } catch (err: any) {
      onNotify('error', 'Error al Actualizar', err.message);
    }
  };

  const handleToggleStatus = (t: Teacher) => {
    try {
      teacherService.update(t.id, { activo: !t.activo }, currentUser);
      onNotify('info', 'Estado Modificado', `Docente ${t.nombreCompleto} ahora está ${!t.activo ? 'ACTIVO' : 'INACTIVO'}`);
    } catch (err: any) {
      onNotify('error', 'Error al Actualizar', err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Gestión del Cuerpo Docente
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              RF-04
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administración de profesores, escalafón académico, departamento adscrito y carga horaria.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Docente</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código docente, nombre, documento, departamento o título..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDepto}
            onChange={(e) => setSelectedDepto(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODOS">Todos los Departamentos</option>
            {departamentos.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Teachers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.map(teacher => (
          <div 
            key={teacher.id} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {teacher.nombreCompleto.charAt(teacher.nombreCompleto.startsWith('Dr') ? 4 : 0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{teacher.nombreCompleto}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {teacher.codigoDocente}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {teacher.tipoDocumento} {teacher.numeroDocumento}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  teacher.activo 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {teacher.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-medium text-slate-800">{teacher.tituloAcademico}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.departamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.emailInstitucional}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.telefono}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {teacher.tipoContrato.replace('_', ' ')}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(teacher)}
                  className={`p-1 rounded-lg transition-colors ${
                    teacher.activo ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'
                  }`}
                  title={teacher.activo ? 'Desactivar' : 'Activar'}
                >
                  {teacher.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal CREATE / EDIT TEACHER */}
      {(isCreateOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingTeacher ? `Editar Docente: ${editingTeacher.codigoDocente}` : 'Registrar Docente (RF-04)'}
              </h3>
              <button
                onClick={() => { setIsCreateOpen(false); setEditingTeacher(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingTeacher ? handleSaveEdit : handleSaveCreate} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Código Docente</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoDocente}
                    onChange={(e) => setFormData({ ...formData, codigoDocente: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Cédula / Documento</label>
                  <input
                    type="text"
                    required
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo y Grado</label>
                <input
                  type="text"
                  required
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  placeholder="ej. Dra. María Victoria Salazar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título Académico Máximo</label>
                <input
                  type="text"
                  required
                  value={formData.tituloAcademico}
                  onChange={(e) => setFormData({ ...formData, tituloAcademico: e.target.value })}
                  placeholder="ej. PhD en Inteligencia Artificial y Computación"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email Institucional</label>
                  <input
                    type="email"
                    required
                    value={formData.emailInstitucional}
                    onChange={(e) => setFormData({ ...formData, emailInstitucional: e.target.value })}
                    placeholder="docente@unitec.edu"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Departamento Adscrito</label>
                <select
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {departamentos.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Modalidad de Contratación</label>
                <select
                  value={formData.tipoContrato}
                  onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="TIEMPO_COMPLETO">Tiempo Completo (40h/semana)</option>
                  <option value="MEDIO_TIEMPO">Medio Tiempo (20h/semana)</option>
                  <option value="CATEDRA">Cátedra Hora / Asignatura</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingTeacher(null); }}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  {editingTeacher ? 'Actualizar Docente' : 'Guardar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

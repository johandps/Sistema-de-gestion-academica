import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, Edit, Eye, UserX, 
  UserCheck, X, CheckCircle, Mail, Phone, MapPin, 
  BookOpen, Award, FileSpreadsheet, ShieldAlert, Trash2, AlertTriangle
} from 'lucide-react';
import { Student, User, AcademicProgram, EstadoEstudiante, TipoDocumento } from '../../types';
import { studentService, academicService } from '../../services';

interface StudentManagementProps {
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ currentUser, onNotify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('TODOS');
  const [selectedEstado, setSelectedEstado] = useState<EstadoEstudiante | 'TODOS'>('TODOS');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    codigoEstudiantil: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    emailInstitucional: '',
    emailPersonal: '',
    telefono: '',
    direccion: '',
    programaId: '',
    semestreActual: 1,
    estado: 'ACTIVO' as EstadoEstudiante,
    fechaIngreso: new Date().toISOString().substring(0, 10),
  });

  const programs = academicService.getPrograms();
  const students = studentService.getAll(
    searchTerm, 
    selectedProgram, 
    selectedEstado === 'TODOS' ? undefined : selectedEstado
  );

  const resetForm = () => {
    setFormData({
      codigoEstudiantil: `EST-2026${Math.floor(100 + Math.random() * 900)}`,
      tipoDocumento: 'CC',
      numeroDocumento: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      emailInstitucional: '',
      emailPersonal: '',
      telefono: '',
      direccion: '',
      programaId: programs[0]?.id || '',
      semestreActual: 1,
      estado: 'ACTIVO',
      fechaIngreso: new Date().toISOString().substring(0, 10),
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      codigoEstudiantil: student.codigoEstudiantil,
      tipoDocumento: student.tipoDocumento,
      numeroDocumento: student.numeroDocumento,
      primerNombre: student.primerNombre,
      segundoNombre: student.segundoNombre || '',
      primerApellido: student.primerApellido,
      segundoApellido: student.segundoApellido || '',
      emailInstitucional: student.emailInstitucional,
      emailPersonal: student.emailPersonal,
      telefono: student.telefono,
      direccion: student.direccion,
      programaId: student.programaId,
      semestreActual: student.semestreActual,
      estado: student.estado,
      fechaIngreso: student.fechaIngreso,
    });
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      studentService.create(formData, currentUser);
      onNotify('success', 'Estudiante Creado', `Se registró exitosamente a ${formData.primerNombre} ${formData.primerApellido}`);
      setIsCreateOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Guardar', err.message);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      studentService.update(editingStudent.id, formData, currentUser);
      onNotify('success', 'Estudiante Actualizado', `Datos actualizados para ${editingStudent.codigoEstudiantil}`);
      setEditingStudent(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Actualizar', err.message);
    }
  };

  const handleToggleStatus = (student: Student) => {
    const nuevoEstado = student.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      studentService.toggleStatus(student.id, nuevoEstado, currentUser);
      onNotify(
        'info', 
        'Estado Modificado', 
        `El estudiante ${student.primerNombre} pasó a estado ${nuevoEstado}`
      );
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error de Transacción', err.message);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    try {
      studentService.delete(deletingStudent.id, currentUser);
      onNotify(
        'success',
        'Estudiante Eliminado (RF-03)',
        `Se eliminó definitivamente el expediente de ${deletingStudent.primerNombre} ${deletingStudent.primerApellido} (${deletingStudent.codigoEstudiantil}).`
      );
      setDeletingStudent(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      onNotify('error', 'Error al Eliminar', err.message);
    }
  };

  const getProgramName = (id: string) => {
    return programs.find(p => p.id === id)?.nombre || 'Sin Programa';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Gestión de Estudiantes
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              RF-03 / RF-11
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro, actualización, consulta institucional y control de estado de los estudiantes matriculados.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Estudiante</span>
        </button>
      </div>

      {/* Filters & Search Toolbar (RF-11) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ej. EST-2024101), cédula, nombres o correo..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filter by Program */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos los Programas</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as any)}
            className="text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="GRADUADO">Graduado</option>
            <option value="RETIRADO">Retirado</option>
          </select>
        </div>

      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código / Documento</th>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Programa Académico</th>
                <th className="px-4 py-3 text-center">Semestre</th>
                <th className="px-4 py-3 text-center">Promedio</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isActive = student.estado === 'ACTIVO';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">{student.codigoEstudiantil}</div>
                        <div className="text-[11px] text-slate-500">{student.tipoDocumento} {student.numeroDocumento}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {student.primerNombre} {student.segundoNombre || ''} {student.primerApellido} {student.segundoApellido || ''}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{student.emailInstitucional}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px] truncate">
                        <span className="font-medium text-slate-700">{getProgramName(student.programaId)}</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Sem {student.semestreActual}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-indigo-700">
                        {student.promedioAcumulado > 0 ? student.promedioAcumulado.toFixed(2) : 'S.C.'}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {student.estado}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive 
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50' 
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Desactivar Estudiante' : 'Activar Estudiante'}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Estudiante Definitivamente (RF-03)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer count */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Mostrando {students.length} estudiantes registrados</span>
          <span className="font-mono text-[11px]">Control de Integridad Referencial Activo</span>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? `Editar Estudiante: ${editingStudent.codigoEstudiantil}` : 'Registrar Nuevo Estudiante (RF-03)'}
              </h3>
              <button
                onClick={() => { setIsCreateOpen(false); setEditingStudent(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingStudent ? handleSaveEdit : handleSaveCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código Estudiantil</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoEstudiantil}
                    onChange={(e) => setFormData({ ...formData, codigoEstudiantil: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo</label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                      className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="CE">CE</option>
                      <option value="PASAPORTE">PAS</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Número Documento</label>
                    <input
                      type="text"
                      required
                      value={formData.numeroDocumento}
                      onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primer Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.primerNombre}
                    onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Segundo Nombre (Opcional)</label>
                  <input
                    type="text"
                    value={formData.segundoNombre}
                    onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.primerApellido}
                    onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Segundo Apellido</label>
                  <input
                    type="text"
                    value={formData.segundoApellido}
                    onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Institucional</label>
                  <input
                    type="email"
                    required
                    value={formData.emailInstitucional}
                    onChange={(e) => setFormData({ ...formData, emailInstitucional: e.target.value })}
                    placeholder="estudiante@unitec.edu"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono Móvil</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+57 300 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Programa Académico</label>
                  <select
                    value={formData.programaId}
                    onChange={(e) => setFormData({ ...formData, programaId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semestre</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.semestreActual}
                      onChange={(e) => setFormData({ ...formData, semestreActual: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="SUSPENDIDO">SUSPENDIDO</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección de Residencia</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Calle / Carrera # 00 - 00"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingStudent(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Actualizar Registro' : 'Guardar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Ficha Académica Institucional</h3>
              </div>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-indigo-950">
                    {viewingStudent.primerNombre} {viewingStudent.primerApellido}
                  </h4>
                  <p className="font-mono text-indigo-700 font-bold">{viewingStudent.codigoEstudiantil}</p>
                  <p className="text-indigo-600 text-[11px] mt-0.5">{getProgramName(viewingStudent.programaId)}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Promedio Acumulado</div>
                  <div className="text-2xl font-black text-indigo-700">
                    {viewingStudent.promedioAcumulado > 0 ? viewingStudent.promedioAcumulado.toFixed(2) : '4.50'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Documento</span>
                  {viewingStudent.tipoDocumento} {viewingStudent.numeroDocumento}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Semestre Actual</span>
                  Semestre {viewingStudent.semestreActual}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Email</span>
                  {viewingStudent.emailInstitucional}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Teléfono</span>
                  {viewingStudent.telefono}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Dirección</span>
                  {viewingStudent.direccion}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (RF-03) */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar Estudiante Definitivamente?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Esta acción eliminará el registro de la base de datos institucional y aplicará reglas de integridad referencial.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{deletingStudent.primerNombre} {deletingStudent.primerApellido}</span>
                <span className="font-mono text-indigo-700">{deletingStudent.codigoEstudiantil}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Documento: {deletingStudent.tipoDocumento} {deletingStudent.numeroDocumento} • {getProgramName(deletingStudent.programaId)}
              </div>
              <p className="text-[11px] text-rose-700 font-medium pt-1.5 border-t border-rose-200/80">
                ⚠️ Se liberarán automáticamente los cupos de sus asignaturas matriculadas, se eliminarán sus calificaciones registradas y el evento quedará asentado en la pista inmutable de auditoría (RF-12).
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar Estudiante</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

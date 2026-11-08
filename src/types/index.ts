/**
 * SIGA - Sistema Institucional de Gestión Académica
 * Capa de Dominio: Entidades, Enums, DTOs y Contratos de Datos
 * Mapeo homologado a entidades JPA / Hibernate y DTOs de Spring Boot
 */

export type UserRole = 'ADMIN' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE';

export interface User {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
  documentoIdentidad: string;
  telefono?: string;
  activo: boolean;
  ultimoAcceso?: string;
  avatarUrl?: string;
  referenciaId?: string; // id de Student o Teacher vinculado
}

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PASAPORTE';
export type EstadoEstudiante = 'ACTIVO' | 'INACTIVO' | 'GRADUADO' | 'RETIRADO' | 'SUSPENDIDO';
export type ModalidadAsignatura = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';

export interface Student {
  id: string;
  codigoEstudiantil: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  emailInstitucional: string;
  emailPersonal: string;
  telefono: string;
  direccion: string;
  programaId: string;
  semestreActual: number;
  estado: EstadoEstudiante;
  fechaIngreso: string;
  promedioAcumulado: number;
  creditosAprobados: number;
}

export interface Teacher {
  id: string;
  codigoDocente: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombreCompleto: string;
  emailInstitucional: string;
  telefono: string;
  tituloAcademico: string; // ej. Magíster en Ingeniería de Software, Doctor en Ciencias
  departamento: string;    // ej. Departamento de Ciencias de la Computación
  tipoContrato: 'TIEMPO_COMPLETO' | 'MEDIO_TIEMPO' | 'CATEDRA';
  activo: boolean;
  fechaContratacion: string;
}

export interface AcademicProgram {
  id: string;
  codigo: string;
  nombre: string;
  nivel: 'PREGRADO' | 'POSGRADO' | 'TECNOLOGIA' | 'MAESTRIA' | 'DOCTORADO';
  facultad: string;
  duracionSemestres: number;
  totalCreditos: number;
  tituloOtorgado: string;
  activo: boolean;
  snies?: string;
}

export interface Subject {
  id: string;
  codigo: string;
  nombre: string;
  programaId: string;
  creditos: number;
  semestre: number;
  horasSemanales: number;
  modalidad: ModalidadAsignatura;
  descripcion: string;
  prerrequisitos: string[]; // Códigos de asignaturas previas requeridas
  activo: boolean;
}

export interface AcademicPeriod {
  id: string;
  codigo: string; // ej. "2026-1", "2026-2"
  nombre: string; // ej. "Periodo Académico Ordinario 2026-I"
  fechaInicio: string;
  fechaFin: string;
  fechaLimiteMatricula: string;
  fechaCierreNotas: string;
  esPeriodoActivo: boolean;
  estado: 'PLANEACION' | 'ACTIVO' | 'CERRADO';
}

export interface HorarioClase {
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
  horaInicio: string; // "07:00"
  horaFin: string;    // "09:00"
  aula: string;       // "Edificio 3 - Aula 204" o "Sala Virtual Teams #3"
}

export interface AcademicGroup {
  id: string;
  codigoGrupo: string; // ej. "01", "02"
  periodoId: string;
  asignaturaId: string;
  docenteId: string;
  cupoMaximo: number;
  cupoDisponible: number;
  horarios: HorarioClase[];
  modalidad: ModalidadAsignatura;
  enlaceVirtual?: string;
  estado: 'ABIERTO' | 'CERRADO' | 'CANCELADO';
}

export interface Enrollment {
  id: string;
  estudianteId: string;
  grupoId: string;
  periodoId: string;
  asignaturaId: string;
  fechaMatricula: string;
  estado: 'MATRICULADA' | 'CANCELADA' | 'RETIRADA';
  intentosNumero: number;
  notaFinalDefinitiva?: number;
  estadoAprobacion?: 'APROBADA' | 'REPROBADA' | 'EN_CURSO';
}

export interface GradeItem {
  nombre: string;         // ej: "Primer Parcial (30%)", "Segundo Parcial (30%)", "Examen Final (40%)"
  porcentaje: number;     // ej: 30
  calificacion: number | null; // 0.0 a 5.0
  fechaRegistro?: string;
  observaciones?: string;
}

export interface GradeRecord {
  id: string;
  matriculaId: string;
  estudianteId: string;
  grupoId: string;
  evaluaciones: GradeItem[];
  notaDefinitiva: number;
  aprobado: boolean;
  fechaUltimaModificacion: string;
  modificadoPorUsuarioId: string;
  publicado: boolean;
}

export type TipoAccionAuditoria = 
  | 'LOGIN_EXITOSO'
  | 'LOGIN_FALLIDO'
  | 'LOGOUT'
  | 'CREAR_ESTUDIANTE'
  | 'ACTUALIZAR_ESTUDIANTE'
  | 'CAMBIAR_ESTADO_ESTUDIANTE'
  | 'ELIMINAR_ESTUDIANTE'
  | 'CREAR_DOCENTE'
  | 'ACTUALIZAR_DOCENTE'
  | 'CREAR_PROGRAMA'
  | 'ACTUALIZAR_PROGRAMA'
  | 'ELIMINAR_PROGRAMA'
  | 'CREAR_ASIGNATURA'
  | 'ACTUALIZAR_ASIGNATURA'
  | 'ELIMINAR_ASIGNATURA'
  | 'CREAR_GRUPO'
  | 'MATRICULAR_ESTUDIANTE'
  | 'CANCELAR_MATRICULA'
  | 'REGISTRAR_CALIFICACIONES'
  | 'PUBLICAR_CALIFICACIONES'
  | 'CAMBIO_ROL'
  | 'BACKUP_DATOS'
  | 'RESTAURAR_DATOS';

export interface AuditLog {
  id: string;
  fechaHora: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: UserRole;
  accion: TipoAccionAuditoria;
  modulo: 'AUTENTICACION' | 'ESTUDIANTES' | 'DOCENTES' | 'ACADEMICO' | 'GRUPOS' | 'MATRICULAS' | 'CALIFICACIONES' | 'SISTEMA';
  registroAfectadoId?: string;
  descripcion: string;
  detallesAntes?: Record<string, any>;
  detallesDespues?: Record<string, any>;
  ipOrigen: string;
  navegador: string;
}

// DTOs para solicitudes y respuestas
export interface AuthResponse {
  token: string;
  usuario: User;
  permisos: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

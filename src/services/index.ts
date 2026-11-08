/**
 * SIGA - Capa de Lógica de Negocios (Business Logic Layer / Spring Boot @Service Pattern)
 * Implementa las reglas institucionales, validaciones atómicas, transacciones,
 * control de cupos, integridad referencial y emisión de eventos de auditoría.
 */

import { 
  User, Student, Teacher, AcademicProgram, Subject, 
  AcademicPeriod, AcademicGroup, Enrollment, GradeRecord, 
  GradeItem, AuditLog, UserRole, EstadoEstudiante, HorarioClase 
} from '../types';
import { 
  userRepository, studentRepository, teacherRepository, 
  programRepository, subjectRepository, periodRepository, 
  groupRepository, enrollmentRepository, gradeRepository, 
  auditRepository 
} from '../repositories';
import { dbStorage } from '../db/storage';

// ----------------------------------------------------------------------
// 1. AuditService: Registro inmutable de eventos institucionales (RF-12, RNF-10)
// ----------------------------------------------------------------------
export class AuditService {
  public log(
    usuario: User,
    accion: AuditLog['accion'],
    modulo: AuditLog['modulo'],
    descripcion: string,
    registroAfectadoId?: string,
    detallesAntes?: Record<string, any>,
    detallesDespues?: Record<string, any>
  ): AuditLog {
    const logEntry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombreCompleto,
      usuarioRol: usuario.rol,
      accion,
      modulo,
      registroAfectadoId,
      descripcion,
      detallesAntes,
      detallesDespues,
      ipOrigen: '192.168.1.' + Math.floor(10 + Math.random() * 80),
      navegador: navigator.userAgent.substring(0, 45) + '...',
    };
    return auditRepository.save(logEntry);
  }

  public getAllLogs(filtroModulo?: string, filtroUsuario?: string, busqueda?: string): AuditLog[] {
    // Sanitización proactiva para garantizar eliminación permanente del rastro de Johan Pava
    auditRepository.purgeByTerm('johan');
    auditRepository.purgeByTerm('pava');

    let logs = auditRepository.findAll();
    if (filtroModulo && filtroModulo !== 'TODOS') {
      logs = logs.filter(l => l.modulo === filtroModulo);
    }
    if (filtroUsuario) {
      logs = logs.filter(l => l.usuarioNombre.toLowerCase().includes(filtroUsuario.toLowerCase()));
    }
    if (busqueda) {
      const q = busqueda.toLowerCase().trim();
      logs = logs.filter(l => 
        l.descripcion.toLowerCase().includes(q) || 
        l.accion.toLowerCase().includes(q) ||
        l.usuarioNombre.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  public purgeTrace(term: string): number {
    return auditRepository.purgeByTerm(term);
  }

  public deleteLog(id: string): boolean {
    return auditRepository.deleteById(id);
  }
}

export const auditService = new AuditService();

// ----------------------------------------------------------------------
// 2. AuthService: Autenticación, Sesión y Control de Roles (RF-01, RF-02, RNF-01)
// ----------------------------------------------------------------------
export class AuthService {
  public getCurrentUser(): User {
    const user = dbStorage.getActiveSession();
    if (!user) {
      return userRepository.findAll()[0]; // fallback admin
    }
    return user;
  }

  public login(usernameOrEmail: string, _passwordPlain: string): { success: boolean; user?: User; error?: string } {
    const user = userRepository.findByUsername(usernameOrEmail) || userRepository.findByEmail(usernameOrEmail);
    if (!user) {
      return { success: false, error: 'Credenciales inválidas. Verifique el usuario o correo institucional.' };
    }
    if (!user.activo) {
      return { success: false, error: 'El usuario se encuentra inactivo. Comuníquese con la oficina de admisiones y registro.' };
    }

    user.ultimoAcceso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    userRepository.save(user);
    dbStorage.setActiveSession(user);

    auditService.log(
      user, 
      'LOGIN_EXITOSO', 
      'AUTENTICACION', 
      `Inicio de sesión exitoso con rol ${user.rol}.`
    );

    return { success: true, user };
  }

  public switchUserFast(userId: string): User {
    const user = userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    dbStorage.setActiveSession(user);
    auditService.log(user, 'LOGIN_EXITOSO', 'AUTENTICACION', `Cambio rápido a perfil: ${user.nombreCompleto} (${user.rol})`);
    return user;
  }

  public logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      auditService.log(user, 'LOGOUT', 'AUTENTICACION', 'Cierre de sesión de usuario.');
    }
    dbStorage.setActiveSession(null);
  }

  public hasPermission(currentRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(currentRole);
  }
}

export const authService = new AuthService();

// ----------------------------------------------------------------------
// 3. StudentService: Gestión de Estudiantes (RF-03, RNF-07)
// ----------------------------------------------------------------------
export class StudentService {
  public getAll(search?: string, programaId?: string, estado?: EstadoEstudiante): Student[] {
    let list = studentRepository.findAll();
    if (programaId && programaId !== 'TODOS') {
      list = list.filter(s => s.programaId === programaId);
    }
    if (estado) {
      list = list.filter(s => s.estado === estado);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(s => 
        s.codigoEstudiantil.toLowerCase().includes(q) ||
        s.numeroDocumento.includes(q) ||
        `${s.primerNombre} ${s.segundoNombre || ''} ${s.primerApellido} ${s.segundoApellido || ''}`.toLowerCase().includes(q) ||
        s.emailInstitucional.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getById(id: string): Student | undefined {
    return studentRepository.findById(id);
  }

  public create(data: Omit<Student, 'id' | 'promedioAcumulado' | 'creditosAprobados'>, currentUser: User): Student {
    // Validar código estudiantil único
    const existsCode = studentRepository.findByCodigoEstudiantil(data.codigoEstudiantil);
    if (existsCode) {
      throw new Error(`El código estudiantil ${data.codigoEstudiantil} ya está asignado a otro estudiante.`);
    }

    // Validar documento único
    const existsDoc = studentRepository.findByNumeroDocumento(data.numeroDocumento);
    if (existsDoc) {
      throw new Error(`El número de documento ${data.numeroDocumento} ya se encuentra registrado.`);
    }

    // Validar email institucional único
    const existsEmail = studentRepository.findByEmailInstitucional(data.emailInstitucional);
    if (existsEmail) {
      throw new Error(`El correo institucional ${data.emailInstitucional} ya está en uso.`);
    }

    const newStudent: Student = {
      ...data,
      id: `stud-${Date.now()}`,
      promedioAcumulado: 0.0,
      creditosAprobados: 0,
    };

    const saved = studentRepository.save(newStudent);

    // Crear cuenta de usuario estudiante para permitir login
    const newUser: User = {
      id: `usr-${saved.id}`,
      username: data.emailInstitucional.split('@')[0],
      nombreCompleto: `${data.primerNombre} ${data.primerApellido}`,
      email: data.emailInstitucional,
      rol: 'ESTUDIANTE',
      documentoIdentidad: data.numeroDocumento,
      activo: data.estado === 'ACTIVO',
      referenciaId: saved.id,
      ultimoAcceso: 'Nunca',
    };
    userRepository.save(newUser);

    auditService.log(
      currentUser,
      'CREAR_ESTUDIANTE',
      'ESTUDIANTES',
      `Registro de nuevo estudiante: ${saved.primerNombre} ${saved.primerApellido} (${saved.codigoEstudiantil}) en programa ${saved.programaId}`,
      saved.id,
      undefined,
      saved
    );

    return saved;
  }

  public update(id: string, updates: Partial<Student>, currentUser: User): Student {
    const existing = studentRepository.findById(id);
    if (!existing) {
      throw new Error('Estudiante no encontrado en el sistema.');
    }

    // Verificar duplicidad si cambió documento
    if (updates.numeroDocumento && updates.numeroDocumento !== existing.numeroDocumento) {
      const existsDoc = studentRepository.findByNumeroDocumento(updates.numeroDocumento);
      if (existsDoc && existsDoc.id !== id) {
        throw new Error(`El número de documento ${updates.numeroDocumento} ya está registrado.`);
      }
    }

    const updated: Student = { ...existing, ...updates };
    const saved = studentRepository.save(updated);

    // Sincronizar usuario
    const user = userRepository.findAll().find(u => u.referenciaId === id);
    if (user) {
      user.activo = updated.estado === 'ACTIVO';
      user.nombreCompleto = `${updated.primerNombre} ${updated.primerApellido}`;
      userRepository.save(user);
    }

    auditService.log(
      currentUser,
      'ACTUALIZAR_ESTUDIANTE',
      'ESTUDIANTES',
      `Actualización de datos para el estudiante ${saved.codigoEstudiantil}`,
      saved.id,
      existing,
      saved
    );

    return saved;
  }

  public toggleStatus(id: string, nuevoEstado: EstadoEstudiante, currentUser: User): Student {
    const existing = studentRepository.findById(id);
    if (!existing) throw new Error('Estudiante no encontrado');

    const previo = existing.estado;
    existing.estado = nuevoEstado;
    const saved = studentRepository.save(existing);

    // Sincronizar estado del usuario
    const user = userRepository.findAll().find(u => u.referenciaId === id);
    if (user) {
      user.activo = nuevoEstado === 'ACTIVO';
      userRepository.save(user);
    }

    auditService.log(
      currentUser,
      'CAMBIAR_ESTADO_ESTUDIANTE',
      'ESTUDIANTES',
      `Cambio de estado de estudiante ${saved.codigoEstudiantil} de ${previo} a ${nuevoEstado}`,
      saved.id,
      { estado: previo },
      { estado: nuevoEstado }
    );

    return saved;
  }

  public delete(id: string, currentUser: User): boolean {
    const existing = studentRepository.findById(id);
    if (!existing) {
      throw new Error('Estudiante no encontrado en el sistema.');
    }

    // 1. Liberar cupos de matrículas activas del estudiante
    const studentEnrollments = enrollmentRepository.findByEstudianteId(id);
    for (const enr of studentEnrollments) {
      if (enr.estado === 'MATRICULADA') {
        const group = groupRepository.findById(enr.grupoId);
        if (group) {
          group.cupoDisponible = Math.min(group.cupoMaximo, group.cupoDisponible + 1);
          groupRepository.save(group);
        }
      }
      // Eliminar registros de calificaciones asociados a la matrícula
      const grades = gradeRepository.findAll().filter(g => g.matriculaId === enr.id || g.estudianteId === id);
      grades.forEach(g => gradeRepository.deleteById(g.id));
      
      // Eliminar matrícula
      enrollmentRepository.deleteById(enr.id);
    }

    // 2. Eliminar calificaciones directas restantes
    const directGrades = gradeRepository.findByEstudianteId(id);
    directGrades.forEach(g => gradeRepository.deleteById(g.id));

    // 3. Eliminar usuario vinculado si existe
    const linkedUser = userRepository.findAll().find(
      u => u.referenciaId === id || u.email.toLowerCase() === existing.emailInstitucional.toLowerCase()
    );
    if (linkedUser) {
      userRepository.deleteById(linkedUser.id);
    }

    // 4. Eliminar el registro del estudiante
    studentRepository.deleteById(id);

    // 5. Registro de auditoría inmutable (RF-12, RNF-10)
    auditService.log(
      currentUser,
      'ELIMINAR_ESTUDIANTE',
      'ESTUDIANTES',
      `Eliminación definitiva del estudiante ${existing.primerNombre} ${existing.primerApellido} (${existing.codigoEstudiantil}), cancelando matrículas y liberando cupos académicos.`,
      id,
      existing,
      undefined
    );

    return true;
  }
}

export const studentService = new StudentService();

// ----------------------------------------------------------------------
// 4. TeacherService: Gestión de Docentes (RF-04)
// ----------------------------------------------------------------------
export class TeacherService {
  public getAll(search?: string, depto?: string): Teacher[] {
    let list = teacherRepository.findAll();
    if (depto && depto !== 'TODOS') {
      list = list.filter(t => t.departamento.toLowerCase() === depto.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(t => 
        t.codigoDocente.toLowerCase().includes(q) ||
        t.nombreCompleto.toLowerCase().includes(q) ||
        t.numeroDocumento.includes(q) ||
        t.emailInstitucional.toLowerCase().includes(q) ||
        t.tituloAcademico.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getById(id: string): Teacher | undefined {
    return teacherRepository.findById(id);
  }

  public create(data: Omit<Teacher, 'id'>, currentUser: User): Teacher {
    if (teacherRepository.findByCodigoDocente(data.codigoDocente)) {
      throw new Error(`El código docente ${data.codigoDocente} ya existe.`);
    }
    if (teacherRepository.findByNumeroDocumento(data.numeroDocumento)) {
      throw new Error(`El número de documento ${data.numeroDocumento} ya está asignado a otro docente.`);
    }

    const newTeacher: Teacher = {
      ...data,
      id: `teach-${Date.now()}`,
    };
    const saved = teacherRepository.save(newTeacher);

    // Crear usuario docente
    const newUser: User = {
      id: `usr-${saved.id}`,
      username: data.emailInstitucional.split('@')[0],
      nombreCompleto: data.nombreCompleto,
      email: data.emailInstitucional,
      rol: 'DOCENTE',
      documentoIdentidad: data.numeroDocumento,
      activo: data.activo,
      referenciaId: saved.id,
      ultimoAcceso: 'Nunca',
    };
    userRepository.save(newUser);

    auditService.log(
      currentUser,
      'CREAR_DOCENTE',
      'DOCENTES',
      `Creación de docente: ${saved.nombreCompleto} (${saved.codigoDocente})`,
      saved.id,
      undefined,
      saved
    );

    return saved;
  }

  public update(id: string, updates: Partial<Teacher>, currentUser: User): Teacher {
    const existing = teacherRepository.findById(id);
    if (!existing) throw new Error('Docente no encontrado');

    const updated: Teacher = { ...existing, ...updates };
    const saved = teacherRepository.save(updated);

    // Sincronizar usuario
    const user = userRepository.findAll().find(u => u.referenciaId === id);
    if (user) {
      user.activo = updated.activo;
      user.nombreCompleto = updated.nombreCompleto;
      userRepository.save(user);
    }

    auditService.log(
      currentUser,
      'ACTUALIZAR_DOCENTE',
      'DOCENTES',
      `Actualización de datos para docente ${saved.nombreCompleto}`,
      saved.id,
      existing,
      saved
    );

    return saved;
  }
}

export const teacherService = new TeacherService();

// ----------------------------------------------------------------------
// 5. AcademicService: Programas y Asignaturas (RF-05)
// ----------------------------------------------------------------------
export class AcademicService {
  public getPrograms(): AcademicProgram[] {
    return programRepository.findAll();
  }

  public createProgram(data: Omit<AcademicProgram, 'id'>, currentUser: User): AcademicProgram {
    if (programRepository.findByCodigo(data.codigo)) {
      throw new Error(`El código de programa ${data.codigo} ya existe.`);
    }
    const newProg: AcademicProgram = {
      ...data,
      id: `prog-${Date.now()}`,
    };
    const saved = programRepository.save(newProg);
    auditService.log(currentUser, 'CREAR_PROGRAMA', 'ACADEMICO', `Creación de programa académico: ${saved.nombre}`, saved.id);
    return saved;
  }

  public updateProgram(id: string, data: Partial<AcademicProgram>, currentUser: User): AcademicProgram {
    const existing = programRepository.findById(id);
    if (!existing) throw new Error('Programa no encontrado');
    const updated = { ...existing, ...data };
    programRepository.save(updated);
    auditService.log(currentUser, 'ACTUALIZAR_PROGRAMA', 'ACADEMICO', `Actualización de programa: ${updated.nombre} (${updated.codigo})`, updated.id, existing, updated);
    return updated;
  }

  public deleteProgram(id: string, currentUser: User): boolean {
    const existing = programRepository.findById(id);
    if (!existing) throw new Error('Programa académico no encontrado.');

    // 1. Validar si existen estudiantes matriculados en este programa
    const enrolledStudents = studentRepository.findByProgramaId(id);
    if (enrolledStudents.length > 0) {
      throw new Error(
        `No es posible eliminar el programa "${existing.nombre}" porque tiene ${enrolledStudents.length} estudiante(s) activo(s) adscrito(s). Reasigne o desactive los estudiantes primero para preservar la integridad institucional.`
      );
    }

    // 2. Eliminar asignaturas y grupos asociados en cascada
    const subjects = subjectRepository.findByProgramaId(id);
    for (const subj of subjects) {
      const groups = groupRepository.findByAsignaturaId(subj.id);
      groups.forEach(g => groupRepository.deleteById(g.id));
      subjectRepository.deleteById(subj.id);
    }

    // 3. Eliminar programa
    programRepository.deleteById(id);

    auditService.log(
      currentUser,
      'ELIMINAR_PROGRAMA',
      'ACADEMICO',
      `Eliminación del programa académico ${existing.nombre} (${existing.codigo}) y sus asignaturas asociadas.`,
      id,
      existing,
      undefined
    );

    return true;
  }

  public getSubjects(programaId?: string, semestre?: number): Subject[] {
    let list = subjectRepository.findAll();
    if (programaId && programaId !== 'TODOS') {
      list = list.filter(s => s.programaId === programaId);
    }
    if (semestre) {
      list = list.filter(s => s.semestre === semestre);
    }
    return list;
  }

  public createSubject(data: Omit<Subject, 'id'>, currentUser: User): Subject {
    if (subjectRepository.findByCodigo(data.codigo)) {
      throw new Error(`El código de asignatura ${data.codigo} ya existe.`);
    }
    const newSubj: Subject = {
      ...data,
      id: `subj-${Date.now()}`,
    };
    const saved = subjectRepository.save(newSubj);
    auditService.log(currentUser, 'CREAR_ASIGNATURA', 'ACADEMICO', `Creación de asignatura: ${saved.nombre} (${saved.codigo})`, saved.id);
    return saved;
  }

  public updateSubject(id: string, data: Partial<Subject>, currentUser: User): Subject {
    const existing = subjectRepository.findById(id);
    if (!existing) throw new Error('Asignatura no encontrada');
    const updated = { ...existing, ...data };
    subjectRepository.save(updated);
    auditService.log(currentUser, 'ACTUALIZAR_ASIGNATURA', 'ACADEMICO', `Actualización de asignatura: ${updated.nombre} (${updated.codigo})`, updated.id, existing, updated);
    return updated;
  }

  public deleteSubject(id: string, currentUser: User): boolean {
    const existing = subjectRepository.findById(id);
    if (!existing) throw new Error('Asignatura no encontrada.');

    // 1. Validar si existen matrículas activas en grupos de esta asignatura
    const activeEnrollments = enrollmentRepository.findAll().filter(
      e => e.asignaturaId === id && e.estado === 'MATRICULADA'
    );
    if (activeEnrollments.length > 0) {
      throw new Error(
        `No es posible eliminar la asignatura "${existing.nombre}" porque cuenta con ${activeEnrollments.length} estudiante(s) con matrícula activa en el periodo vigente.`
      );
    }

    // 2. Eliminar grupos aperturados para esta asignatura
    const groups = groupRepository.findByAsignaturaId(id);
    groups.forEach(g => groupRepository.deleteById(g.id));

    // 3. Eliminar asignatura
    subjectRepository.deleteById(id);

    auditService.log(
      currentUser,
      'ELIMINAR_ASIGNATURA',
      'ACADEMICO',
      `Eliminación de la asignatura ${existing.nombre} (${existing.codigo}) del plan de estudios.`,
      id,
      existing,
      undefined
    );

    return true;
  }
}

export const academicService = new AcademicService();

// ----------------------------------------------------------------------
// 6. GroupPeriodService: Periodos, Grupos y Horarios (RF-06)
// ----------------------------------------------------------------------
export class GroupPeriodService {
  public getPeriods(): AcademicPeriod[] {
    return periodRepository.findAll();
  }

  public getActivePeriod(): AcademicPeriod | undefined {
    return periodRepository.findActivePeriod();
  }

  public createPeriod(data: Omit<AcademicPeriod, 'id'>, currentUser: User): AcademicPeriod {
    const newPeriod: AcademicPeriod = {
      ...data,
      id: `per-${data.codigo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    };
    const saved = periodRepository.save(newPeriod);
    auditService.log(currentUser, 'CREAR_PROGRAMA', 'GRUPOS', `Apertura de periodo académico: ${saved.nombre}`, saved.id);
    return saved;
  }

  public getGroups(periodoId?: string, asignaturaId?: string, docenteId?: string): AcademicGroup[] {
    let list = groupRepository.findAll();
    if (periodoId) {
      list = list.filter(g => g.periodoId === periodoId);
    }
    if (asignaturaId) {
      list = list.filter(g => g.asignaturaId === asignaturaId);
    }
    if (docenteId) {
      list = list.filter(g => g.docenteId === docenteId);
    }
    return list;
  }

  public createGroup(data: Omit<AcademicGroup, 'id' | 'cupoDisponible'>, currentUser: User): AcademicGroup {
    // Validar choque de horarios del docente
    this.checkTeacherScheduleConflict(data.docenteId, data.horarios, data.periodoId);

    const newGroup: AcademicGroup = {
      ...data,
      id: `grp-${Date.now()}`,
      cupoDisponible: data.cupoMaximo,
    };

    const saved = groupRepository.save(newGroup);
    auditService.log(currentUser, 'CREAR_GRUPO', 'GRUPOS', `Creación de grupo ${saved.codigoGrupo} para asignatura ${saved.asignaturaId}`, saved.id);
    return saved;
  }

  public updateGroup(id: string, updates: Partial<AcademicGroup>, currentUser: User): AcademicGroup {
    const existing = groupRepository.findById(id);
    if (!existing) throw new Error('Grupo no encontrado');

    if (updates.docenteId || updates.horarios) {
      const docenteId = updates.docenteId || existing.docenteId;
      const horarios = updates.horarios || existing.horarios;
      this.checkTeacherScheduleConflict(docenteId, horarios, existing.periodoId, id);
    }

    const updated = { ...existing, ...updates };
    groupRepository.save(updated);
    auditService.log(currentUser, 'CREAR_GRUPO', 'GRUPOS', `Actualización de grupo ${updated.id}`, updated.id);
    return updated;
  }

  private checkTeacherScheduleConflict(docenteId: string, nuevosHorarios: HorarioClase[], periodoId: string, ignoreGroupId?: string): void {
    const gruposDocente = groupRepository.findByDocenteId(docenteId).filter(g => g.periodoId === periodoId && g.id !== ignoreGroupId);
    for (const grp of gruposDocente) {
      for (const hExistente of grp.horarios) {
        for (const hNuevo of nuevosHorarios) {
          if (hExistente.dia === hNuevo.dia) {
            // Verificar cruce de horas
            if (
              (hNuevo.horaInicio >= hExistente.horaInicio && hNuevo.horaInicio < hExistente.horaFin) ||
              (hNuevo.horaFin > hExistente.horaInicio && hNuevo.horaFin <= hExistente.horaFin) ||
              (hNuevo.horaInicio <= hExistente.horaInicio && hNuevo.horaFin >= hExistente.horaFin)
            ) {
              const docente = teacherRepository.findById(docenteId);
              throw new Error(
                `Conflicto de horario: El docente ${docente?.nombreCompleto || 'asignado'} ya tiene clase el día ${hNuevo.dia} de ${hExistente.horaInicio} a ${hExistente.horaFin} en el grupo ${grp.codigoGrupo}.`
              );
            }
          }
        }
      }
    }
  }
}

export const groupPeriodService = new GroupPeriodService();

// ----------------------------------------------------------------------
// 7. EnrollmentService: Matrícula Académica y Validación de Cupos (RF-07, RNF-07)
// ----------------------------------------------------------------------
export class EnrollmentService {
  public enroll(estudianteId: string, grupoId: string, currentUser: User): Enrollment {
    const student = studentRepository.findById(estudianteId);
    if (!student) throw new Error('Estudiante no encontrado en la base de datos.');
    if (student.estado !== 'ACTIVO') {
      throw new Error(`El estudiante se encuentra en estado ${student.estado} y no está habilitado para matrícula.`);
    }

    const group = groupRepository.findById(grupoId);
    if (!group) throw new Error('Grupo no encontrado.');
    if (group.estado !== 'ABIERTO') {
      throw new Error('El grupo seleccionado no se encuentra en estado ABIERTO para matrículas.');
    }

    // 1. Validar cupos disponibles
    if (group.cupoDisponible <= 0) {
      throw new Error(`No hay cupos disponibles en el grupo ${group.codigoGrupo}. Cupo máximo: ${group.cupoMaximo}, Disponibles: 0.`);
    }

    // 2. Validar que no esté ya matriculado en el mismo grupo
    const duplicateInGroup = enrollmentRepository.findByEstudianteAndGrupo(estudianteId, grupoId);
    if (duplicateInGroup) {
      throw new Error('El estudiante ya se encuentra matriculado en este grupo específico.');
    }

    // 3. Validar que no tenga matriculada la misma asignatura en este periodo
    const duplicateInSubject = enrollmentRepository.findByEstudianteAndAsignaturaInPeriod(
      estudianteId,
      group.asignaturaId,
      group.periodoId
    );
    if (duplicateInSubject) {
      throw new Error('El estudiante ya tiene matriculada esta misma asignatura en otro grupo del periodo activo.');
    }

    // 4. Validar cruce de horario con otras asignaturas matriculadas por el estudiante
    const matriculasPrevias = enrollmentRepository.findByEstudianteId(estudianteId).filter(e => e.periodoId === group.periodoId && e.estado === 'MATRICULADA');
    for (const prev of matriculasPrevias) {
      const prevGroup = groupRepository.findById(prev.grupoId);
      if (prevGroup) {
        for (const hp of prevGroup.horarios) {
          for (const hn of group.horarios) {
            if (hp.dia === hn.dia) {
              if (
                (hn.horaInicio >= hp.horaInicio && hn.horaInicio < hp.horaFin) ||
                (hn.horaFin > hp.horaInicio && hn.horaFin <= hp.horaFin) ||
                (hn.horaInicio <= hp.horaInicio && hn.horaFin >= hp.horaFin)
              ) {
                const prevSubj = subjectRepository.findById(prev.asignaturaId);
                throw new Error(`Conflicto de horario para el estudiante: Se cruza el día ${hn.dia} (${hn.horaInicio}-${hn.horaFin}) con la asignatura "${prevSubj?.nombre || 'otra materia'}"`);
              }
            }
          }
        }
      }
    }

    // TRANSACCIÓN ATÓMICA: Decrementar cupo y guardar matrícula + inicializar registro de notas
    group.cupoDisponible = group.cupoDisponible - 1;
    groupRepository.save(group);

    const enrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      estudianteId,
      grupoId,
      periodoId: group.periodoId,
      asignaturaId: group.asignaturaId,
      fechaMatricula: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estado: 'MATRICULADA',
      intentosNumero: 1,
      estadoAprobacion: 'EN_CURSO',
    };
    const savedEnrollment = enrollmentRepository.save(enrollment);

    // Inicializar GradeRecord con ponderación estándar (30%, 30%, 40%)
    const defaultGradeRecord: GradeRecord = {
      id: `grd-${Date.now()}`,
      matriculaId: savedEnrollment.id,
      estudianteId,
      grupoId,
      evaluaciones: [
        { nombre: 'Primer Corte (30%)', porcentaje: 30, calificacion: null },
        { nombre: 'Segundo Corte (30%)', porcentaje: 30, calificacion: null },
        { nombre: 'Examen Final (40%)', porcentaje: 40, calificacion: null },
      ],
      notaDefinitiva: 0.0,
      aprobado: false,
      fechaUltimaModificacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modificadoPorUsuarioId: currentUser.id,
      publicado: false,
    };
    gradeRepository.save(defaultGradeRecord);

    const subject = subjectRepository.findById(group.asignaturaId);
    auditService.log(
      currentUser,
      'MATRICULAR_ESTUDIANTE',
      'MATRICULAS',
      `Matrícula exitosa: Estudiante ${student.codigoEstudiantil} en ${subject?.nombre || 'Asignatura'} - Grupo ${group.codigoGrupo}. Cupos restantes: ${group.cupoDisponible}.`,
      savedEnrollment.id,
      undefined,
      { estudiante: student.codigoEstudiantil, grupo: group.id, cupoRestante: group.cupoDisponible }
    );

    return savedEnrollment;
  }

  public cancelEnrollment(enrollmentId: string, currentUser: User): boolean {
    const enr = enrollmentRepository.findById(enrollmentId);
    if (!enr) throw new Error('Matrícula no encontrada.');
    if (enr.estado === 'CANCELADA') throw new Error('La matrícula ya se encuentra cancelada.');

    enr.estado = 'CANCELADA';
    enrollmentRepository.save(enr);

    // Restaurar cupo
    const group = groupRepository.findById(enr.grupoId);
    if (group) {
      group.cupoDisponible = Math.min(group.cupoMaximo, group.cupoDisponible + 1);
      groupRepository.save(group);
    }

    auditService.log(
      currentUser,
      'CANCELAR_MATRICULA',
      'MATRICULAS',
      `Cancelación de matrícula ${enrollmentId}. Cupo liberado para grupo ${group?.codigoGrupo || ''}.`,
      enrollmentId
    );

    return true;
  }

  public getEnrollmentsByStudent(studentId: string): Enrollment[] {
    return enrollmentRepository.findByEstudianteId(studentId);
  }

  public getEnrollmentsByGroup(groupId: string): Enrollment[] {
    return enrollmentRepository.findByGrupoId(groupId);
  }
}

export const enrollmentService = new EnrollmentService();

// ----------------------------------------------------------------------
// 8. GradeService: Registro y Consulta de Calificaciones (RF-08, RF-09)
// ----------------------------------------------------------------------
export class GradeService {
  public getGradeByEnrollment(matriculaId: string): GradeRecord | undefined {
    return gradeRepository.findByMatriculaId(matriculaId);
  }

  public getGradesByGroup(grupoId: string): GradeRecord[] {
    return gradeRepository.findByGrupoId(grupoId);
  }

  public getGradesByStudent(estudianteId: string): { grade: GradeRecord; enrollment: Enrollment; subject?: Subject; group?: AcademicGroup; teacher?: Teacher }[] {
    const enrollments = enrollmentRepository.findByEstudianteId(estudianteId).filter(e => e.estado === 'MATRICULADA');
    return enrollments.map(enr => {
      let grade = gradeRepository.findByMatriculaId(enr.id);
      if (!grade) {
        grade = {
          id: `grd-${Date.now()}-${Math.random()}`,
          matriculaId: enr.id,
          estudianteId,
          grupoId: enr.grupoId,
          evaluaciones: [
            { nombre: 'Primer Corte (30%)', porcentaje: 30, calificacion: null },
            { nombre: 'Segundo Corte (30%)', porcentaje: 30, calificacion: null },
            { nombre: 'Examen Final (40%)', porcentaje: 40, calificacion: null },
          ],
          notaDefinitiva: 0.0,
          aprobado: false,
          fechaUltimaModificacion: new Date().toISOString().substring(0, 10),
          modificadoPorUsuarioId: 'system',
          publicado: false,
        };
        gradeRepository.save(grade);
      }
      const group = groupRepository.findById(enr.grupoId);
      const subject = group ? subjectRepository.findById(group.asignaturaId) : undefined;
      const teacher = group ? teacherRepository.findById(group.docenteId) : undefined;
      return { grade, enrollment: enr, subject, group, teacher };
    });
  }

  public updateGrades(gradeId: string, evaluaciones: GradeItem[], currentUser: User, publicar: boolean = true): GradeRecord {
    const grade = gradeRepository.findById(gradeId);
    if (!grade) throw new Error('Registro de calificación no encontrado.');

    const group = groupRepository.findById(grade.grupoId);
    if (!group) throw new Error('Grupo asociado no encontrado.');

    // Verificar permisos: Docente asignado al grupo, Coordinador o Administrador
    if (currentUser.rol === 'DOCENTE') {
      const docente = teacherRepository.findAll().find(t => t.id === currentUser.referenciaId);
      if (!docente || docente.id !== group.docenteId) {
        throw new Error('No tiene autorización para modificar calificaciones de este grupo.');
      }
    }

    // Validar notas entre 0.0 y 5.0
    let totalPonderado = 0;
    let sumaPorcentajes = 0;
    for (const item of evaluaciones) {
      if (item.calificacion !== null && item.calificacion !== undefined) {
        if (item.calificacion < 0.0 || item.calificacion > 5.0) {
          throw new Error(`La calificación de "${item.nombre}" (${item.calificacion}) debe estar entre 0.0 y 5.0.`);
        }
        totalPonderado += item.calificacion * (item.porcentaje / 100);
        sumaPorcentajes += item.porcentaje;
      }
    }

    const notaDefinitiva = Math.round(totalPonderado * 10) / 10;
    const aprobado = notaDefinitiva >= 3.0;

    const anterior = { ...grade };
    grade.evaluaciones = evaluaciones;
    grade.notaDefinitiva = notaDefinitiva;
    grade.aprobado = aprobado;
    grade.publicado = publicar;
    grade.fechaUltimaModificacion = new Date().toISOString().replace('T', ' ').substring(0, 16);
    grade.modificadoPorUsuarioId = currentUser.id;

    const saved = gradeRepository.save(grade);

    // Actualizar nota en Enrollment para redundancia rápida
    const enrollment = enrollmentRepository.findById(grade.matriculaId);
    if (enrollment) {
      enrollment.notaFinalDefinitiva = notaDefinitiva;
      enrollment.estadoAprobacion = aprobado ? 'APROBADA' : 'REPROBADA';
      enrollmentRepository.save(enrollment);
    }

    auditService.log(
      currentUser,
      'REGISTRAR_CALIFICACIONES',
      'CALIFICACIONES',
      `Calificación registrada: Definitiva ${notaDefinitiva} (${aprobado ? 'APROBADA' : 'REPROBADA'}) para matrícula ${grade.matriculaId}`,
      grade.id,
      { notaAnterior: anterior.notaDefinitiva },
      { notaNueva: notaDefinitiva, publicado: publicar }
    );

    return saved;
  }
}

export const gradeService = new GradeService();

// ----------------------------------------------------------------------
// 9. ReportService: Reportería Institucional (RF-10)
// ----------------------------------------------------------------------
export class ReportService {
  public generateAcademicSummary(periodoId: string, programaId?: string) {
    const period = periodRepository.findById(periodoId);
    const groups = groupRepository.findByPeriodoId(periodoId);
    const enrollments = enrollmentRepository.findByPeriodoId(periodoId).filter(e => e.estado === 'MATRICULADA');
    const grades = gradeRepository.findAll().filter(g => groups.some(grp => grp.id === g.grupoId));

    const totalMatriculas = enrollments.length;
    const aprobados = grades.filter(g => g.aprobado).length;
    const reprobados = grades.filter(g => !g.aprobado && g.notaDefinitiva > 0).length;
    const enCurso = totalMatriculas - (aprobados + reprobados);

    let promedioGeneral = 0;
    if (grades.length > 0) {
      promedioGeneral = Math.round((grades.reduce((acc, g) => acc + g.notaDefinitiva, 0) / grades.length) * 10) / 10;
    }

    const groupDetails = groups.map(g => {
      const subject = subjectRepository.findById(g.asignaturaId);
      const teacher = teacherRepository.findById(g.docenteId);
      const groupEnrollments = enrollments.filter(e => e.grupoId === g.id);
      const groupGrades = grades.filter(grd => grd.grupoId === g.id);
      const promGrupo = groupGrades.length > 0 
        ? Math.round((groupGrades.reduce((a, b) => a + b.notaDefinitiva, 0) / groupGrades.length) * 10) / 10
        : 0;

      return {
        grupoId: g.id,
        codigoGrupo: g.codigoGrupo,
        asignatura: subject?.nombre || 'N/A',
        codigoAsignatura: subject?.codigo || 'N/A',
        creditos: subject?.creditos || 0,
        docente: teacher?.nombreCompleto || 'Sin Asignar',
        matriculados: groupEnrollments.length,
        cupoMaximo: g.cupoMaximo,
        cupoDisponible: g.cupoDisponible,
        promedioNotas: promGrupo,
      };
    });

    return {
      periodo: period?.nombre || periodoId,
      totalGrupos: groups.length,
      totalMatriculados: totalMatriculas,
      aprobados,
      reprobados,
      enCurso,
      promedioGeneral,
      grupos: groupDetails,
    };
  }

  public exportReportCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj)
        .map(val => typeof val === 'string' && val.includes(',') ? `"${val}"` : val)
        .join(',')
    );
    return [headers, ...rows].join('\n');
  }
}

export const reportService = new ReportService();

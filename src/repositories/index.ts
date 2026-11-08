/**
 * SIGA - Capa de Acceso a Datos (Data Access Layer / Spring Data JPA Repositories)
 * Patrón Repository / DAO que desacopla la persistencia de las reglas de negocio.
 * Simula interfaces JpaRepository<T, ID> con métodos derivados de consulta.
 */

import { 
  User, Student, Teacher, AcademicProgram, Subject, 
  AcademicPeriod, AcademicGroup, Enrollment, GradeRecord, AuditLog 
} from '../types';
import { dbStorage } from '../db/storage';

export interface BaseRepository<T, ID> {
  findById(id: ID): T | undefined;
  findAll(): T[];
  save(entity: T): T;
  deleteById(id: ID): boolean;
  existsById(id: ID): boolean;
}

// 1. UserRepository
export class UserRepository implements BaseRepository<User, string> {
  findById(id: string): User | undefined {
    return dbStorage.getUsers().find(u => u.id === id);
  }
  findByUsername(username: string): User | undefined {
    return dbStorage.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }
  findByEmail(email: string): User | undefined {
    return dbStorage.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findAll(): User[] {
    return dbStorage.getUsers();
  }
  save(user: User): User {
    const list = dbStorage.getUsers();
    const index = list.findIndex(u => u.id === user.id);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    dbStorage.saveUsers(list);
    return user;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getUsers();
    const filtered = list.filter(u => u.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveUsers(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 2. StudentRepository
export class StudentRepository implements BaseRepository<Student, string> {
  findById(id: string): Student | undefined {
    return dbStorage.getStudents().find(s => s.id === id);
  }
  findByCodigoEstudiantil(codigo: string): Student | undefined {
    return dbStorage.getStudents().find(s => s.codigoEstudiantil.toLowerCase() === codigo.toLowerCase().trim());
  }
  findByNumeroDocumento(doc: string): Student | undefined {
    return dbStorage.getStudents().find(s => s.numeroDocumento.trim() === doc.trim());
  }
  findByEmailInstitucional(email: string): Student | undefined {
    return dbStorage.getStudents().find(s => s.emailInstitucional.toLowerCase() === email.toLowerCase().trim());
  }
  findByProgramaId(programaId: string): Student[] {
    return dbStorage.getStudents().filter(s => s.programaId === programaId);
  }
  findAll(): Student[] {
    return dbStorage.getStudents();
  }
  save(student: Student): Student {
    const list = dbStorage.getStudents();
    const index = list.findIndex(s => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
    } else {
      list.push(student);
    }
    dbStorage.saveStudents(list);
    return student;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getStudents();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveStudents(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 3. TeacherRepository
export class TeacherRepository implements BaseRepository<Teacher, string> {
  findById(id: string): Teacher | undefined {
    return dbStorage.getTeachers().find(t => t.id === id);
  }
  findByCodigoDocente(codigo: string): Teacher | undefined {
    return dbStorage.getTeachers().find(t => t.codigoDocente.toLowerCase() === codigo.toLowerCase().trim());
  }
  findByNumeroDocumento(doc: string): Teacher | undefined {
    return dbStorage.getTeachers().find(t => t.numeroDocumento.trim() === doc.trim());
  }
  findByDepartamento(depto: string): Teacher[] {
    return dbStorage.getTeachers().filter(t => t.departamento.toLowerCase().includes(depto.toLowerCase()));
  }
  findAll(): Teacher[] {
    return dbStorage.getTeachers();
  }
  save(teacher: Teacher): Teacher {
    const list = dbStorage.getTeachers();
    const index = list.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      list[index] = teacher;
    } else {
      list.push(teacher);
    }
    dbStorage.saveTeachers(list);
    return teacher;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getTeachers();
    const filtered = list.filter(t => t.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveTeachers(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 4. ProgramRepository
export class ProgramRepository implements BaseRepository<AcademicProgram, string> {
  findById(id: string): AcademicProgram | undefined {
    return dbStorage.getPrograms().find(p => p.id === id);
  }
  findByCodigo(codigo: string): AcademicProgram | undefined {
    return dbStorage.getPrograms().find(p => p.codigo.toLowerCase() === codigo.toLowerCase().trim());
  }
  findAll(): AcademicProgram[] {
    return dbStorage.getPrograms();
  }
  save(prog: AcademicProgram): AcademicProgram {
    const list = dbStorage.getPrograms();
    const index = list.findIndex(p => p.id === prog.id);
    if (index >= 0) {
      list[index] = prog;
    } else {
      list.push(prog);
    }
    dbStorage.savePrograms(list);
    return prog;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getPrograms();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.savePrograms(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 5. SubjectRepository
export class SubjectRepository implements BaseRepository<Subject, string> {
  findById(id: string): Subject | undefined {
    return dbStorage.getSubjects().find(s => s.id === id);
  }
  findByCodigo(codigo: string): Subject | undefined {
    return dbStorage.getSubjects().find(s => s.codigo.toLowerCase() === codigo.toLowerCase().trim());
  }
  findByProgramaId(programaId: string): Subject[] {
    return dbStorage.getSubjects().filter(s => s.programaId === programaId);
  }
  findAll(): Subject[] {
    return dbStorage.getSubjects();
  }
  save(subj: Subject): Subject {
    const list = dbStorage.getSubjects();
    const index = list.findIndex(s => s.id === subj.id);
    if (index >= 0) {
      list[index] = subj;
    } else {
      list.push(subj);
    }
    dbStorage.saveSubjects(list);
    return subj;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getSubjects();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveSubjects(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 6. PeriodRepository
export class PeriodRepository implements BaseRepository<AcademicPeriod, string> {
  findById(id: string): AcademicPeriod | undefined {
    return dbStorage.getPeriods().find(p => p.id === id);
  }
  findActivePeriod(): AcademicPeriod | undefined {
    return dbStorage.getPeriods().find(p => p.esPeriodoActivo);
  }
  findByCodigo(codigo: string): AcademicPeriod | undefined {
    return dbStorage.getPeriods().find(p => p.codigo.toLowerCase() === codigo.toLowerCase().trim());
  }
  findAll(): AcademicPeriod[] {
    return dbStorage.getPeriods();
  }
  save(period: AcademicPeriod): AcademicPeriod {
    const list = dbStorage.getPeriods();
    if (period.esPeriodoActivo) {
      // solo puede haber uno activo
      list.forEach(p => { if (p.id !== period.id) p.esPeriodoActivo = false; });
    }
    const index = list.findIndex(p => p.id === period.id);
    if (index >= 0) {
      list[index] = period;
    } else {
      list.push(period);
    }
    dbStorage.savePeriods(list);
    return period;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getPeriods();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.savePeriods(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 7. GroupRepository
export class GroupRepository implements BaseRepository<AcademicGroup, string> {
  findById(id: string): AcademicGroup | undefined {
    return dbStorage.getGroups().find(g => g.id === id);
  }
  findByPeriodoId(periodoId: string): AcademicGroup[] {
    return dbStorage.getGroups().filter(g => g.periodoId === periodoId);
  }
  findByDocenteId(docenteId: string): AcademicGroup[] {
    return dbStorage.getGroups().filter(g => g.docenteId === docenteId);
  }
  findByAsignaturaId(asignaturaId: string): AcademicGroup[] {
    return dbStorage.getGroups().filter(g => g.asignaturaId === asignaturaId);
  }
  findAll(): AcademicGroup[] {
    return dbStorage.getGroups();
  }
  save(group: AcademicGroup): AcademicGroup {
    const list = dbStorage.getGroups();
    const index = list.findIndex(g => g.id === group.id);
    if (index >= 0) {
      list[index] = group;
    } else {
      list.push(group);
    }
    dbStorage.saveGroups(list);
    return group;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getGroups();
    const filtered = list.filter(g => g.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveGroups(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 8. EnrollmentRepository
export class EnrollmentRepository implements BaseRepository<Enrollment, string> {
  findById(id: string): Enrollment | undefined {
    return dbStorage.getEnrollments().find(e => e.id === id);
  }
  findByEstudianteId(estudianteId: string): Enrollment[] {
    return dbStorage.getEnrollments().filter(e => e.estudianteId === estudianteId);
  }
  findByGrupoId(grupoId: string): Enrollment[] {
    return dbStorage.getEnrollments().filter(e => e.grupoId === grupoId);
  }
  findByPeriodoId(periodoId: string): Enrollment[] {
    return dbStorage.getEnrollments().filter(e => e.periodoId === periodoId);
  }
  findByEstudianteAndGrupo(estudianteId: string, grupoId: string): Enrollment | undefined {
    return dbStorage.getEnrollments().find(e => e.estudianteId === estudianteId && e.grupoId === grupoId && e.estado === 'MATRICULADA');
  }
  findByEstudianteAndAsignaturaInPeriod(estudianteId: string, asignaturaId: string, periodoId: string): Enrollment | undefined {
    return dbStorage.getEnrollments().find(e => 
      e.estudianteId === estudianteId && 
      e.asignaturaId === asignaturaId && 
      e.periodoId === periodoId && 
      e.estado === 'MATRICULADA'
    );
  }
  findAll(): Enrollment[] {
    return dbStorage.getEnrollments();
  }
  save(enr: Enrollment): Enrollment {
    const list = dbStorage.getEnrollments();
    const index = list.findIndex(e => e.id === enr.id);
    if (index >= 0) {
      list[index] = enr;
    } else {
      list.push(enr);
    }
    dbStorage.saveEnrollments(list);
    return enr;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getEnrollments();
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveEnrollments(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 9. GradeRepository
export class GradeRepository implements BaseRepository<GradeRecord, string> {
  findById(id: string): GradeRecord | undefined {
    return dbStorage.getGrades().find(g => g.id === id);
  }
  findByMatriculaId(matriculaId: string): GradeRecord | undefined {
    return dbStorage.getGrades().find(g => g.matriculaId === matriculaId);
  }
  findByGrupoId(grupoId: string): GradeRecord[] {
    return dbStorage.getGrades().filter(g => g.grupoId === grupoId);
  }
  findByEstudianteId(estudianteId: string): GradeRecord[] {
    return dbStorage.getGrades().filter(g => g.estudianteId === estudianteId);
  }
  findAll(): GradeRecord[] {
    return dbStorage.getGrades();
  }
  save(grade: GradeRecord): GradeRecord {
    const list = dbStorage.getGrades();
    const index = list.findIndex(g => g.id === grade.id);
    if (index >= 0) {
      list[index] = grade;
    } else {
      list.push(grade);
    }
    dbStorage.saveGrades(list);
    return grade;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getGrades();
    const filtered = list.filter(g => g.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveGrades(filtered);
      return true;
    }
    return false;
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// 10. AuditRepository
export class AuditRepository implements BaseRepository<AuditLog, string> {
  findById(id: string): AuditLog | undefined {
    return dbStorage.getAuditLogs().find(a => a.id === id);
  }
  findAll(): AuditLog[] {
    // Retorna ordenado descendente por fecha
    return [...dbStorage.getAuditLogs()].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
  }
  save(log: AuditLog): AuditLog {
    const list = dbStorage.getAuditLogs();
    list.unshift(log); // primero los mas recientes
    dbStorage.saveAuditLogs(list);
    return log;
  }
  deleteById(id: string): boolean {
    const list = dbStorage.getAuditLogs();
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length !== list.length) {
      dbStorage.saveAuditLogs(filtered);
      return true;
    }
    return false;
  }
  purgeByTerm(term: string): number {
    return dbStorage.purgeAuditLogsByTerm(term);
  }
  existsById(id: string): boolean {
    return !!this.findById(id);
  }
}

// Singleton repository instances
export const userRepository = new UserRepository();
export const studentRepository = new StudentRepository();
export const teacherRepository = new TeacherRepository();
export const programRepository = new ProgramRepository();
export const subjectRepository = new SubjectRepository();
export const periodRepository = new PeriodRepository();
export const groupRepository = new GroupRepository();
export const enrollmentRepository = new EnrollmentRepository();
export const gradeRepository = new GradeRepository();
export const auditRepository = new AuditRepository();

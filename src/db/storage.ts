/**
 * SIGA - Motor de Persistencia y Almacenamiento
 * Capa de Infraestructura de Datos (Data Store & Local Storage Sync)
 * Soporta atomicidad, snapshots de respaldo institucional (RNF-09) y restauración.
 */
import { 
  User, Student, Teacher, AcademicProgram, Subject, 
  AcademicPeriod, AcademicGroup, Enrollment, GradeRecord, AuditLog 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_STUDENTS, INITIAL_TEACHERS, 
  INITIAL_PROGRAMS, INITIAL_SUBJECTS, INITIAL_PERIODS, 
  INITIAL_GROUPS, INITIAL_ENROLLMENTS, INITIAL_GRADES, INITIAL_AUDIT_LOGS 
} from './initialData';

export interface DatabaseSnapshot {
  version: string;
  timestamp: string;
  users: User[];
  students: Student[];
  teachers: Teacher[];
  programs: AcademicProgram[];
  subjects: Subject[];
  periods: AcademicPeriod[];
  groups: AcademicGroup[];
  enrollments: Enrollment[];
  grades: GradeRecord[];
  auditLogs: AuditLog[];
}

const STORAGE_KEYS = {
  USERS: 'siga_db_users',
  STUDENTS: 'siga_db_students',
  TEACHERS: 'siga_db_teachers',
  PROGRAMS: 'siga_db_programs',
  SUBJECTS: 'siga_db_subjects',
  PERIODS: 'siga_db_periods',
  GROUPS: 'siga_db_groups',
  ENROLLMENTS: 'siga_db_enrollments',
  GRADES: 'siga_db_grades',
  AUDIT: 'siga_db_audit_logs',
  SESSION: 'siga_active_session',
};

class StorageEngine {
  private cache: DatabaseSnapshot | null = null;

  constructor() {
    this.initializeIfEmpty();
    // Eliminación permanente y proactiva del rastro de Johan Pava
    this.purgeAuditLogsByTerm('johan');
    this.purgeAuditLogsByTerm('pava');
    this.purgeStudentByTerm('johan');
    this.purgeStudentByTerm('pava');
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota or security restriction in browser:', e);
    }
  }

  /**
   * Elimina permanentemente cualquier registro de auditoría que contenga el término especificado
   * en descripción, usuario, acción o detalles estructurados (Habeas Data / RNF-11).
   */
  public purgeAuditLogsByTerm(term: string): number {
    const logs = this.getAuditLogs();
    const termLower = term.toLowerCase().trim();
    const filtered = logs.filter(l => {
      const desc = (l.descripcion || '').toLowerCase();
      const user = (l.usuarioNombre || '').toLowerCase();
      const accion = (l.accion || '').toLowerCase();
      const id = (l.registroAfectadoId || '').toLowerCase();
      const antes = l.detallesAntes ? JSON.stringify(l.detallesAntes).toLowerCase() : '';
      const despues = l.detallesDespues ? JSON.stringify(l.detallesDespues).toLowerCase() : '';
      
      const contains = desc.includes(termLower) || 
                       user.includes(termLower) || 
                       accion.includes(termLower) || 
                       id.includes(termLower) || 
                       antes.includes(termLower) || 
                       despues.includes(termLower);
      return !contains;
    });

    const removed = logs.length - filtered.length;
    if (removed > 0 || logs.length !== filtered.length) {
      this.saveAuditLogs(filtered);
    }
    return removed;
  }

  /**
   * Elimina permanentemente registros de estudiante o usuario asociados al término
   */
  public purgeStudentByTerm(term: string): void {
    const termLower = term.toLowerCase().trim();
    // Estudiantes
    const students = this.getStudents();
    const remainingStudents = students.filter(s => {
      const full = `${s.primerNombre} ${s.segundoNombre || ''} ${s.primerApellido} ${s.segundoApellido || ''} ${s.emailInstitucional} ${s.emailPersonal || ''}`.toLowerCase();
      return !full.includes(termLower);
    });
    if (students.length !== remainingStudents.length) {
      this.saveStudents(remainingStudents);
    }

    // Usuarios
    const users = this.getUsers();
    const remainingUsers = users.filter(u => {
      const full = `${u.nombreCompleto} ${u.username} ${u.email}`.toLowerCase();
      return !full.includes(termLower);
    });
    if (users.length !== remainingUsers.length) {
      this.saveUsers(remainingUsers);
    }
  }

  public initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.setItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    this.setItem(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    this.setItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    this.setItem(STORAGE_KEYS.PERIODS, INITIAL_PERIODS);
    this.setItem(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    this.setItem(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    this.setItem(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    this.setItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    this.cache = null;
  }

  // Getters
  public getUsers(): User[] { return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS); }
  public getStudents(): Student[] { return this.getItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS); }
  public getTeachers(): Teacher[] { return this.getItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS); }
  public getPrograms(): AcademicProgram[] { return this.getItem(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS); }
  public getSubjects(): Subject[] { return this.getItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS); }
  public getPeriods(): AcademicPeriod[] { return this.getItem(STORAGE_KEYS.PERIODS, INITIAL_PERIODS); }
  public getGroups(): AcademicGroup[] { return this.getItem(STORAGE_KEYS.GROUPS, INITIAL_GROUPS); }
  public getEnrollments(): Enrollment[] { return this.getItem(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS); }
  public getGrades(): GradeRecord[] { return this.getItem(STORAGE_KEYS.GRADES, INITIAL_GRADES); }
  public getAuditLogs(): AuditLog[] { return this.getItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS); }

  // Setters
  public saveUsers(users: User[]): void { this.setItem(STORAGE_KEYS.USERS, users); }
  public saveStudents(students: Student[]): void { this.setItem(STORAGE_KEYS.STUDENTS, students); }
  public saveTeachers(teachers: Teacher[]): void { this.setItem(STORAGE_KEYS.TEACHERS, teachers); }
  public savePrograms(programs: AcademicProgram[]): void { this.setItem(STORAGE_KEYS.PROGRAMS, programs); }
  public saveSubjects(subjects: Subject[]): void { this.setItem(STORAGE_KEYS.SUBJECTS, subjects); }
  public savePeriods(periods: AcademicPeriod[]): void { this.setItem(STORAGE_KEYS.PERIODS, periods); }
  public saveGroups(groups: AcademicGroup[]): void { this.setItem(STORAGE_KEYS.GROUPS, groups); }
  public saveEnrollments(enrollments: Enrollment[]): void { this.setItem(STORAGE_KEYS.ENROLLMENTS, enrollments); }
  public saveGrades(grades: GradeRecord[]): void { this.setItem(STORAGE_KEYS.GRADES, grades); }
  public saveAuditLogs(logs: AuditLog[]): void { this.setItem(STORAGE_KEYS.AUDIT, logs); }

  // Session
  public getActiveSession(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.SESSION, INITIAL_USERS[0]); // default admin
  }

  public setActiveSession(user: User | null): void {
    if (user) {
      this.setItem(STORAGE_KEYS.SESSION, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  // Backup & Recovery (RNF-09)
  public createBackupSnapshot(): DatabaseSnapshot {
    return {
      version: '1.0.0-PROD',
      timestamp: new Date().toISOString(),
      users: this.getUsers(),
      students: this.getStudents(),
      teachers: this.getTeachers(),
      programs: this.getPrograms(),
      subjects: this.getSubjects(),
      periods: this.getPeriods(),
      groups: this.getGroups(),
      enrollments: this.getEnrollments(),
      grades: this.getGrades(),
      auditLogs: this.getAuditLogs(),
    };
  }

  public restoreBackupSnapshot(snapshot: DatabaseSnapshot): boolean {
    if (!snapshot || !snapshot.version || !snapshot.students) {
      throw new Error('El archivo de respaldo no cuenta con la estructura válida del esquema SIGA.');
    }
    this.saveUsers(snapshot.users || []);
    this.saveStudents(snapshot.students || []);
    this.saveTeachers(snapshot.teachers || []);
    this.savePrograms(snapshot.programs || []);
    this.saveSubjects(snapshot.subjects || []);
    this.savePeriods(snapshot.periods || []);
    this.saveGroups(snapshot.groups || []);
    this.saveEnrollments(snapshot.enrollments || []);
    this.saveGrades(snapshot.grades || []);
    this.saveAuditLogs(snapshot.auditLogs || []);
    return true;
  }
}

export const dbStorage = new StorageEngine();

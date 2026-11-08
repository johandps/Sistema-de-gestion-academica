/**
 * SIGA - Documento de Arquitectura de Software Institucional
 * Autor: Arquitecto de Software Senior (5+ años de experiencia)
 * Patrón: Arquitectura en Capas (Layered / N-Tier Architecture)
 * Homologación: Spring Boot 3.x + Spring Data JPA / Hibernate + React 19 SPA
 */

export interface LayerDefinition {
  nombre: string;
  tecnologias: string[];
  responsabilidad: string;
  patrones: string[];
  componentes: string[];
  javaSpringBootMapping: string;
}

export interface RequirementTrace {
  id: string;
  tipo: 'RF' | 'RNF';
  nombre: string;
  descripcion: string;
  capasAfectadas: string[];
  componentesImplementadores: string[];
  estado: 'IMPLEMENTADO' | 'VALIDADO';
  evidencia: string;
}

export const ARCHITECTURE_LAYERS: LayerDefinition[] = [
  {
    nombre: '1. Capa de Presentación (UI & Client-Side Controller)',
    tecnologias: ['React 19', 'Tailwind CSS v4', 'Lucide Icons', 'Motion', 'Responsive Design'],
    responsabilidad: 'Renderizado de vistas reactivas, gestión de estado local, captura de eventos de usuario, navegación contextual por rol (RBAC) y feedback visual inmediato.',
    patrones: ['Component-Based Architecture', 'Controlled Forms', 'Optimistic UI', 'Context Provider'],
    componentes: ['App.tsx', 'Navbar.tsx', 'Sidebar.tsx', 'StudentManagement.tsx', 'EnrollmentManagement.tsx', 'GradeManagement.tsx', 'StudentPortal.tsx', 'AcademicReports.tsx'],
    javaSpringBootMapping: 'Frontend desacoplado consumiendo Spring Boot REST APIs con tokens JWT (Bearer Auth).'
  },
  {
    nombre: '2. Capa de Controladores REST (API Controller Layer)',
    tecnologias: ['RESTful APIs', 'JSON DTOs', 'HTTP Status Codes', 'Spring Web / Express Dispatcher'],
    responsabilidad: 'Exposición de endpoints REST normalizados, validación de esquemas de entrada (Input DTOs), autorización basada en roles (RBAC) y serialización de respuestas.',
    patrones: ['Front Controller', 'Data Transfer Object (DTO)', 'Interceptor / Filter Pattern', 'Global Exception Handler'],
    componentes: ['ApiController (Dispatcher)', 'AuthFilter', 'GlobalExceptionHandler', 'Swagger/OpenAPI Explorer'],
    javaSpringBootMapping: '@RestController, @RequestMapping("/api/v1/*"), @PreAuthorize("hasRole(...)"), ResponseEntity<T>, @Valid'
  },
  {
    nombre: '3. Capa de Lógica de Negocio y Servicios (Business Service Layer)',
    tecnologias: ['Domain-Driven Logic', 'Declarative Transactions', 'Audit Event Bus'],
    responsabilidad: 'Orquestación de procesos institucionales: validación atómica de cupos disponibles, detección de solapamiento de horarios, cálculo ponderado de cortes de notas y registro inmutable de auditoría.',
    patrones: ['Service Layer Pattern', 'Domain Model', 'Unit of Work / Transaction Script', 'Observer / Audit Event'],
    componentes: ['AuthService', 'StudentService', 'TeacherService', 'AcademicService', 'GroupPeriodService', 'EnrollmentService', 'GradeService', 'ReportService', 'AuditService'],
    javaSpringBootMapping: '@Service, @Transactional(propagation = REQUIRED, rollbackFor = Exception.class), BusinessException'
  },
  {
    nombre: '4. Capa de Persistencia y Acceso a Datos (Repository & DAO Layer)',
    tecnologias: ['Spring Data JPA', 'Hibernate ORM', 'Relational Schemas', 'ACID Store'],
    responsabilidad: 'Abstracción de operaciones CRUD, consultas parametrizadas, gestión de claves foráneas, prevención de N+1 queries, soporte de respaldo snapshot en caliente (Backup & Restore).',
    patrones: ['Repository Pattern', 'Data Mapper', 'Identity Map', 'Snapshot Memento'],
    componentes: ['UserRepository', 'StudentRepository', 'TeacherRepository', 'ProgramRepository', 'SubjectRepository', 'PeriodRepository', 'GroupRepository', 'EnrollmentRepository', 'GradeRepository', 'AuditRepository', 'StorageEngine'],
    javaSpringBootMapping: 'interface StudentRepository extends JpaRepository<Student, UUID>, Hibernate Session, EntityManager'
  }
];

export const TRACEABILITY_MATRIX: RequirementTrace[] = [
  {
    id: 'RF-01',
    tipo: 'RF',
    nombre: 'Autenticación',
    descripcion: 'Inicio y cierre de sesión seguro mediante credenciales individuales.',
    capasAfectadas: ['Presentación', 'Controladores', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['LoginModal.tsx', 'AuthService.ts', 'UserRepository.ts', 'AuditService.ts'],
    estado: 'VALIDADO',
    evidencia: 'AuthService.login() valida credenciales, genera sesión y registra log de auditoría LOGIN_EXITOSO.'
  },
  {
    id: 'RF-02',
    tipo: 'RF',
    nombre: 'Roles y Permisos',
    descripcion: 'Manejo de roles: Administrador, Coordinador Académico, Docente y Estudiante con restricción de funciones.',
    capasAfectadas: ['Presentación', 'Servicios'],
    componentesImplementadores: ['Sidebar.tsx', 'Navbar.tsx', 'AuthService.ts'],
    estado: 'VALIDADO',
    evidencia: 'Navegación y acciones restringidas según rol activo en UI y verificadas en métodos de servicio.'
  },
  {
    id: 'RF-03',
    tipo: 'RF',
    nombre: 'Gestión de Estudiantes',
    descripcion: 'Registrar, consultar, actualizar, desactivar y eliminar registros de estudiantes con validación de unicidad e integridad en cascada.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['StudentManagement.tsx', 'StudentService.ts', 'StudentRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'Validación de código estudiantil y documento únicos; cambio de estado ACTIVO/INACTIVO y eliminación con liberación atómica de cupos y auditoría.'
  },
  {
    id: 'RF-04',
    tipo: 'RF',
    nombre: 'Gestión de Docentes',
    descripcion: 'Registrar, consultar, actualizar y desactivar docentes con titulación y departamento.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['TeacherManagement.tsx', 'TeacherService.ts', 'TeacherRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'CRUD completo de docentes con validación de código docente y documento institucional.'
  },
  {
    id: 'RF-05',
    tipo: 'RF',
    nombre: 'Programas y Asignaturas',
    descripcion: 'Crear y actualizar programas académicos, planes de estudio y asignaturas con créditos y prerrequisitos.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['AcademicManagement.tsx', 'AcademicService.ts', 'SubjectRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'Catálogo de programas SNIES y asignaturas con control de créditos y semestre.'
  },
  {
    id: 'RF-06',
    tipo: 'RF',
    nombre: 'Grupos y Periodos',
    descripcion: 'Configurar periodos académicos, grupos, cupos, docentes asignados, horarios y aulas o enlaces.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['GroupManagement.tsx', 'GroupPeriodService.ts', 'GroupRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'Control de cupo máximo, detección de cruces de horario para el docente y modalidad virtual/híbrida.'
  },
  {
    id: 'RF-07',
    tipo: 'RF',
    nombre: 'Matrícula Académica',
    descripcion: 'Matricular estudiantes validando cupos en tiempo real y evitando matrículas duplicadas o cruces de horario.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['EnrollmentManagement.tsx', 'EnrollmentService.ts', 'EnrollmentRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'EnrollmentService.enroll() valida cupoDisponible > 0, unicidad por periodo y cruces de horario de forma atómica.'
  },
  {
    id: 'RF-08',
    tipo: 'RF',
    nombre: 'Registro de Calificaciones',
    descripcion: 'El docente registra y actualiza calificaciones por cortes porcentuales de sus grupos autorizados.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['GradeManagement.tsx', 'GradeService.ts', 'GradeRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'GradeService.updateGrades() valida rango 0.0-5.0, cortes porcentuales 30/30/40 y autorización docente.'
  },
  {
    id: 'RF-09',
    tipo: 'RF',
    nombre: 'Consulta de Resultados',
    descripcion: 'El estudiante consulta asignaturas matriculadas, horarios, docentes y calificaciones publicadas con promedio.',
    capasAfectadas: ['Presentación', 'Servicios'],
    componentesImplementadores: ['StudentPortal.tsx', 'GradeService.ts'],
    estado: 'VALIDADO',
    evidencia: 'Portal del estudiante con visualización de asignaturas activas, notas publicadas y boletín oficial.'
  },
  {
    id: 'RF-10',
    tipo: 'RF',
    nombre: 'Reportes',
    descripcion: 'Reportes de matriculados, grupos, asignaturas y resultados académicos con filtros y exportación CSV.',
    capasAfectadas: ['Presentación', 'Servicios'],
    componentesImplementadores: ['AcademicReports.tsx', 'ReportService.ts'],
    estado: 'VALIDADO',
    evidencia: 'Módulo de reportería con cálculo de tasas de aprobación, promedios grupales y descarga de CSV.'
  },
  {
    id: 'RF-11',
    tipo: 'RF',
    nombre: 'Búsqueda y Filtros',
    descripcion: 'Búsqueda en tiempo real y filtros multidimensionales en cada módulo por código, nombre, programa o estado.',
    capasAfectadas: ['Presentación', 'Servicios'],
    componentesImplementadores: ['StudentManagement.tsx', 'TeacherManagement.tsx', 'AcademicManagement.tsx'],
    estado: 'VALIDADO',
    evidencia: 'Buscadores en vivo con debounce y filtros combinados por programa, periodo y estado.'
  },
  {
    id: 'RF-12',
    tipo: 'RF',
    nombre: 'Auditoría',
    descripcion: 'Registro inmutable de eventos relevantes (login, matrículas, notas, roles) con usuario, fecha, IP y entidad.',
    capasAfectadas: ['Presentación', 'Servicios', 'Persistencia'],
    componentesImplementadores: ['AuditLogViewer.tsx', 'AuditService.ts', 'AuditRepository.ts'],
    estado: 'VALIDADO',
    evidencia: 'AuditLogViewer.tsx con visualización cronológica, detalles antes/después y filtros por módulo.'
  },
  // RNF
  {
    id: 'RNF-01',
    tipo: 'RNF',
    nombre: 'Seguridad',
    descripcion: 'Control de acceso granular RBAC, credenciales no expuestas en texto plano y trazabilidad.',
    capasAfectadas: ['Controladores', 'Servicios'],
    componentesImplementadores: ['AuthService.ts', 'AuditService.ts'],
    estado: 'VALIDADO',
    evidencia: 'Validación en cada servicio de negocio y registro forzoso de eventos de acceso.'
  },
  {
    id: 'RNF-02',
    tipo: 'RNF',
    nombre: 'Rendimiento',
    descripcion: 'Respuesta en < 3s para el 95% de consultas con optimización en memoria y paginación.',
    capasAfectadas: ['Persistencia', 'Presentación'],
    componentesImplementadores: ['StorageEngine.ts', 'Repositories'],
    estado: 'VALIDADO',
    evidencia: 'Consultas O(1) y O(n) indexadas por ID y código en repositorios.'
  },
  {
    id: 'RNF-04',
    tipo: 'RNF',
    nombre: 'Escalabilidad',
    descripcion: 'Separación estricta de capas que permite migrar o escalar a microservicios Spring Boot sin rediseño.',
    capasAfectadas: ['Todas las capas'],
    componentesImplementadores: ['Repositories', 'Services', 'Controllers', 'DTOs'],
    estado: 'VALIDADO',
    evidencia: 'Desacoplamiento total con interfaces estándar y contratos DTO.'
  },
  {
    id: 'RNF-05',
    tipo: 'RNF',
    nombre: 'Mantenibilidad',
    descripcion: 'Bajo acoplamiento y alta cohesión con responsabilidades de capa delimitadas.',
    capasAfectadas: ['Todas las capas'],
    componentesImplementadores: ['architecture.ts', 'Repositories', 'Services'],
    estado: 'VALIDADO',
    evidencia: 'Tipado estricto en TypeScript y patrón Repository + Service idéntico a Spring Boot.'
  },
  {
    id: 'RNF-06',
    tipo: 'RNF',
    nombre: 'Usabilidad y Accesibilidad',
    descripcion: 'Interfaz adaptada a computadores y móviles, etiquetas semánticas y alto contraste.',
    capasAfectadas: ['Presentación'],
    componentesImplementadores: ['Navbar.tsx', 'Sidebar.tsx', 'Tailwind CSS'],
    estado: 'VALIDADO',
    evidencia: 'Contraste AA/AAA, diseño responsivo y botones accesibles.'
  },
  {
    id: 'RNF-07',
    tipo: 'RNF',
    nombre: 'Integridad y Consistencia',
    descripcion: 'Preservación de consistencia en matrículas y calificaciones ante solicitudes concurrentes.',
    capasAfectadas: ['Servicios', 'Persistencia'],
    componentesImplementadores: ['EnrollmentService.ts', 'GradeService.ts'],
    estado: 'VALIDADO',
    evidencia: 'Validación de cupo remanente previo a commit y chequeo de duplicidad transaccional.'
  },
  {
    id: 'RNF-08',
    tipo: 'RNF',
    nombre: 'Interoperabilidad',
    descripcion: 'Exposición de interfaces REST documentadas listas para integración institucional.',
    capasAfectadas: ['Controladores'],
    componentesImplementadores: ['apiController.ts', 'ArchitectureViewer.tsx (Swagger REST Explorer)'],
    estado: 'VALIDADO',
    evidencia: 'Catálogo de endpoints REST documentados con especificación OpenAPI / Swagger.'
  },
  {
    id: 'RNF-09',
    tipo: 'RNF',
    nombre: 'Respaldo y Recuperación',
    descripcion: 'Copias de seguridad periódicas en JSON y procedimiento de restauración ante fallos.',
    capasAfectadas: ['Persistencia', 'Presentación'],
    componentesImplementadores: ['StorageEngine.createBackupSnapshot()', 'BackupRestoreModal.tsx'],
    estado: 'VALIDADO',
    evidencia: 'Descarga instantánea de archivo .json snapshot y carga/restauración validada en 1 clic.'
  },
  {
    id: 'RNF-10',
    tipo: 'RNF',
    nombre: 'Trazabilidad',
    descripcion: 'Relación explícita de requerimientos con componentes, interfaces y modelos de software.',
    capasAfectadas: ['Documentación', 'Servicios'],
    componentesImplementadores: ['architecture.ts', 'ArchitectureViewer.tsx'],
    estado: 'VALIDADO',
    evidencia: 'Matriz interactiva de trazabilidad integrada en la consola del sistema.'
  },
  {
    id: 'RNF-11',
    tipo: 'RNF',
    nombre: 'Privacidad',
    descripcion: 'Restricción de datos personales y académicos según necesidad del rol.',
    capasAfectadas: ['Controladores', 'Servicios', 'Presentación'],
    componentesImplementadores: ['AuthService.ts', 'StudentPortal.tsx'],
    estado: 'VALIDADO',
    evidencia: 'Estudiantes solo acceden a sus notas propias; docentes solo a sus grupos.'
  },
  {
    id: 'RNF-12',
    tipo: 'RNF',
    nombre: 'Compatibilidad',
    descripcion: 'Ejecución en navegadores modernos (Chrome, Firefox, Safari, Edge) y móviles.',
    capasAfectadas: ['Presentación'],
    componentesImplementadores: ['index.html', 'Vite', 'React 19'],
    estado: 'VALIDADO',
    evidencia: 'Build estándar ES2022 con Tailwind v4 optimizado.'
  }
];

export const SPRING_BOOT_EQUIVALENT_CODE = {
  entity: `// ====================================================================
// Student.java (Entidad JPA / Hibernate)
// ====================================================================
package edu.unitec.siga.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "estudiantes", indexes = {
    @Index(name = "idx_estudiante_codigo", columnList = "codigoEstudiantil", unique = true),
    @Index(name = "idx_estudiante_documento", columnList = "numeroDocumento", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String codigoEstudiantil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoDocumento tipoDocumento;

    @NotBlank
    @Column(nullable = false, unique = true, length = 30)
    private String numeroDocumento;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String primerNombre;

    private String segundoNombre;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String primerApellido;

    private String segundoApellido;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 120)
    private String emailInstitucional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id", nullable = false)
    private AcademicProgram programa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoEstudiante estado = EstadoEstudiante.ACTIVO;

    private Double promedioAcumulado = 0.0;
    private Integer creditosAprobados = 0;
}`,
  repository: `// ====================================================================
// StudentRepository.java (Spring Data JPA)
// ====================================================================
package edu.unitec.siga.domain.repository;

import edu.unitec.siga.domain.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    Optional<Student> findByCodigoEstudiantil(String codigoEstudiantil);

    Optional<Student> findByNumeroDocumento(String numeroDocumento);

    Optional<Student> findByEmailInstitucional(String email);

    List<Student> findByProgramaId(String programaId);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.primerNombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.primerApellido) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "s.codigoEstudiantil LIKE CONCAT('%', :q, '%')")
    List<Student> searchStudents(@Param("q") String query);
}`,
  service: `// ====================================================================
// EnrollmentService.java (Lógica de Negocios y Transacciones)
// ====================================================================
package edu.unitec.siga.application.service;

import edu.unitec.siga.domain.model.*;
import edu.unitec.siga.domain.repository.*;
import edu.unitec.siga.infrastructure.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final StudentRepository studentRepo;
    private final GroupRepository groupRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final AuditService auditService;

    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public EnrollmentDTO enrollStudent(String studentId, String groupId, UserPrincipal currentUser) {
        // 1. Validar existencia y estado del estudiante
        Student student = studentRepo.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));
        if (student.getEstado() != EstadoEstudiante.ACTIVO) {
            throw new BusinessRuleException("Estudiante no habilitado para matrícula");
        }

        // 2. Bloqueo pesimista u optimista de cupos en el grupo
        AcademicGroup group = groupRepo.findByIdWithLock(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));

        if (group.getCupoDisponible() <= 0) {
            throw new QuotaExceededException("No hay cupos disponibles en el grupo seleccionado");
        }

        // 3. Validar no duplicidad
        boolean yaMatriculado = enrollmentRepo.existsByStudentAndSubjectInPeriod(
            studentId, group.getAsignatura().getId(), group.getPeriodo().getId());
        if (yaMatriculado) {
            throw new DuplicateEnrollmentException("Asignatura ya matriculada en el periodo");
        }

        // 4. Decrementar cupo atómicamente
        group.setCupoDisponible(group.getCupoDisponible() - 1);
        groupRepo.save(group);

        // 5. Crear matrícula
        Enrollment enrollment = Enrollment.builder()
            .student(student)
            .group(group)
            .fechaMatricula(LocalDateTime.now())
            .estado(EnrollmentStatus.MATRICULADA)
            .build();
        Enrollment saved = enrollmentRepo.save(enrollment);

        // 6. Auditoría inmutable (RF-12, RNF-10)
        auditService.registerEvent(currentUser, "MATRICULA_EXITOSA", saved.getId());

        return EnrollmentMapper.toDTO(saved);
    }
}`,
  controller: `// ====================================================================
// StudentRestController.java (Capa de Controladores REST)
// ====================================================================
package edu.unitec.siga.infrastructure.controller;

import edu.unitec.siga.application.service.StudentService;
import edu.unitec.siga.infrastructure.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/v1/estudiantes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentRestController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<List<StudentDTO>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String programaId) {
        return ResponseEntity.ok(studentService.search(search, programaId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<StudentDTO> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        StudentDTO created = studentService.create(request, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}`
};

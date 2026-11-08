/**
 * SIGA - Datos Semilla Institucionales
 * Universidad Nacional de Innovación & Tecnología (UNITEC)
 */
import { 
  User, Student, Teacher, AcademicProgram, Subject, 
  AcademicPeriod, AcademicGroup, Enrollment, GradeRecord, AuditLog 
} from '../types';

export const INITIAL_PROGRAMS: AcademicProgram[] = [
  {
    id: 'prog-01',
    codigo: 'ING-SIS',
    nombre: 'Ingeniería de Sistemas y Computación',
    nivel: 'PREGRADO',
    facultad: 'Facultad de Ingeniería y Ciencias Aplicadas',
    duracionSemestres: 10,
    totalCreditos: 165,
    tituloOtorgado: 'Ingeniero(a) de Sistemas y Computación',
    activo: true,
    snies: '104821',
  },
  {
    id: 'prog-02',
    codigo: 'ADM-EMP',
    nombre: 'Administración de Empresas',
    nivel: 'PREGRADO',
    facultad: 'Facultad de Ciencias Económicas y Administrativas',
    duracionSemestres: 9,
    totalCreditos: 152,
    tituloOtorgado: 'Administrador(a) de Empresas',
    activo: true,
    snies: '103550',
  },
  {
    id: 'prog-03',
    codigo: 'DER-LEG',
    nombre: 'Derecho y Ciencias Políticas',
    nivel: 'PREGRADO',
    facultad: 'Facultad de Jurisprudencia',
    duracionSemestres: 10,
    totalCreditos: 160,
    tituloOtorgado: 'Abogado(a)',
    activo: true,
    snies: '102144',
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  // Sistemas
  {
    id: 'subj-01',
    codigo: 'SIS-101',
    nombre: 'Introducción a la Programación y Algoritmia',
    programaId: 'prog-01',
    creditos: 3,
    semestre: 1,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL',
    descripcion: 'Fundamentos de lógica, estructuras de control, funciones y programación estructurada.',
    prerrequisitos: [],
    activo: true,
  },
  {
    id: 'subj-02',
    codigo: 'SIS-201',
    nombre: 'Programación Orientada a Objetos y Patrones',
    programaId: 'prog-01',
    creditos: 4,
    semestre: 2,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL',
    descripcion: 'Abstracción, encapsulamiento, herencia, polimorfismo y patrones de diseño GoF.',
    prerrequisitos: ['SIS-101'],
    activo: true,
  },
  {
    id: 'subj-03',
    codigo: 'SIS-301',
    nombre: 'Bases de Datos Relacionales y NoSQL',
    programaId: 'prog-01',
    creditos: 4,
    semestre: 3,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL',
    descripcion: 'Modelado entidad-relación, normalización, SQL avanzado, índices y persistencia JPA/Hibernate.',
    prerrequisitos: ['SIS-201'],
    activo: true,
  },
  {
    id: 'subj-04',
    codigo: 'SIS-401',
    nombre: 'Arquitectura de Software Empresarial',
    programaId: 'prog-01',
    creditos: 4,
    semestre: 5,
    horasSemanales: 4,
    modalidad: 'HIBRIDA',
    descripcion: 'Arquitectura en capas, Clean Architecture, microservicios, Spring Boot, REST APIs y RNF de escalabilidad.',
    prerrequisitos: ['SIS-301'],
    activo: true,
  },
  {
    id: 'subj-05',
    codigo: 'SIS-501',
    nombre: 'Seguridad Informática y Criptografía',
    programaId: 'prog-01',
    creditos: 3,
    semestre: 6,
    horasSemanales: 3,
    modalidad: 'PRESENCIAL',
    descripcion: 'Autenticación RBAC, JWT, OAuth2, cifrado simétrico/asimétrico y OWASP Top 10.',
    prerrequisitos: ['SIS-401'],
    activo: true,
  },
  // Administracion
  {
    id: 'subj-06',
    codigo: 'ADM-101',
    nombre: 'Fundamentos de Administración y Gestión',
    programaId: 'prog-02',
    creditos: 3,
    semestre: 1,
    horasSemanales: 3,
    modalidad: 'PRESENCIAL',
    descripcion: 'Teorías de la administración, proceso administrativo y dirección estratégica.',
    prerrequisitos: [],
    activo: true,
  },
  {
    id: 'subj-07',
    codigo: 'ADM-201',
    nombre: 'Contabilidad Financiera y de Costos',
    programaId: 'prog-02',
    creditos: 4,
    semestre: 2,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL',
    descripcion: 'Estados financieros, balance general, estado de resultados y punto de equilibrio.',
    prerrequisitos: ['ADM-101'],
    activo: true,
  },
  // Derecho
  {
    id: 'subj-08',
    codigo: 'DER-101',
    nombre: 'Derecho Constitucional Colombiano',
    programaId: 'prog-03',
    creditos: 4,
    semestre: 1,
    horasSemanales: 4,
    modalidad: 'PRESENCIAL',
    descripcion: 'Estructura del Estado, derechos fundamentales y mecanismos de protección ciudadana.',
    prerrequisitos: [],
    activo: true,
  }
];

export const INITIAL_PERIODS: AcademicPeriod[] = [
  {
    id: 'per-2026-1',
    codigo: '2026-1',
    nombre: 'Periodo Ordinario 2026-I',
    fechaInicio: '2026-02-02',
    fechaFin: '2026-06-20',
    fechaLimiteMatricula: '2026-02-28',
    fechaCierreNotas: '2026-06-25',
    esPeriodoActivo: true,
    estado: 'ACTIVO',
  },
  {
    id: 'per-2025-2',
    codigo: '2025-2',
    nombre: 'Periodo Ordinario 2025-II',
    fechaInicio: '2025-08-01',
    fechaFin: '2025-12-15',
    fechaLimiteMatricula: '2025-08-20',
    fechaCierreNotas: '2025-12-20',
    esPeriodoActivo: false,
    estado: 'CERRADO',
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teach-01',
    codigoDocente: 'DOC-8801',
    tipoDocumento: 'CC',
    numeroDocumento: '79845120',
    nombreCompleto: 'Dr. Carlos Alberto Restrepo',
    emailInstitucional: 'carlos.restrepo@unitec.edu',
    telefono: '+57 310 445 9921',
    tituloAcademico: 'Doctor en Ingeniería de Software - PhD',
    departamento: 'Ingeniería de Sistemas y Computación',
    tipoContrato: 'TIEMPO_COMPLETO',
    activo: true,
    fechaContratacion: '2019-02-01',
  },
  {
    id: 'teach-02',
    codigoDocente: 'DOC-8802',
    tipoDocumento: 'CC',
    numeroDocumento: '52410982',
    nombreCompleto: 'Dra. Elena Sofía Morales',
    emailInstitucional: 'elena.morales@unitec.edu',
    telefono: '+57 312 887 6654',
    tituloAcademico: 'Magíster en Ciencias de la Información y Bases de Datos',
    departamento: 'Ingeniería de Sistemas y Computación',
    tipoContrato: 'TIEMPO_COMPLETO',
    activo: true,
    fechaContratacion: '2020-07-15',
  },
  {
    id: 'teach-03',
    codigoDocente: 'DOC-8803',
    tipoDocumento: 'CC',
    numeroDocumento: '80123456',
    nombreCompleto: 'Mg. Fernando José Gómez',
    emailInstitucional: 'fernando.gomez@unitec.edu',
    telefono: '+57 315 223 9988',
    tituloAcademico: 'Magíster en Ciberseguridad y Redes',
    departamento: 'Ingeniería de Sistemas y Computación',
    tipoContrato: 'MEDIO_TIEMPO',
    activo: true,
    fechaContratacion: '2021-01-20',
  },
  {
    id: 'teach-04',
    codigoDocente: 'DOC-8804',
    tipoDocumento: 'CC',
    numeroDocumento: '63554129',
    nombreCompleto: 'Dra. Patricia Silva Méndez',
    emailInstitucional: 'patricia.silva@unitec.edu',
    telefono: '+57 301 776 5432',
    tituloAcademico: 'Doctora en Finanzas y Gestión Estratégica',
    departamento: 'Ciencias Económicas y Administrativas',
    tipoContrato: 'TIEMPO_COMPLETO',
    activo: true,
    fechaContratacion: '2018-08-10',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-01',
    codigoEstudiantil: 'EST-2024101',
    tipoDocumento: 'CC',
    numeroDocumento: '1014298711',
    primerNombre: 'Santiago',
    segundoNombre: 'David',
    primerApellido: 'Ramírez',
    segundoApellido: 'Vega',
    emailInstitucional: 'santiago.ramirez@unitec.edu',
    emailPersonal: 'santi.ramirez99@gmail.com',
    telefono: '+57 318 765 4321',
    direccion: 'Carrera 45 # 128 - 32, Bogotá D.C.',
    programaId: 'prog-01',
    semestreActual: 5,
    estado: 'ACTIVO',
    fechaIngreso: '2024-02-05',
    promedioAcumulado: 4.45,
    creditosAprobados: 72,
  },
  {
    id: 'stud-02',
    codigoEstudiantil: 'EST-2024102',
    tipoDocumento: 'CC',
    numeroDocumento: '1020489512',
    primerNombre: 'Valentina',
    segundoNombre: 'Pilar',
    primerApellido: 'Gómez',
    segundoApellido: 'Cardona',
    emailInstitucional: 'valentina.gomez@unitec.edu',
    emailPersonal: 'valengomez_c@outlook.com',
    telefono: '+57 320 987 1234',
    direccion: 'Calle 100 # 15 - 45, Bogotá D.C.',
    programaId: 'prog-01',
    semestreActual: 5,
    estado: 'ACTIVO',
    fechaIngreso: '2024-02-05',
    promedioAcumulado: 4.72,
    creditosAprobados: 75,
  },
  {
    id: 'stud-03',
    codigoEstudiantil: 'EST-2024203',
    tipoDocumento: 'CC',
    numeroDocumento: '1032890123',
    primerNombre: 'Mateo',
    segundoNombre: 'Alejandro',
    primerApellido: 'Torres',
    segundoApellido: 'Ríos',
    emailInstitucional: 'mateo.torres@unitec.edu',
    emailPersonal: 'mateo.torres.r@yahoo.com',
    telefono: '+57 311 445 7890',
    direccion: 'Avenida 68 # 42 - 10, Bogotá D.C.',
    programaId: 'prog-01',
    semestreActual: 3,
    estado: 'ACTIVO',
    fechaIngreso: '2024-08-01',
    promedioAcumulado: 4.10,
    creditosAprobados: 38,
  },
  {
    id: 'stud-04',
    codigoEstudiantil: 'EST-2025104',
    tipoDocumento: 'CC',
    numeroDocumento: '1019874563',
    primerNombre: 'Camila',
    segundoNombre: 'Andrea',
    primerApellido: 'Mendoza',
    segundoApellido: 'Castillo',
    emailInstitucional: 'camila.mendoza@unitec.edu',
    emailPersonal: 'camila.mendoza.c@gmail.com',
    telefono: '+57 316 332 1109',
    direccion: 'Transversal 23 # 85 - 19, Bogotá D.C.',
    programaId: 'prog-02',
    semestreActual: 2,
    estado: 'ACTIVO',
    fechaIngreso: '2025-02-01',
    promedioAcumulado: 4.30,
    creditosAprobados: 20,
  },
  {
    id: 'stud-05',
    codigoEstudiantil: 'EST-2023105',
    tipoDocumento: 'CC',
    numeroDocumento: '1098456123',
    primerNombre: 'Andrés',
    primerApellido: 'Pardo',
    segundoApellido: 'Muñoz',
    emailInstitucional: 'andres.pardo@unitec.edu',
    emailPersonal: 'andres.pardo.m@gmail.com',
    telefono: '+57 300 998 7766',
    direccion: 'Calle 134 # 9 - 28, Bogotá D.C.',
    programaId: 'prog-03',
    semestreActual: 1,
    estado: 'ACTIVO',
    fechaIngreso: '2026-02-01',
    promedioAcumulado: 3.90,
    creditosAprobados: 8,
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    nombreCompleto: 'Dra. Sofía Alarcón Rivera',
    email: 'admin@unitec.edu',
    rol: 'ADMIN',
    documentoIdentidad: '51992011',
    activo: true,
    ultimoAcceso: '2026-11-07 18:30',
  },
  {
    id: 'usr-coord',
    username: 'coordinador',
    nombreCompleto: 'Ing. Mauricio Bermúdez',
    email: 'coordinador@unitec.edu',
    rol: 'COORDINADOR',
    documentoIdentidad: '79334512',
    activo: true,
    ultimoAcceso: '2026-11-07 17:15',
  },
  {
    id: 'usr-docente-01',
    username: 'carlos.restrepo',
    nombreCompleto: 'Dr. Carlos Alberto Restrepo',
    email: 'carlos.restrepo@unitec.edu',
    rol: 'DOCENTE',
    documentoIdentidad: '79845120',
    referenciaId: 'teach-01',
    activo: true,
    ultimoAcceso: '2026-11-07 16:00',
  },
  {
    id: 'usr-estudiante-01',
    username: 'santiago.ramirez',
    nombreCompleto: 'Santiago David Ramírez Vega',
    email: 'santiago.ramirez@unitec.edu',
    rol: 'ESTUDIANTE',
    documentoIdentidad: '1014298711',
    referenciaId: 'stud-01',
    activo: true,
    ultimoAcceso: '2026-11-07 18:00',
  }
];

export const INITIAL_GROUPS: AcademicGroup[] = [
  {
    id: 'grp-01',
    codigoGrupo: '01',
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-04', // Arquitectura de Software
    docenteId: 'teach-01',   // Dr. Carlos Restrepo
    cupoMaximo: 25,
    cupoDisponible: 23,
    horarios: [
      { dia: 'LUNES', horaInicio: '07:00', horaFin: '09:00', aula: 'Bloque A - Aula 302' },
      { dia: 'MIERCOLES', horaInicio: '07:00', horaFin: '09:00', aula: 'Laboratorio de Software Lab-4' }
    ],
    modalidad: 'HIBRIDA',
    enlaceVirtual: 'https://teams.microsoft.com/l/meetup-join/unitec-arq-soft',
    estado: 'ABIERTO',
  },
  {
    id: 'grp-02',
    codigoGrupo: '02',
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-04', // Arquitectura de Software Grupo 2
    docenteId: 'teach-01',
    cupoMaximo: 25,
    cupoDisponible: 25,
    horarios: [
      { dia: 'MARTES', horaInicio: '18:00', horaFin: '20:00', aula: 'Bloque B - Aula 105' },
      { dia: 'JUEVES', horaInicio: '18:00', horaFin: '20:00', aula: 'Laboratorio de Software Lab-3' }
    ],
    modalidad: 'PRESENCIAL',
    estado: 'ABIERTO',
  },
  {
    id: 'grp-03',
    codigoGrupo: '01',
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-03', // Bases de Datos
    docenteId: 'teach-02',   // Dra. Elena Morales
    cupoMaximo: 30,
    cupoDisponible: 28,
    horarios: [
      { dia: 'MARTES', horaInicio: '09:00', horaFin: '11:00', aula: 'Bloque A - Aula 201' },
      { dia: 'VIERNES', horaInicio: '09:00', horaFin: '11:00', aula: 'Sala Especializada de Servidores DB' }
    ],
    modalidad: 'PRESENCIAL',
    estado: 'ABIERTO',
  },
  {
    id: 'grp-04',
    codigoGrupo: '01',
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-05', // Seguridad Informatica
    docenteId: 'teach-03',   // Mg. Fernando Gomez
    cupoMaximo: 20,
    cupoDisponible: 19,
    horarios: [
      { dia: 'MIERCOLES', horaInicio: '14:00', horaFin: '17:00', aula: 'Laboratorio de Redes y Ciberseguridad' }
    ],
    modalidad: 'PRESENCIAL',
    estado: 'ABIERTO',
  },
  {
    id: 'grp-05',
    codigoGrupo: '01',
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-07', // Contabilidad
    docenteId: 'teach-04',   // Dra. Patricia Silva
    cupoMaximo: 35,
    cupoDisponible: 34,
    horarios: [
      { dia: 'LUNES', horaInicio: '10:00', horaFin: '12:00', aula: 'Bloque C - Aula 401' },
      { dia: 'MIERCOLES', horaInicio: '10:00', horaFin: '12:00', aula: 'Bloque C - Aula 401' }
    ],
    modalidad: 'PRESENCIAL',
    estado: 'ABIERTO',
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-01',
    estudianteId: 'stud-01', // Santiago Ramirez
    grupoId: 'grp-01',       // Arq Software Grupo 1
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-04',
    fechaMatricula: '2026-02-10 09:30',
    estado: 'MATRICULADA',
    intentosNumero: 1,
    notaFinalDefinitiva: 4.6,
    estadoAprobacion: 'EN_CURSO',
  },
  {
    id: 'enr-02',
    estudianteId: 'stud-01', // Santiago Ramirez
    grupoId: 'grp-03',       // Bases de datos
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-03',
    fechaMatricula: '2026-02-10 09:35',
    estado: 'MATRICULADA',
    intentosNumero: 1,
    notaFinalDefinitiva: 4.3,
    estadoAprobacion: 'EN_CURSO',
  },
  {
    id: 'enr-03',
    estudianteId: 'stud-02', // Valentina Gomez
    grupoId: 'grp-01',       // Arq Software Grupo 1
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-04',
    fechaMatricula: '2026-02-10 10:15',
    estado: 'MATRICULADA',
    intentosNumero: 1,
    notaFinalDefinitiva: 4.8,
    estadoAprobacion: 'EN_CURSO',
  },
  {
    id: 'enr-04',
    estudianteId: 'stud-03', // Mateo Torres
    grupoId: 'grp-03',       // Bases de Datos
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-03',
    fechaMatricula: '2026-02-11 11:00',
    estado: 'MATRICULADA',
    intentosNumero: 1,
    notaFinalDefinitiva: 3.9,
    estadoAprobacion: 'EN_CURSO',
  },
  {
    id: 'enr-05',
    estudianteId: 'stud-04', // Camila Mendoza
    grupoId: 'grp-05',       // Contabilidad
    periodoId: 'per-2026-1',
    asignaturaId: 'subj-07',
    fechaMatricula: '2026-02-12 14:20',
    estado: 'MATRICULADA',
    intentosNumero: 1,
    notaFinalDefinitiva: 4.5,
    estadoAprobacion: 'EN_CURSO',
  }
];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    id: 'grd-01',
    matriculaId: 'enr-01',
    estudianteId: 'stud-01', // Santiago Ramirez
    grupoId: 'grp-01',
    evaluaciones: [
      { nombre: 'Corte 1 - Arquitectura en Capas y DDD', porcentaje: 30, calificacion: 4.7, fechaRegistro: '2026-03-20', observaciones: 'Excelente implementación del patrón Repository y separación de servicios' },
      { nombre: 'Corte 2 - Spring Boot REST APIs y JPA', porcentaje: 30, calificacion: 4.5, fechaRegistro: '2026-04-25', observaciones: 'Manejo correcto de excepciones globales y DTOs' },
      { nombre: 'Examen Final - Proyecto Empresarial y RNF', porcentaje: 40, calificacion: 4.6, fechaRegistro: '2026-06-12', observaciones: 'Sustentación sobresaliente con alta disponibilidad y concurrencia' }
    ],
    notaDefinitiva: 4.6,
    aprobado: true,
    fechaUltimaModificacion: '2026-06-12 17:00',
    modificadoPorUsuarioId: 'usr-docente-01',
    publicado: true,
  },
  {
    id: 'grd-02',
    matriculaId: 'enr-03',
    estudianteId: 'stud-02', // Valentina Gomez
    grupoId: 'grp-01',
    evaluaciones: [
      { nombre: 'Corte 1 - Arquitectura en Capas y DDD', porcentaje: 30, calificacion: 4.9, fechaRegistro: '2026-03-20', observaciones: 'Código limpio y cobertura de pruebas unitarias al 95%' },
      { nombre: 'Corte 2 - Spring Boot REST APIs y JPA', porcentaje: 30, calificacion: 4.8, fechaRegistro: '2026-04-25', observaciones: 'Optimización de consultas JPA evitando problema N+1' },
      { nombre: 'Examen Final - Proyecto Empresarial y RNF', porcentaje: 40, calificacion: 4.7, fechaRegistro: '2026-06-12', observaciones: 'Diseño arquitectónico impecable' }
    ],
    notaDefinitiva: 4.8,
    aprobado: true,
    fechaUltimaModificacion: '2026-06-12 17:05',
    modificadoPorUsuarioId: 'usr-docente-01',
    publicado: true,
  },
  {
    id: 'grd-03',
    matriculaId: 'enr-02',
    estudianteId: 'stud-01', // Santiago Ramirez
    grupoId: 'grp-03',
    evaluaciones: [
      { nombre: 'Parcial 1 - Normalización y DDL', porcentaje: 30, calificacion: 4.2, fechaRegistro: '2026-03-22' },
      { nombre: 'Parcial 2 - Procedimientos y Triggers', porcentaje: 30, calificacion: 4.4, fechaRegistro: '2026-04-28' },
      { nombre: 'Examen Final - Índices y Concurrencia', porcentaje: 40, calificacion: 4.3, fechaRegistro: '2026-06-14' }
    ],
    notaDefinitiva: 4.3,
    aprobado: true,
    fechaUltimaModificacion: '2026-06-14 11:20',
    modificadoPorUsuarioId: 'teach-02',
    publicado: true,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    fechaHora: '2026-11-07 18:30:12',
    usuarioId: 'usr-admin',
    usuarioNombre: 'Dra. Sofía Alarcón Rivera',
    usuarioRol: 'ADMIN',
    accion: 'LOGIN_EXITOSO',
    modulo: 'AUTENTICACION',
    descripcion: 'Inicio de sesión exitoso en consola de administración general.',
    ipOrigen: '192.168.10.45',
    navegador: 'Chrome 122.0 (macOS)',
  },
  {
    id: 'aud-002',
    fechaHora: '2026-11-07 16:45:00',
    usuarioId: 'usr-docente-01',
    usuarioNombre: 'Dr. Carlos Alberto Restrepo',
    usuarioRol: 'DOCENTE',
    accion: 'PUBLICAR_CALIFICACIONES',
    modulo: 'CALIFICACIONES',
    registroAfectadoId: 'grp-01',
    descripcion: 'Publicación oficial de notas definitivas para el Grupo 01 de Arquitectura de Software.',
    ipOrigen: '190.25.110.8',
    navegador: 'Firefox 123.0 (Linux x86_64)',
  },
  {
    id: 'aud-003',
    fechaHora: '2026-02-10 09:30:22',
    usuarioId: 'usr-coord',
    usuarioNombre: 'Ing. Mauricio Bermúdez',
    usuarioRol: 'COORDINADOR',
    accion: 'MATRICULAR_ESTUDIANTE',
    modulo: 'MATRICULAS',
    registroAfectadoId: 'enr-01',
    descripcion: 'Matrícula académica registrada para estudiante Santiago Ramírez en Grupo 01 (Cupos restantes: 23).',
    detallesDespues: { estudiante: 'EST-2024101', grupo: 'grp-01', asignatura: 'SIS-401' },
    ipOrigen: '192.168.10.12',
    navegador: 'Chrome 122.0 (Windows 11)',
  },
  {
    id: 'aud-004',
    fechaHora: '2026-01-15 10:00:00',
    usuarioId: 'usr-admin',
    usuarioNombre: 'Dra. Sofía Alarcón Rivera',
    usuarioRol: 'ADMIN',
    accion: 'CREAR_PROGRAMA',
    modulo: 'ACADEMICO',
    registroAfectadoId: 'prog-01',
    descripcion: 'Creación de programa académico Ingeniería de Sistemas y Computación (SNIES: 104821).',
    ipOrigen: '192.168.10.45',
    navegador: 'Chrome 122.0 (macOS)',
  }
];

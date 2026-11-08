/**
 * SIGA - Sistema Institucional de Gestión Académica
 * Universidad Nacional de Innovación & Tecnología (UNITEC)
 * Aplicación de Arquitectura en Capas: Presentación, Controladores, Lógica de Negocio y Persistencia
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { NotificationToast, ToastMessage } from './components/layout/NotificationToast';
import { LoginModal } from './components/auth/LoginModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentManagement } from './components/students/StudentManagement';
import { TeacherManagement } from './components/teachers/TeacherManagement';
import { AcademicManagement } from './components/academics/AcademicManagement';
import { GroupManagement } from './components/groups/GroupManagement';
import { EnrollmentManagement } from './components/enrollment/EnrollmentManagement';
import { GradeManagement } from './components/grades/GradeManagement';
import { StudentPortal } from './components/studentPortal/StudentPortal';
import { AcademicReports } from './components/reports/AcademicReports';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { ArchitectureViewer } from './components/architecture/ArchitectureViewer';
import { BackupRestoreModal } from './components/backup/BackupRestoreModal';
import { authService } from './services';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show welcome notification on first mount
  useEffect(() => {
    addToast(
      'info',
      'SIGA Enterprise Activo',
      `Bienvenido a la plataforma académica institucional. Sesión iniciada como ${currentUser.nombreCompleto} (${currentUser.rol}).`
    );
  }, []);

  // When role changes, if current tab is not allowed, switch to appropriate default
  useEffect(() => {
    if (currentUser.rol === 'ESTUDIANTE' && activeTab !== 'studentPortal' && activeTab !== 'architecture') {
      setActiveTab('studentPortal');
    }
  }, [currentUser]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSwitchUser = (userId: string) => {
    try {
      const switched = authService.switchUserFast(userId);
      setCurrentUser(switched);
      addToast(
        'success',
        'Cambio de Rol Exitoso (RF-02)',
        `Ahora visualizando la plataforma como ${switched.nombreCompleto} (${switched.rol}).`
      );
    } catch (err: any) {
      addToast('error', 'Error al cambiar usuario', err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    addToast(
      'success',
      'Sesión Iniciada',
      `Bienvenido ${user.nombreCompleto}. Acceso verificado bajo control RBAC.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Toast notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />

      {/* Institutional Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onOpenArchitecture={() => setActiveTab('architecture')}
        onOpenBackup={() => setIsBackupOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex flex-1">
        
        {/* Role-governed Sidebar */}
        <Sidebar
          currentRole={currentUser.rol}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'academics' && (
            <AcademicManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'groups' && (
            <GroupManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'enrollment' && (
            <EnrollmentManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'grades' && (
            <GradeManagement
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'studentPortal' && (
            <StudentPortal
              currentUser={currentUser}
              onNotify={addToast}
            />
          )}

          {activeTab === 'reports' && (
            <AcademicReports />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureViewer />
          )}
        </main>

      </div>

      {/* Login Modal (RF-01) */}
      <LoginModal
        isOpen={isLoginOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Backup and Restore Snapshot Modal (RNF-09) */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        currentUser={currentUser}
        onNotify={addToast}
        onDataReloaded={() => {
          setCurrentUser(authService.getCurrentUser());
          setActiveTab('dashboard');
        }}
      />

    </div>
  );
}

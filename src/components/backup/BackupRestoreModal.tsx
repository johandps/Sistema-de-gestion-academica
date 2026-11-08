import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, RefreshCw, 
  CheckCircle2, AlertTriangle, ShieldCheck, X, FileJson 
} from 'lucide-react';
import { dbStorage } from '../../db/storage';
import { auditService } from '../../services';
import { User } from '../../types';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  onDataReloaded: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNotify,
  onDataReloaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const snapshot = dbStorage.createBackupSnapshot();
      const jsonString = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.setAttribute('download', `siga_backup_institucional_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      auditService.log(
        currentUser,
        'BACKUP_DATOS',
        'SISTEMA',
        'Generación y descarga de snapshot institucional de base de datos completa.'
      );

      onNotify('success', 'Respaldo Generado', 'La copia de seguridad JSON ha sido descargada satisfactoriamente.');
    } catch (err: any) {
      onNotify('error', 'Error en Respaldo', err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        dbStorage.restoreBackupSnapshot(parsed);

        auditService.log(
          currentUser,
          'RESTAURAR_DATOS',
          'SISTEMA',
          `Restauración exitosa de base de datos desde snapshot externo (${parsed.timestamp || 'N/A'}).`
        );

        onNotify('success', 'Restauración Exitosa', 'Todos los datos institucionales fueron restablecidos correctamente.');
        onDataReloaded();
        onClose();
      } catch (err: any) {
        onNotify('error', 'Fallo de Restauración', 'El archivo no contiene un formato de respaldo SIGA válido.');
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (window.confirm('¿Está seguro de reiniciar los datos a los valores iniciales de fábrica? Esta acción no se puede deshacer.')) {
      dbStorage.resetToDefaults();
      auditService.log(
        currentUser,
        'RESTAURAR_DATOS',
        'SISTEMA',
        'Reinicio institucional a datos semilla de demostración.'
      );
      onNotify('info', 'Reinicio Completado', 'La base de datos fue restablecida con los datos semilla institucionales.');
      onDataReloaded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Respaldo y Recuperación (RNF-09)
              </h3>
              <p className="text-xs text-slate-500">
                Procedimiento de salvaguarda y contingencia de datos ante fallos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          
          {/* Card 1: Export Snapshot */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Copia de Seguridad (Snapshot JSON)</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Exporta una copia completa e inmutable de estudiantes, docentes, asignaturas, matrículas, notas y pistas de auditoría.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Card 2: Restore Snapshot */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Restaurar desde Respaldo</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Importa un archivo JSON de respaldo para restablecer el estado del sistema en caso de contingencia.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-70"
                >
                  <Upload className="w-4 h-4" />
                  <span>{restoring ? 'Restaurando...' : 'Cargar JSON'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Factory Reset Seed */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Reiniciar a Datos Semilla</h4>
                <p className="text-amber-800/80 mt-1 leading-relaxed">
                  Restaura los registros institucionales de demostración predeterminados con programas, asignaturas y usuarios limpios.
                </p>
              </div>
              <button
                onClick={handleFactoryReset}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

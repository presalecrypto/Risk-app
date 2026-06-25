import React, { useState, useRef } from 'react';
import { Database, Download, Upload, Trash2, Check, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';
import { getBackups, createBackup, exportAllData, importData } from '../utils/storage';
import type { Backup as BackupData } from '../types';

export const Backup: React.FC = () => {
  const { restoreBackup: restoreFromStore } = useStore();
  const [backups, setBackups] = useState<BackupData[]>(getBackups());
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = () => {
    const backup = createBackup();
    setBackups(getBackups());
    setMessage({ type: 'success', text: 'تم إنشاء النسخة الاحتياطية بنجاح' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRestore = (id: string) => {
    const success = restoreFromStore(id);
    if (success) {
      setMessage({ type: 'success', text: 'تمت الاستعادة بنجاح' });
    } else {
      setMessage({ type: 'error', text: 'فشل في الاستعادة' });
    }
    setShowRestoreConfirm(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-rm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'تم التصدير بنجاح' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setMessage({ type: 'success', text: 'تم الاستيراد بنجاح' });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: 'فشل في الاستيراد' });
      }
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            النسخ الاحتياطي
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            نسخ احتياطي واستعادة بياناتك
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover onClick={handleCreateBackup} className="cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Database className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">إنشاء نسخة احتياطية</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">حفظ جميع بياناتك محلياً</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={handleExport} className="cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
              <Download className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">تصدير البيانات</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">تحميل ملف JSON</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20">
              <Upload className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">استيراد البيانات</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">استعادة من ملف JSON</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          النسخ الاحتياطية المحفوظة
        </h3>
        
        {backups.length > 0 ? (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(backup.timestamp).toLocaleString('ar-EG')} - {(backup.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRestoreConfirm(backup.id)}
                >
                  استعادة
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>لا توجد نسخ احتياطية</p>
          </div>
        )}
      </Card>

      {/* Restore Confirmation */}
      <Modal
        isOpen={!!showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(null)}
        title="استعادة النسخة الاحتياطية"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowRestoreConfirm(null)}>
            إلغاء
          </Button>
          <Button onClick={() => showRestoreConfirm && handleRestore(showRestoreConfirm)}>
            استعادة
          </Button>
        </div>
      </Modal>
    </div>
  );
};

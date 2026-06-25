import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';
import { clearAllData } from '../utils/storage';

export const Settings: React.FC = () => {
  const { settings, updateSettings, theme, toggleTheme } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!settings) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    clearAllData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            الإعدادات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة إعدادات حسابك
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-success-600 animate-fade-in">
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">تم الحفظ بنجاح</span>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          إعدادات الحساب
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="رأس المال الابتدائي"
            type="number"
            value={settings.initialCapital}
            onChange={(e) => updateSettings({ initialCapital: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="العملة المستخدمة"
            value={settings.currency}
            disabled
          />
        </div>
      </Card>

      {/* Risk Settings */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          إعدادات المخاطرة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="نسبة المخاطرة لكل صفقة (%)"
            type="number"
            value={settings.riskPerTrade}
            onChange={(e) => updateSettings({ riskPerTrade: parseFloat(e.target.value) || 0 })}
            hint="يُنصح بعدم تجاوز 2%"
          />
          <Input
            label="الحد الأقصى للخسارة اليومية (%)"
            type="number"
            value={settings.maxDailyLoss}
            onChange={(e) => updateSettings({ maxDailyLoss: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="الحد الأقصى للخسارة الأسبوعية (%)"
            type="number"
            value={settings.maxWeeklyLoss}
            onChange={(e) => updateSettings({ maxWeeklyLoss: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </Card>

      {/* Target Settings */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          الأهداف الربحية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="الهدف الأسبوعي (%)"
            type="number"
            value={settings.weeklyTarget}
            onChange={(e) => updateSettings({ weeklyTarget: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="الهدف الشهري (%)"
            type="number"
            value={settings.monthlyTarget}
            onChange={(e) => updateSettings({ monthlyTarget: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="الهدف السنوي (%)"
            type="number"
            value={settings.yearlyTarget}
            onChange={(e) => updateSettings({ yearlyTarget: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </Card>

      {/* Theme Settings */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          المظهر
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-400">الوضع الحالي:</span>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح'}
          </Button>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            حفظ الإعدادات
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowResetConfirm(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            إعادة تعيين كل شيء
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="إعادة تعيين كل شيء"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          هل أنت متأكد من إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={handleReset}>
            إعادة تعيين
          </Button>
        </div>
      </Modal>
    </div>
  );
};

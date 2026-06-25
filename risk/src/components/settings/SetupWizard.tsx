import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, DollarSign, Shield, Target, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useStore } from '../../store/useStore';
import { createDefaultSettings } from '../../utils/storage';
import type { UserSettings } from '../../types';

const steps = [
  { id: 1, title: 'رأس المال', icon: DollarSign },
  { id: 2, title: 'المخاطرة', icon: Shield },
  { id: 3, title: 'الأهداف', icon: Target },
  { id: 4, title: 'المراجعة', icon: Check },
];

export const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    initialCapital: 1000,
    currency: 'USD',
    riskPerTrade: 1,
    maxDailyLoss: 3,
    maxWeeklyLoss: 8,
    weeklyTarget: 10,
    monthlyTarget: 40,
    yearlyTarget: 500,
  });

  const completeSetup = useStore(state => state.completeSetup);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const settings = createDefaultSettings(formData);
    completeSetup(settings);
  };

  const updateField = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trade Risk Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            مرحباً بك! دعنا نقوم بإعداد حسابك
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${isActive
                        ? 'bg-primary-600 text-white scale-110'
                        : isCompleted
                          ? 'bg-success-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                إعداد رأس المال
              </h2>
              <Input
                label="رأس المال الابتدائي"
                type="number"
                value={formData.initialCapital}
                onChange={(e) => updateField('initialCapital', parseFloat(e.target.value) || 0)}
                placeholder="1000"
                icon={<DollarSign className="w-4 h-4" />}
              />
              <Select
                label="العملة المستخدمة"
                value={formData.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                options={[
                  { value: 'USD', label: 'USD - دولار أمريكي' },
                  { value: 'EUR', label: 'EUR - يورو' },
                  { value: 'GBP', label: 'GBP - جنيه إسترليني' },
                ]}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                إعداد المخاطرة
              </h2>
              <Input
                label="نسبة المخاطرة لكل صفقة (%)"
                type="number"
                value={formData.riskPerTrade}
                onChange={(e) => updateField('riskPerTrade', parseFloat(e.target.value) || 0)}
                placeholder="1"
                hint="يُنصح بعدم تجاوز 2%"
              />
              <Input
                label="الحد الأقصى للخسارة اليومية (%)"
                type="number"
                value={formData.maxDailyLoss}
                onChange={(e) => updateField('maxDailyLoss', parseFloat(e.target.value) || 0)}
                placeholder="3"
              />
              <Input
                label="الحد الأقصى للخسارة الأسبوعية (%)"
                type="number"
                value={formData.maxWeeklyLoss}
                onChange={(e) => updateField('maxWeeklyLoss', parseFloat(e.target.value) || 0)}
                placeholder="8"
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                تحديد الأهداف
              </h2>
              <Input
                label="الهدف الربحي الأسبوعي (%)"
                type="number"
                value={formData.weeklyTarget}
                onChange={(e) => updateField('weeklyTarget', parseFloat(e.target.value) || 0)}
                placeholder="10"
              />
              <Input
                label="الهدف الربحي الشهري (%)"
                type="number"
                value={formData.monthlyTarget}
                onChange={(e) => updateField('monthlyTarget', parseFloat(e.target.value) || 0)}
                placeholder="40"
              />
              <Input
                label="الهدف الربحي السنوي (%)"
                type="number"
                value={formData.yearlyTarget}
                onChange={(e) => updateField('yearlyTarget', parseFloat(e.target.value) || 0)}
                placeholder="500"
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                مراجعة الإعدادات
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">رأس المال</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.initialCapital} {formData.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">المخاطرة لكل صفقة</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.riskPerTrade}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الحد اليومي</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.maxDailyLoss}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الحد الأسبوعي</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.maxWeeklyLoss}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الهدف الأسبوعي</span>
                  <span className="font-bold text-success-600">
                    {formData.weeklyTarget}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              رجوع
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                variant="success"
                icon={<Check className="w-4 h-4" />}
              >
                ابدأ التداول!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

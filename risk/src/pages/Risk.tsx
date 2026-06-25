import React, { useState } from 'react';
import { Shield, Calculator, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { calculateLotSize, checkDailyLossLimit, checkWeeklyLossLimit } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatting';

export const Risk: React.FC = () => {
  const { settings, trades, getCurrentCapital } = useStore();
  const [lotCalcCapital, setLotCalcCapital] = useState(settings?.initialCapital || 1000);
  const [lotCalcRisk, setLotCalcRisk] = useState(settings?.riskPerTrade || 1);
  const [lotCalcSL, setLotCalcSL] = useState(0);

  if (!settings) return null;

  const currentCapital = getCurrentCapital();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const dailyCheck = checkDailyLossLimit(trades, todayStr, currentCapital, settings.maxDailyLoss);
  const weeklyCheck = checkWeeklyLossLimit(trades, currentCapital, settings.maxWeeklyLoss);

  const calculatedLot = lotCalcCapital && lotCalcRisk && lotCalcSL
    ? calculateLotSize(lotCalcCapital, lotCalcRisk, lotCalcSL)
    : 0;

  const riskAmount = lotCalcCapital * (lotCalcRisk / 100);

  const getRiskStatus = () => {
    if (dailyCheck.exceeded || weeklyCheck.exceeded) return 'danger';
    if (dailyCheck.currentLoss > dailyCheck.limit * 0.7 || weeklyCheck.currentLoss > weeklyCheck.limit * 0.7) return 'warning';
    return 'safe';
  };

  const riskStatus = getRiskStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة المخاطر الذكية
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          حاسبة اللوت والتحذيرات الذكية
        </p>
      </div>

      {/* Risk Status */}
      <Card>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${
            riskStatus === 'safe' ? 'bg-success-50 dark:bg-success-900/20' :
            riskStatus === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
            'bg-danger-50 dark:bg-danger-900/20'
          }`}>
            {riskStatus === 'safe' ? (
              <CheckCircle className="w-8 h-8 text-success-600" />
            ) : riskStatus === 'warning' ? (
              <AlertTriangle className="w-8 h-8 text-warning-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              حالة المخاطرة: {
                riskStatus === 'safe' ? 'آمن ✅' :
                riskStatus === 'warning' ? 'تحذير ⚠️' :
                'خطير 🚨'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {riskStatus === 'safe' ? 'كل شيء على ما يرام!' :
               riskStatus === 'warning' ? 'انتبه! أنتقترب من حد المخاطرة' :
               'تجاوزت حد المخاطرة! توقف عن التداول'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lot Calculator */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Calculator className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">حاسبة اللوت</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">احسب حجم اللوت المناسب</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="رأس المال"
              type="number"
              value={lotCalcCapital}
              onChange={(e) => setLotCalcCapital(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="نسبة المخاطرة (%)"
              type="number"
              value={lotCalcRisk}
              onChange={(e) => setLotCalcRisk(parseFloat(e.target.value) || 0)}
              hint="يُنصح بعدم تجاوز 2%"
            />
            <Input
              label="نقاط وقف الخسارة"
              type="number"
              value={lotCalcSL}
              onChange={(e) => setLotCalcSL(parseFloat(e.target.value) || 0)}
            />

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">اللوت المقترح</span>
                <span className="text-2xl font-bold text-primary-600">
                  {calculatedLot.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">المبلغ المعرض للمخاطرة</span>
                <span className="font-bold text-danger-600">
                  {formatCurrency(riskAmount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Loss Limits */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20">
              <Shield className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">حدود الخسائر</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">مراقبة الحدود اليومية والأسبوعية</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Daily Limit */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">الخسارة اليومية</span>
                <Badge variant={dailyCheck.exceeded ? 'danger' : 'success'}>
                  {dailyCheck.exceeded ? 'تجاوز الحد' : 'ضمن الحد'}
                </Badge>
              </div>
              <Progress
                value={dailyCheck.currentLoss}
                max={dailyCheck.limit}
                color={dailyCheck.exceeded ? 'danger' : dailyCheck.currentLoss > dailyCheck.limit * 0.7 ? 'warning' : 'success'}
                showLabel
                label={`${formatCurrency(dailyCheck.currentLoss)} / ${formatCurrency(dailyCheck.limit)}`}
              />
            </div>

            {/* Weekly Limit */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">الخسارة الأسبوعية</span>
                <Badge variant={weeklyCheck.exceeded ? 'danger' : 'success'}>
                  {weeklyCheck.exceeded ? 'تجاوز الحد' : 'ضمن الحد'}
                </Badge>
              </div>
              <Progress
                value={weeklyCheck.currentLoss}
                max={weeklyCheck.limit}
                color={weeklyCheck.exceeded ? 'danger' : weeklyCheck.currentLoss > weeklyCheck.limit * 0.7 ? 'warning' : 'success'}
                showLabel
                label={`${formatCurrency(weeklyCheck.currentLoss)} / ${formatCurrency(weeklyCheck.limit)}`}
              />
            </div>

            {/* Current Capital */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">رأس المال الحالي</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentCapital)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 dark:text-gray-400">الانخفاض عن البداية</span>
                <span className={`font-bold ${currentCapital >= settings.initialCapital ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatPercent(((currentCapital - settings.initialCapital) / settings.initialCapital) * 100)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Guidelines */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          إرشادات إدارة المخاطر
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
            <h4 className="font-bold text-success-600 mb-2">✅ القاعدة الذهبية</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لا تخاطر بأكثر من 1-2% من رأسمالك في أي صفقة واحدة
            </p>
          </div>
          <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-xl">
            <h4 className="font-bold text-warning-600 mb-2">⚠️ الحد اليومي</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              توقف عن التداول إذا وصلت خسائرك إلى الحد اليومي المحدد
            </p>
          </div>
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl">
            <h4 className="font-bold text-danger-600 mb-2">🚨 الحد الأسبوعي</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              خذ استراحة إذا تجاوزت الحد الأسبوعي. العودة بعقل أوضح
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

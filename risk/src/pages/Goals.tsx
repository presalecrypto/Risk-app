import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Check, AlertCircle } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatting';

export const Goals: React.FC = () => {
  const { goals, updateGoals, settings, getDailyStats, getWeeklyStats, getMonthlyStats } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    dailyGoal: goals?.dailyGoal || 0,
    weeklyGoal: goals?.weeklyGoal || 0,
    monthlyGoal: goals?.monthlyGoal || 0,
    yearlyGoal: goals?.yearlyGoal || 0,
  });

  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const dailyProgress = goals?.dailyGoal ? (dailyStats.netProfit / goals.dailyGoal) * 100 : 0;
  const weeklyProgress = goals?.weeklyGoal ? (weeklyStats.netProfit / goals.weeklyGoal) * 100 : 0;
  const monthlyProgress = goals?.monthlyGoal ? (monthlyStats.netProfit / goals.monthlyGoal) * 100 : 0;

  const handleSave = () => {
    updateGoals(editData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            أهداف التداول
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            تتبع تقدمك نحو أهدافك
          </p>
        </div>
        <Button
          variant={isEditing ? 'primary' : 'secondary'}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'حفظ' : 'تعديل الأهداف'}
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Goal */}
        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">هدف يومي</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">اليوم</p>
            </div>
          </div>
          
          {isEditing ? (
            <Input
              type="number"
              value={editData.dailyGoal}
              onChange={(e) => setEditData({ ...editData, dailyGoal: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dailyStats.netProfit)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  من {formatCurrency(goals?.dailyGoal || 0)}
                </span>
              </div>
              <Progress
                value={dailyProgress}
                color={dailyProgress >= 100 ? 'success' : dailyProgress >= 50 ? 'primary' : 'warning'}
                showLabel
              />
              {dailyProgress >= 100 ? (
                <div className="flex items-center gap-2 mt-3 text-success-600 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  تم الإنجاز!
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  متبقي {formatCurrency(Math.max(0, (goals?.dailyGoal || 0) - dailyStats.netProfit))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Weekly Goal */}
        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">هدف أسبوعي</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">هذا الأسبوع</p>
            </div>
          </div>
          
          {isEditing ? (
            <Input
              type="number"
              value={editData.weeklyGoal}
              onChange={(e) => setEditData({ ...editData, weeklyGoal: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(weeklyStats.netProfit)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  من {formatCurrency(goals?.weeklyGoal || 0)}
                </span>
              </div>
              <Progress
                value={weeklyProgress}
                color={weeklyProgress >= 100 ? 'success' : weeklyProgress >= 50 ? 'primary' : 'warning'}
                showLabel
              />
              {weeklyProgress >= 100 ? (
                <div className="flex items-center gap-2 mt-3 text-success-600 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  تم الإنجاز!
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  متبقي {formatCurrency(Math.max(0, (goals?.weeklyGoal || 0) - weeklyStats.netProfit))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Monthly Goal */}
        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20">
              <Target className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">هدف شهري</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">هذا الشهر</p>
            </div>
          </div>
          
          {isEditing ? (
            <Input
              type="number"
              value={editData.monthlyGoal}
              onChange={(e) => setEditData({ ...editData, monthlyGoal: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(monthlyStats.netProfit)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  من {formatCurrency(goals?.monthlyGoal || 0)}
                </span>
              </div>
              <Progress
                value={monthlyProgress}
                color={monthlyProgress >= 100 ? 'success' : monthlyProgress >= 50 ? 'primary' : 'warning'}
                showLabel
              />
              {monthlyProgress >= 100 ? (
                <div className="flex items-center gap-2 mt-3 text-success-600 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  تم الإنجاز!
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  متبقي {formatCurrency(Math.max(0, (goals?.monthlyGoal || 0) - monthlyStats.netProfit))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Yearly Goal */}
        <Card hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">هدف سنوي</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">هذا العام</p>
            </div>
          </div>
          
          {isEditing ? (
            <Input
              type="number"
              value={editData.yearlyGoal}
              onChange={(e) => setEditData({ ...editData, yearlyGoal: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(settings?.initialCapital ? 
                    (settings.initialCapital * ((goals?.yearlyGoal || 0) / 100)) : 0)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {goals?.yearlyGoal || 0}%
                </span>
              </div>
              <Progress
                value={goals?.yearlyGoal || 0}
                max={100}
                color="primary"
                showLabel
              />
            </>
          )}
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          ملخص الأداء
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الصفقات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {dailyStats.totalTrades + weeklyStats.totalTrades + monthlyStats.totalTrades}
            </p>
          </div>
          <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الرابحة</p>
            <p className="text-2xl font-bold text-success-600">
              {dailyStats.winningTrades + weeklyStats.winningTrades + monthlyStats.winningTrades}
            </p>
          </div>
          <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الخاسرة</p>
            <p className="text-2xl font-bold text-danger-600">
              {dailyStats.losingTrades + weeklyStats.losingTrades + monthlyStats.losingTrades}
            </p>
          </div>
          <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">صافي الربح</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(dailyStats.netProfit + weeklyStats.netProfit + monthlyStats.netProfit)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

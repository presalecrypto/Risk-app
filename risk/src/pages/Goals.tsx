import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Percent, CalendarDays, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent, getProfitColor, getProfitBgColor } from '../utils/formatting';
import { getWeekRange } from '../utils/calculations';
import { parseISO, isWithinInterval } from 'date-fns';

export const Goals: React.FC = () => {
  const { trades, settings } = useStore();

  // Calculate current week trades (Monday to Saturday)
  const weekData = useMemo(() => {
    const { start, end } = getWeekRange(new Date());
    // Ensure Saturday is the end: if week ends on Sunday, set to Saturday
    const weekEnd = new Date(end);
    weekEnd.setDate(weekEnd.getDate() - 1); // Saturday
    weekEnd.setHours(23, 59, 59, 999);

    const weekTrades = trades.filter(t => {
      const tradeDate = parseISO(t.date);
      return isWithinInterval(tradeDate, { start, end: weekEnd });
    });

    const wins = weekTrades.filter(t => t.result === 'win');
    const losses = weekTrades.filter(t => t.result === 'loss');
    const breakevens = weekTrades.filter(t => t.result === 'breakeven');

    const totalProfit = wins.reduce((sum, t) => sum + t.profitLoss, 0);
    const totalLoss = losses.reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
    const netProfit = totalProfit - totalLoss;
    const winRate = weekTrades.length > 0 ? (wins.length / weekTrades.length) * 100 : 0;
    const growthRate = settings && settings.initialCapital > 0
      ? (netProfit / settings.initialCapital) * 100
      : 0;

    // Daily breakdown
    const dailyProfits: Record<string, number> = {};
    weekTrades.forEach(t => {
      dailyProfits[t.date] = (dailyProfits[t.date] || 0) + t.profitLoss;
    });

    // Days of the week (Monday to Saturday)
    const dayNames = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return {
      weekStart: start,
      weekEnd: weekEnd,
      totalTrades: weekTrades.length,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      totalProfit,
      totalLoss,
      netProfit,
      winRate,
      growthRate,
      dailyProfits,
      dayNames,
    };
  }, [trades, settings]);

  // Determine the period display
  const weekLabel = useMemo(() => {
    const startStr = weekData.weekStart.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
    const endStr = weekData.weekEnd.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  }, [weekData.weekStart, weekData.weekEnd]);

  // Generate days for display (Mon-Sat)
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(weekData.weekStart);
    for (let i = 0; i < 6; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      const dayName = weekData.dayNames[i];
      const profit = weekData.dailyProfits[dateStr] || 0;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      days.push({ date: dateStr, dayName, profit, isToday });
    }
    return days;
  }, [weekData]);

  const isProfit = weekData.netProfit >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          الأرباح الأسبوعية
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {weekLabel} (الإثنين - السبت)
        </p>
      </div>

      {/* Main Profit/Loss Card */}
      <Card>
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">صافي الربح/الخسارة هذا الأسبوع</p>
          <div className={`text-5xl font-bold mb-3 ${isProfit ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(weekData.netProfit)}
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium ${getProfitBgColor(weekData.netProfit)}`}>
            {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {formatPercent(weekData.growthRate)} من رأس المال
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center p-3">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 mx-auto w-fit mb-3">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الصفقات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{weekData.totalTrades}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-3">
            <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20 mx-auto w-fit mb-3">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الرابحة</p>
            <p className="text-2xl font-bold text-success-600">{weekData.wins}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-3">
            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 mx-auto w-fit mb-3">
              <XCircle className="w-6 h-6 text-danger-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الخاسرة</p>
            <p className="text-2xl font-bold text-danger-600">{weekData.losses}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-3">
            <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 mx-auto w-fit mb-3">
              <Percent className="w-6 h-6 text-warning-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">نسبة النجاح</p>
            <p className="text-2xl font-bold text-warning-600">{weekData.winRate.toFixed(1)}%</p>
          </div>
        </Card>
      </div>

      {/* Profit & Loss Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-success-50 dark:bg-success-900/20">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">إجمالي الأرباح</h3>
          </div>
          <p className="text-3xl font-bold text-success-600">{formatCurrency(weekData.totalProfit)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{weekData.wins} صفقات رابحة</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-danger-50 dark:bg-danger-900/20">
              <TrendingDown className="w-5 h-5 text-danger-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">إجمالي الخسائر</h3>
          </div>
          <p className="text-3xl font-bold text-danger-600">{formatCurrency(weekData.totalLoss)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{weekData.losses} صفقات خاسرة</p>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          الأداء اليومي
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {weekDays.map((day) => (
            <div
              key={day.date}
              className={`p-3 rounded-xl text-center transition-all ${
                day.isToday
                  ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{day.dayName}</p>
              <p className={`text-lg font-bold mt-1 ${getProfitColor(day.profit)}`}>
                {day.profit !== 0 ? formatCurrency(day.profit) : <Minus className="w-4 h-4 mx-auto text-gray-400" />}
              </p>
              {day.isToday && (
                <span className="text-xs text-primary-600 font-medium">اليوم</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

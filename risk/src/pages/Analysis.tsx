import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { calculatePerformanceAnalysis } from '../utils/calculations';
import { formatCurrency, formatDuration } from '../utils/formatting';

export const Analysis: React.FC = () => {
  const { trades } = useStore();

  if (trades.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <BarChart3 className="w-24 h-24 mb-4 opacity-30" />
        <h2 className="text-2xl font-bold mb-2">تحليل الأداء</h2>
        <p className="text-center max-w-md">
          أضف 5 صفقات على الأقل للحصول على تحليل دقيق لأدائك
        </p>
        <p className="text-sm mt-2">
          الحالي: {trades.length} صفقات
        </p>
      </div>
    );
  }

  const analysis = calculatePerformanceAnalysis(trades);

  // Prepare pie chart data
  const symbolPieData = analysis.symbolPerformance.map(sp => ({
    name: sp.symbol,
    value: sp.totalTrades,
    profit: sp.totalProfit,
  }));

  const dayPieData = analysis.dayPerformance.map(dp => ({
    name: dp.day,
    value: dp.totalTrades,
    profit: dp.totalProfit,
  }));

  const COLORS = ['#1a6af5', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          تحليل الأداء المتقدم
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          تحليل شامل لأدائك في التداول
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">أفضل أداة</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">الأكثر ربحاً</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-success-600">{analysis.bestSymbol}</p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20">
              <TrendingDown className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">أسوأ أداة</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">الأكثر خسارة</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-danger-600">{analysis.worstSymbol}</p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">أفضل يوم</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">الأكثر ربحاً</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-600">{analysis.bestDayOfWeek}</p>
        </Card>
      </div>

      {/* More Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20">
              <Target className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">أسوأ يوم</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">الأكثر خسارة</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-warning-600">{analysis.worstDayOfWeek}</p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">معدل المخاطرة/العائد</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Risk/Reward</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {analysis.avgRiskReward.toFixed(2)}
          </p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">متوسط المدة</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">للصفقة</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {formatDuration(analysis.avgHoldDuration)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symbol Performance */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            أداء الأدوات
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.symbolPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'الربح']}
                />
                <Bar dataKey="totalProfit" fill="#1a6af5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Day Performance */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            أداء الأيام
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.dayPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'الربح']}
                />
                <Bar dataKey="totalProfit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Buy vs Sell */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          شراء مقابل بيع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success-100 dark:bg-success-800">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">صفقات الشراء</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">عدد الصفقات</span>
                <span className="font-bold">{analysis.typePerformance[0]?.totalTrades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">نسبة النجاح</span>
                <span className="font-bold text-success-600">
                  {(analysis.typePerformance[0]?.winRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">إجمالي الربح</span>
                <span className="font-bold text-success-600">
                  {formatCurrency(analysis.typePerformance[0]?.totalProfit || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-danger-100 dark:bg-danger-800">
                <TrendingDown className="w-5 h-5 text-danger-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">صفقات البيع</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">عدد الصفقات</span>
                <span className="font-bold">{analysis.typePerformance[1]?.totalTrades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">نسبة النجاح</span>
                <span className="font-bold text-danger-600">
                  {(analysis.typePerformance[1]?.winRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">إجمالي الربح</span>
                <span className="font-bold text-danger-600">
                  {formatCurrency(analysis.typePerformance[1]?.totalProfit || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Symbol Performance Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          تفصيل الأداء حسب الأداة
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="text-right pb-3 font-medium">الرمز</th>
                <th className="text-right pb-3 font-medium">عدد الصفقات</th>
                <th className="text-right pb-3 font-medium">نسبة النجاح</th>
                <th className="text-right pb-3 font-medium">إجمالي الربح</th>
                <th className="text-right pb-3 font-medium">متوسط الربح</th>
              </tr>
            </thead>
            <tbody>
              {analysis.symbolPerformance.map(sp => (
                <tr
                  key={sp.symbol}
                  className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                >
                  <td className="py-3">
                    <Badge variant="gray">{sp.symbol}</Badge>
                  </td>
                  <td className="py-3 text-sm">{sp.totalTrades}</td>
                  <td className="py-3">
                    <span className={`font-medium ${sp.winRate >= 50 ? 'text-success-600' : 'text-danger-600'}`}>
                      {sp.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className={`py-3 font-medium ${sp.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(sp.totalProfit)}
                  </td>
                  <td className={`py-3 ${sp.avgProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(sp.avgProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

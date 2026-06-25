import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, StatCard } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent, getProfitColor, getResultLabel, getTypeLabel, getProfitBgColor } from '../utils/formatting';
import { formatShortDate } from '../utils/formatting';

export const Dashboard: React.FC = () => {
  const {
    settings,
    trades,
    getCurrentCapital,
    getTodayTrades,
    getWeekTrades,
    getMonthTrades,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getEquityCurve,
    getMaxDrawdown,
    getWinRate,
    getGrowthRate,
  } = useStore();

  if (!settings) return null;

  const currentCapital = getCurrentCapital();
  const todayTrades = getTodayTrades();
  const weekTrades = getWeekTrades();
  const monthTrades = getMonthTrades();
  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();
  const equityCurve = getEquityCurve();
  const maxDrawdown = getMaxDrawdown();
  const winRate = getWinRate();
  const growthRate = getGrowthRate();

  const todayProfit = dailyStats.netProfit;
  const weekProfit = weeklyStats.netProfit;
  const monthProfit = monthlyStats.netProfit;
  const totalProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0);

  // Daily performance data for bar chart
  const dailyPerformanceData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = trades.filter(t => t.date === dateStr);
    const profit = dayTrades.reduce((sum, t) => sum + t.profitLoss, 0);
    return {
      name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
      profit,
      date: dateStr,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            مرحباً بك في Trade Risk Manager
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500 dark:text-gray-400">رأس المال الحالي</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(currentCapital)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ربح اليوم"
          value={formatCurrency(todayProfit)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={todayProfit >= 0 ? 'up' : 'down'}
          trendValue={`${todayTrades.length} صفقة`}
          color={todayProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="ربح الأسبوع"
          value={formatCurrency(weekProfit)}
          icon={<BarChart3 className="w-6 h-6" />}
          trend={weekProfit >= 0 ? 'up' : 'down'}
          trendValue={`${weekTrades.length} صفقة`}
          color={weekProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="ربح الشهر"
          value={formatCurrency(monthProfit)}
          icon={<Activity className="w-6 h-6" />}
          trend={monthProfit >= 0 ? 'up' : 'down'}
          trendValue={`${monthTrades.length} صفقة`}
          color={monthProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="نسبة النجاح"
          value={`${winRate.toFixed(1)}%`}
          icon={<Target className="w-6 h-6" />}
          trendValue={`${trades.length} صفقة إجمالي`}
          color={winRate >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الرابحة</p>
          <p className="text-xl font-bold text-success-600">
            {trades.filter(t => t.result === 'win').length}
          </p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الخاسرة</p>
          <p className="text-xl font-bold text-danger-600">
            {trades.filter(t => t.result === 'loss').length}
          </p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">نسبة النمو</p>
          <p className={`text-xl font-bold ${getProfitColor(growthRate)}`}>
            {formatPercent(growthRate)}
          </p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">أقصى تراجع</p>
          <p className="text-xl font-bold text-danger-600">
            {maxDrawdown.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            منحنى الحساب
          </h3>
          <div className="h-64">
            {equityCurve.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a6af5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a6af5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => val.length > 5 ? val.slice(5) : val}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'الحساب']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#1a6af5"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>أضف صفقات لرؤية منحنى الحساب</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Daily Performance */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            الأداء اليومي (آخر 7 أيام)
          </h3>
          <div className="h-64">
            {trades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                  <Bar
                    dataKey="profit"
                    fill="#1a6af5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>أضف صفقات لرؤية الأداء</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            آخر الصفقات
          </h3>
          <button
            onClick={() => useStore.getState().setCurrentPage('trades')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            عرض الكل
          </button>
        </div>
        
        {trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right pb-3 font-medium">التاريخ</th>
                  <th className="text-right pb-3 font-medium">الرمز</th>
                  <th className="text-right pb-3 font-medium">النوع</th>
                  <th className="text-right pb-3 font-medium">النتيجة</th>
                  <th className="text-right pb-3 font-medium">الربح/الخسارة</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(-5).reverse().map(trade => (
                  <tr
                    key={trade.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatShortDate(trade.date)}
                    </td>
                    <td className="py-3">
                      <Badge variant="gray">{trade.symbol}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={trade.type === 'buy' ? 'success' : 'danger'}>
                        {getTypeLabel(trade.type)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={trade.result === 'win' ? 'success' : trade.result === 'loss' ? 'danger' : 'warning'}>
                        {getResultLabel(trade.result)}
                      </Badge>
                    </td>
                    <td className={`py-3 font-medium ${getProfitColor(trade.profitLoss)}`}>
                      {formatCurrency(trade.profitLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد صفقات بعد</p>
            <p className="text-sm mt-1">ابدأ بإضافة صفقاتك الأولى</p>
          </div>
        )}
      </Card>
    </div>
  );
};

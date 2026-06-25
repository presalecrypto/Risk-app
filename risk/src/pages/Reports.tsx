import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent } from '../utils/formatting';
import { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats } from '../utils/calculations';
import { getWeekRange, getMonthRange } from '../utils/calculations';

export const Reports: React.FC = () => {
  const { trades, settings, getDailyStats, getWeeklyStats, getMonthlyStats } = useStore();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const generateReport = () => {
    let filteredTrades = trades;
    let title = '';

    switch (reportType) {
      case 'daily':
        title = 'تقرير يومي';
        break;
      case 'weekly':
        title = 'تقرير أسبوعي';
        break;
      case 'monthly':
        title = 'تقرير شهري';
        break;
      case 'custom':
        title = 'تقرير مخصص';
        filteredTrades = trades.filter(t => t.date >= dateFrom && t.date <= dateTo);
        break;
    }

    return { title, filteredTrades };
  };

  const exportPDF = async () => {
    const { title, filteredTrades } = generateReport();
    
    // Create simple HTML report
    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title} - Trade Risk Manager</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          h1 { color: #1a6af5; border-bottom: 2px solid #1a6af5; padding-bottom: 10px; }
          .stat { display: inline-block; margin: 10px; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .stat-label { font-size: 12px; color: #64748b; }
          .stat-value { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border: 1px solid #e2e8f0; text-align: right; }
          th { background: #f8fafc; }
          .win { color: #22c55e; }
          .loss { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
        
        <div>
          <div class="stat">
            <div class="stat-label">عدد الصفقات</div>
            <div class="stat-value">${filteredTrades.length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">الصفقات الرابحة</div>
            <div class="stat-value win">${filteredTrades.filter(t => t.result === 'win').length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">الصفقات الخاسرة</div>
            <div class="stat-value loss">${filteredTrades.filter(t => t.result === 'loss').length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">نسبة النجاح</div>
            <div class="stat-value">${filteredTrades.length > 0 ? 
              ((filteredTrades.filter(t => t.result === 'win').length / filteredTrades.length) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الرمز</th>
              <th>النوع</th>
              <th>النتيجة</th>
              <th>الربح/الخسارة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTrades.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.symbol}</td>
                <td>${t.type === 'buy' ? 'شراء' : 'بيع'}</td>
                <td class="${t.result}">${t.result === 'win' ? 'رابحة' : t.result === 'loss' ? 'خاسرة' : 'تعادل'}</td>
                <td class="${t.profitLoss >= 0 ? 'win' : 'loss'}">${formatCurrency(t.profitLoss)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const { filteredTrades } = generateReport();
    
    const data = filteredTrades.map(t => ({
      التاريخ: t.date,
      الرمز: t.symbol,
      النوع: t.type === 'buy' ? 'شراء' : 'بيع',
      'حجم اللوت': t.lotSize,
      'سعر الدخول': t.entryPrice,
      'سعر الخروج': t.exitPrice,
      النتيجة: t.result === 'win' ? 'رابحة' : t.result === 'loss' ? 'خاسرة' : 'تعادل',
      'الربح/الخسارة': t.profitLoss,
      النقاط: t.pips,
      الملاحظات: t.notes,
    }));

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            التقارير
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إنشاء وتصدير تقارير أداء متقدمة
          </p>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          نوع التقرير
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'daily', label: 'يومي', icon: '📅' },
            { id: 'weekly', label: 'أسبوعي', icon: '📆' },
            { id: 'monthly', label: 'شهري', icon: '🗓️' },
            { id: 'custom', label: 'مخصص', icon: '🎯' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as typeof reportType)}
              className={`p-4 rounded-xl border-2 transition-all ${
                reportType === type.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <span className={`font-medium ${
                reportType === type.id ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {reportType === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Input
              label="من تاريخ"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="إلى تاريخ"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* Report Preview */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          معاينة التقرير
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">عدد الصفقات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportType === 'daily' ? dailyStats.totalTrades :
               reportType === 'weekly' ? weeklyStats.totalTrades :
               reportType === 'monthly' ? monthlyStats.totalTrades :
               trades.filter(t => t.date >= dateFrom && t.date <= dateTo).length}
            </p>
          </div>
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الرابحة</p>
            <p className="text-2xl font-bold text-success-600">
              {reportType === 'daily' ? dailyStats.winningTrades :
               reportType === 'weekly' ? weeklyStats.winningTrades :
               reportType === 'monthly' ? monthlyStats.winningTrades :
               trades.filter(t => t.date >= dateFrom && t.date <= dateTo && t.result === 'win').length}
            </p>
          </div>
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الخاسرة</p>
            <p className="text-2xl font-bold text-danger-600">
              {reportType === 'daily' ? dailyStats.losingTrades :
               reportType === 'weekly' ? weeklyStats.losingTrades :
               reportType === 'monthly' ? monthlyStats.losingTrades :
               trades.filter(t => t.date >= dateFrom && t.date <= dateTo && t.result === 'loss').length}
            </p>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">صافي الربح</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(
                reportType === 'daily' ? dailyStats.netProfit :
                reportType === 'weekly' ? weeklyStats.netProfit :
                reportType === 'monthly' ? monthlyStats.netProfit :
                trades.filter(t => t.date >= dateFrom && t.date <= dateTo).reduce((sum, t) => sum + t.profitLoss, 0)
              )}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportPDF}
            icon={<Download className="w-4 h-4" />}
            variant="secondary"
          >
            تصدير PDF
          </Button>
          <Button
            onClick={exportExcel}
            icon={<Download className="w-4 h-4" />}
            variant="secondary"
          >
            تصدير Excel
          </Button>
          <Button
            onClick={() => window.print()}
            icon={<FileText className="w-4 h-4" />}
            variant="secondary"
          >
            طباعة
          </Button>
        </div>
      </Card>
    </div>
  );
};

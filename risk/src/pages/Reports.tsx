import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatting';
import { getWeekRange, getMonthRange } from '../utils/calculations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Reports: React.FC = () => {
  const { trades, settings, getDailyStats, getWeeklyStats, getMonthlyStats } = useStore();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const getFilteredTrades = () => {
    switch (reportType) {
      case 'daily': {
        const today = new Date().toISOString().split('T')[0];
        return trades.filter(t => t.date === today);
      }
      case 'weekly': {
        const { start, end } = getWeekRange(new Date());
        const s = start.toISOString().split('T')[0];
        const e = end.toISOString().split('T')[0];
        return trades.filter(t => t.date >= s && t.date <= e);
      }
      case 'monthly': {
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return trades.filter(t => t.date.startsWith(prefix));
      }
      case 'custom':
        return trades.filter(t => t.date >= dateFrom && t.date <= dateTo);
      default:
        return trades;
    }
  };

  const getTitle = () => {
    switch (reportType) {
      case 'daily': return 'تقرير يومي';
      case 'weekly': return 'تقرير أسبوعي';
      case 'monthly': return 'تقرير شهري';
      case 'custom': return 'تقرير مخصص';
    }
  };

  const exportPDF = () => {
    const filteredTrades = getFilteredTrades();
    const title = getTitle();
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // Title
    doc.setFontSize(20);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 105, 28, { align: 'center' });

    // Stats summary
    const wins = filteredTrades.filter(t => t.result === 'win').length;
    const losses = filteredTrades.filter(t => t.result === 'loss').length;
    const netPL = filteredTrades.reduce((sum, t) => sum + t.profitLoss, 0);
    const winRate = filteredTrades.length > 0 ? ((wins / filteredTrades.length) * 100).toFixed(1) : '0';

    doc.setFontSize(11);
    doc.text(`عدد الصفقات: ${filteredTrades.length}`, 14, 40);
    doc.text(`الصفقات الرابحة: ${wins}`, 14, 48);
    doc.text(`الصفقات الخاسرة: ${losses}`, 14, 56);
    doc.text(`نسبة النجاح: ${winRate}%`, 14, 64);
    doc.text(`صافي الربح/الخسارة: ${formatCurrency(netPL)}`, 14, 72);

    // Trades table
    if (filteredTrades.length > 0) {
      const tableData = filteredTrades.map(t => [
        t.date,
        t.symbol,
        t.type === 'buy' ? 'شراء' : 'بيع',
        t.result === 'win' ? 'رابحة' : t.result === 'loss' ? 'خاسرة' : 'تعادل',
        formatCurrency(t.profitLoss),
        `${t.pips}`,
        t.notes || '-',
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['التاريخ', 'الرمز', 'النوع', 'النتيجة', 'الربح/الخسارة', 'النقاط', 'الملاحظات']],
        body: tableData,
        styles: { fontSize: 9, halign: 'right' },
        headStyles: { fillColor: [26, 106, 245] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    doc.save(`report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportExcel = () => {
    const filteredTrades = getFilteredTrades();

    const data = filteredTrades.map(t => ({
      'التاريخ': t.date,
      'الرمز': t.symbol,
      'النوع': t.type === 'buy' ? 'شراء' : 'بيع',
      'حجم اللوت': t.lotSize,
      'سعر الدخول': t.entryPrice,
      'سعر الخروج': t.exitPrice,
      'النتيجة': t.result === 'win' ? 'رابحة' : t.result === 'loss' ? 'خاسرة' : 'تعادل',
      'الربح/الخسارة': t.profitLoss,
      'النقاط': t.pips,
      'الرسوم': t.fees,
      'المدة (دقيقة)': t.duration,
      'الملاحظات': t.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length * 2, 12),
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقارير');
    XLSX.writeFile(wb, `trades-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredTrades = getFilteredTrades();
  const wins = filteredTrades.filter(t => t.result === 'win').length;
  const losses = filteredTrades.filter(t => t.result === 'loss').length;
  const netPL = filteredTrades.reduce((sum, t) => sum + t.profitLoss, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          التقارير
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          إنشاء وتصدير تقارير أداء متقدمة
        </p>
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
              {filteredTrades.length}
            </p>
          </div>
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الرابحة</p>
            <p className="text-2xl font-bold text-success-600">
              {wins}
            </p>
          </div>
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">الصفقات الخاسرة</p>
            <p className="text-2xl font-bold text-danger-600">
              {losses}
            </p>
          </div>
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">صافي الربح</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(netPL)}
            </p>
          </div>
        </div>

        {filteredTrades.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            لا توجد صفقات في هذه الفترة
          </p>
        )}

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportPDF}
            icon={<Download className="w-4 h-4" />}
            variant="secondary"
            disabled={filteredTrades.length === 0}
          >
            تصدير PDF
          </Button>
          <Button
            onClick={exportExcel}
            icon={<Download className="w-4 h-4" />}
            variant="secondary"
            disabled={filteredTrades.length === 0}
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

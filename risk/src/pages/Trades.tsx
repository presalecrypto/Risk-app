import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download,
  Upload,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';
import {
  formatCurrency,
  formatShortDate,
  getResultLabel,
  getTypeLabel,
  getProfitColor,
} from '../utils/formatting';
import { downloadCSV } from '../utils/formatting';
import type { Trade, TradeFilter, SortConfig } from '../types';

export const Trades: React.FC = () => {
  const {
    trades,
    symbols,
    searchQuery,
    setSearchQuery,
    tradeFilter,
    setTradeFilter,
    tradeSort,
    setTradeSort,
    tradePage,
    setTradePage,
    getFilteredTrades,
    setSelectedTrade,
    setShowAddTradeModal,
    setShowEditTradeModal,
    setShowDeleteConfirm,
    deleteTrade,
    deleteAllTrades,
  } = useStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const filteredTrades = getFilteredTrades();
  const pageSize = 10;
  const totalPages = Math.ceil(filteredTrades.length / pageSize);
  const paginatedTrades = filteredTrades.slice(
    (tradePage - 1) * pageSize,
    tradePage * pageSize
  );

  const handleSort = (field: string) => {
    setTradeSort({
      field,
      direction: tradeSort.field === field && tradeSort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleExportCSV = () => {
    const data = filteredTrades.map(t => ({
      التاريخ: t.date,
      الرمز: t.symbol,
      النوع: t.type === 'buy' ? 'شراء' : 'بيع',
      'حجم اللوت': t.lotSize,
      'سعر الدخول': t.entryPrice,
      'سعر الخروج': t.exitPrice,
      النتيجة: getResultLabel(t.result),
      'الربح/الخسارة': t.profitLoss,
      النقاط: t.pips,
      الملاحظات: t.notes,
    }));
    downloadCSV(data, `trades-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDeleteTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowDeleteConfirm(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowEditTradeModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إدارة الصفقات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredTrades.length} صفقة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            تصدير
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddTradeModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة صفقة
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="بحث بالرمز أو الملاحظات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            تصفية
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Select
              placeholder="الرمز"
              value={tradeFilter.symbol || ''}
              onChange={(e) => setTradeFilter({ symbol: e.target.value || undefined })}
              options={symbols.map(s => ({ value: s.name, label: s.name }))}
            />
            <Select
              placeholder="النوع"
              value={tradeFilter.type || ''}
              onChange={(e) => setTradeFilter({ type: (e.target.value as 'buy' | 'sell') || undefined })}
              options={[
                { value: 'buy', label: 'شراء' },
                { value: 'sell', label: 'بيع' },
              ]}
            />
            <Select
              placeholder="النتيجة"
              value={tradeFilter.result || ''}
              onChange={(e) => setTradeFilter({ result: (e.target.value as 'win' | 'loss' | 'breakeven') || undefined })}
              options={[
                { value: 'win', label: 'رابحة' },
                { value: 'loss', label: 'خاسرة' },
                { value: 'breakeven', label: 'تعادل' },
              ]}
            />
            <Button
              variant="ghost"
              onClick={() => setTradeFilter({})}
            >
              مسح التصفية
            </Button>
          </div>
        )}
      </Card>

      {/* Trades Table */}
      <Card padding="none">
        {paginatedTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th
                    className="text-right px-6 py-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      التاريخ
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-4 font-medium">الرمز</th>
                  <th className="text-right px-4 py-4 font-medium">النوع</th>
                  <th className="text-right px-4 py-4 font-medium">اللوت</th>
                  <th
                    className="text-right px-4 py-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('result')}
                  >
                    <div className="flex items-center gap-1">
                      النتيجة
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-right px-4 py-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('profitLoss')}
                  >
                    <div className="flex items-center gap-1">
                      الربح/الخسارة
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map(trade => (
                  <tr
                    key={trade.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatShortDate(trade.date)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="gray">{trade.symbol}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={trade.type === 'buy' ? 'success' : 'danger'}>
                        {getTypeLabel(trade.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {trade.lotSize}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={trade.result === 'win' ? 'success' : trade.result === 'loss' ? 'danger' : 'warning'}>
                        {getResultLabel(trade.result)}
                      </Badge>
                    </td>
                    <td className={`px-4 py-4 font-medium ${getProfitColor(trade.profitLoss)}`}>
                      {formatCurrency(trade.profitLoss)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTrade(trade)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrade(trade)}
                          className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد صفقات</p>
            <p className="text-sm mt-1">ابدأ بإضافة صفقاتك الأولى</p>
            <Button
              className="mt-4"
              onClick={() => setShowAddTradeModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              إضافة صفقة
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              عرض {(tradePage - 1) * pageSize + 1} - {Math.min(tradePage * pageSize, filteredTrades.length)} من {filteredTrades.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTradePage(tradePage - 1)}
                disabled={tradePage === 1}
              >
                السابق
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTradePage(tradePage + 1)}
                disabled={tradePage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete All Confirmation */}
      <Modal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        title="حذف جميع الصفقات"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          هل أنت متأكد من حذف جميع الصفقات؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteAllConfirm(false)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteAllTrades();
              setShowDeleteAllConfirm(false);
            }}
          >
            حذف الكل
          </Button>
        </div>
      </Modal>
    </div>
  );
};

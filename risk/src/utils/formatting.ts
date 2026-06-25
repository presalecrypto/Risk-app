import type { Trade, TradeType, TradeResult, TradeFilter, PaginatedData, SortConfig } from '../types';

// ============================================================
// Formatters
// ============================================================

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercent = (num: number, decimals: number = 1): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

export const formatPips = (pips: number): string => {
  return `${pips >= 0 ? '+' : ''}${pips.toFixed(1)} pips`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${mins} دقيقة`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================
// ID Generation
// ============================================================

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================
// Trade Filtering & Sorting
// ============================================================

export const filterTrades = (trades: Trade[], filter: TradeFilter): Trade[] => {
  return trades.filter(trade => {
    if (filter.dateFrom && trade.date < filter.dateFrom) return false;
    if (filter.dateTo && trade.date > filter.dateTo) return false;
    if (filter.symbol && trade.symbol !== filter.symbol) return false;
    if (filter.type && trade.type !== filter.type) return false;
    if (filter.result && trade.result !== filter.result) return false;
    if (filter.minProfit !== undefined && trade.profitLoss < filter.minProfit) return false;
    if (filter.maxProfit !== undefined && trade.profitLoss > filter.maxProfit) return false;
    return true;
  });
};

export const sortTrades = (trades: Trade[], sort: SortConfig): Trade[] => {
  return [...trades].sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'date':
        comparison = a.date.localeCompare(b.date);
        break;
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case 'profitLoss':
        comparison = a.profitLoss - b.profitLoss;
        break;
      case 'result':
        const resultOrder = { win: 1, breakeven: 2, loss: 3 };
        comparison = resultOrder[a.result] - resultOrder[b.result];
        break;
      case 'lotSize':
        comparison = a.lotSize - b.lotSize;
        break;
      default:
        comparison = 0;
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });
};

export const paginateTrades = (
  trades: Trade[],
  page: number,
  pageSize: number
): PaginatedData<Trade> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: trades.slice(start, end),
    total: trades.length,
    page,
    pageSize,
    totalPages: Math.ceil(trades.length / pageSize),
  };
};

// ============================================================
// Validation
// ============================================================

export const validateTrade = (trade: Partial<Trade>): string[] => {
  const errors: string[] = [];
  if (!trade.symbol) errors.push('الرمز مطلوب');
  if (!trade.type) errors.push('نوع الصفقة مطلوب');
  if (!trade.lotSize || trade.lotSize <= 0) errors.push('حجم اللوت يجب أن يكون أكبر من 0');
  if (!trade.entryPrice || trade.entryPrice <= 0) errors.push('سعر الدخول مطلوب');
  if (trade.result && !trade.profitLoss && trade.profitLoss !== 0) {
    errors.push('الربح أو الخسارة مطلوب');
  }
  return errors;
};

export const validateSettings = (settings: Partial<import('../types').UserSettings>): string[] => {
  const errors: string[] = [];
  if (!settings.initialCapital || settings.initialCapital <= 0) errors.push('رأس المال يجب أن يكون أكبر من 0');
  if (!settings.riskPerTrade || settings.riskPerTrade <= 0 || settings.riskPerTrade > 100) {
    errors.push('نسبة المخاطرة يجب أن تكون بين 1% و 100%');
  }
  if (!settings.maxDailyLoss || settings.maxDailyLoss <= 0) errors.push('الحد الأقصى للخسارة اليومية مطلوب');
  if (!settings.maxWeeklyLoss || settings.maxWeeklyLoss <= 0) errors.push('الحد الأقصى للخسارة الأسبوعية مطلوب');
  return errors;
};

// ============================================================
// Color Utilities
// ============================================================

export const getResultColor = (result: TradeResult): string => {
  switch (result) {
    case 'win': return 'text-success-600 bg-success-50';
    case 'loss': return 'text-danger-600 bg-danger-50';
    case 'breakeven': return 'text-warning-600 bg-warning-50';
  }
};

export const getResultLabel = (result: TradeResult): string => {
  switch (result) {
    case 'win': return 'رابحة';
    case 'loss': return 'خاسرة';
    case 'breakeven': return 'تعادل';
  }
};

export const getTypeLabel = (type: TradeType): string => {
  switch (type) {
    case 'buy': return 'شراء';
    case 'sell': return 'بيع';
  }
};

export const getTypeColor = (type: TradeType): string => {
  switch (type) {
    case 'buy': return 'text-success-600 bg-success-50';
    case 'sell': return 'text-danger-600 bg-danger-50';
  }
};

export const getProfitColor = (amount: number): string => {
  if (amount > 0) return 'text-success-600';
  if (amount < 0) return 'text-danger-600';
  return 'text-gray-500';
};

export const getProfitBgColor = (amount: number): string => {
  if (amount > 0) return 'bg-success-50 text-success-700';
  if (amount < 0) return 'bg-danger-50 text-danger-700';
  return 'bg-gray-50 text-gray-700';
};

// ============================================================
// Export Helpers
// ============================================================

export const downloadJSON = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => String(row[h])).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

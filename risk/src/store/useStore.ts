import { create } from 'zustand';
import type {
  UserSettings,
  Trade,
  TradingGoals,
  RiskAlert,
  Notification,
  TradeSymbol,
  Backup,
  TradeFilter,
  SortConfig,
  TradeFormData,
  TradeResult,
} from '../types';
import * as storage from '../utils/storage';
import { generateId } from '../utils/formatting';
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateEquityCurve,
  calculateMaxDrawdown,
  checkDailyLossLimit,
  checkWeeklyLossLimit,
} from '../utils/calculations';
import { getWeekRange, getMonthRange } from '../utils/calculations';

interface AppState {
  // Data
  settings: UserSettings | null;
  trades: Trade[];
  goals: TradingGoals | null;
  alerts: RiskAlert[];
  notifications: Notification[];
  symbols: TradeSymbol[];
  isSetupComplete: boolean;
  theme: 'light' | 'dark';

  // UI State
  currentPage: string;
  showMobileMenu: boolean;
  tradeFilter: TradeFilter;
  tradeSort: SortConfig;
  tradePage: number;
  selectedTrade: Trade | null;
  showAddTradeModal: boolean;
  showEditTradeModal: boolean;
  showDeleteConfirm: boolean;
  searchQuery: string;

  // Actions - Setup
  completeSetup: (settings: UserSettings) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Actions - Trades
  addTrade: (formData: TradeFormData) => void;
  updateTrade: (id: string, formData: Partial<TradeFormData>) => void;
  deleteTrade: (id: string) => void;
  deleteAllTrades: () => void;
  setSelectedTrade: (trade: Trade | null) => void;
  setShowAddTradeModal: (show: boolean) => void;
  setShowEditTradeModal: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;

  // Actions - Goals
  updateGoals: (goals: Partial<TradingGoals>) => void;

  // Actions - Alerts
  addAlert: (alert: Omit<RiskAlert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Actions - Symbols
  addSymbol: (symbol: Omit<TradeSymbol, 'id'>) => void;
  deleteSymbol: (id: string) => void;

  // Actions - UI
  setCurrentPage: (page: string) => void;
  setShowMobileMenu: (show: boolean) => void;
  setTradeFilter: (filter: Partial<TradeFilter>) => void;
  setTradeSort: (sort: SortConfig) => void;
  setTradePage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;

  // Actions - Backup
  createBackup: () => Backup;
  restoreBackup: (id: string) => boolean;
  exportData: () => string;
  importData: (json: string) => boolean;

  // Actions - Risk
  checkRiskLimits: () => void;

  // Computed - Getters
  getCurrentCapital: () => number;
  getTodayTrades: () => Trade[];
  getWeekTrades: () => Trade[];
  getMonthTrades: () => Trade[];
  getDailyStats: () => ReturnType<typeof calculateDailyStats>;
  getWeeklyStats: () => ReturnType<typeof calculateWeeklyStats>;
  getMonthlyStats: () => ReturnType<typeof calculateMonthlyStats>;
  getEquityCurve: () => ReturnType<typeof calculateEquityCurve>;
  getMaxDrawdown: () => number;
  getFilteredTrades: () => Trade[];
  getWinRate: () => number;
  getGrowthRate: () => number;
  getUnreadAlerts: () => RiskAlert[];
  getUnreadNotifications: () => Notification[];
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  settings: storage.getSettings(),
  trades: storage.getTrades(),
  goals: storage.getGoals(),
  alerts: storage.getAlerts(),
  notifications: storage.getNotifications(),
  symbols: storage.getSymbols(),
  isSetupComplete: storage.getSettings() !== null,
  theme: storage.getTheme(),

  // UI State
  currentPage: 'dashboard',
  showMobileMenu: false,
  tradeFilter: {},
  tradeSort: { field: 'date', direction: 'desc' },
  tradePage: 1,
  selectedTrade: null,
  showAddTradeModal: false,
  showEditTradeModal: false,
  showDeleteConfirm: false,
  searchQuery: '',

  // ============================================================
  // Setup Actions
  // ============================================================

  completeSetup: (settings) => {
    storage.saveSettings(settings);
    const goals = storage.createDefaultGoals();
    storage.saveGoals(goals);
    set({
      settings,
      goals,
      isSetupComplete: true,
    });
  },

  updateSettings: (updates) => {
    const current = get().settings;
    if (!current) return;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    storage.saveSettings(updated);
    set({ settings: updated });
  },

  // ============================================================
  // Trade Actions
  // ============================================================

  addTrade: (formData) => {
    const now = new Date();
    const trade: Trade = {
      id: generateId(),
      date: getTodayStr(),
      dayOfWeek: now.toLocaleDateString('ar-EG', { weekday: 'long' }),
      symbol: formData.symbol,
      type: formData.type,
      lotSize: formData.lotSize,
      entryPrice: formData.entryPrice,
      exitPrice: formData.exitPrice,
      stopLoss: formData.stopLoss,
      takeProfit: formData.takeProfit,
      result: formData.result,
      profitLoss: formData.profitLoss,
      pips: formData.pips,
      fees: formData.fees,
      notes: formData.notes,
      screenshot: formData.screenshot,
      duration: formData.duration,
      riskRewardRatio: formData.stopLoss > 0 && formData.takeProfit > 0
        ? Math.abs(formData.takeProfit - formData.entryPrice) / Math.abs(formData.entryPrice - formData.stopLoss)
        : 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const trades = [...get().trades, trade];
    storage.saveTrades(trades);
    set({ trades, showAddTradeModal: false });

    // Check risk limits
    setTimeout(() => get().checkRiskLimits(), 100);
  },

  updateTrade: (id, formData) => {
    const trades = get().trades.map(t =>
      t.id === id ? { ...t, ...formData, updatedAt: new Date().toISOString() } : t
    );
    storage.saveTrades(trades);
    set({ trades, showEditTradeModal: false, selectedTrade: null });
  },

  deleteTrade: (id) => {
    const trades = get().trades.filter(t => t.id !== id);
    storage.saveTrades(trades);
    set({ trades, showDeleteConfirm: false, selectedTrade: null });
  },

  deleteAllTrades: () => {
    storage.saveTrades([]);
    set({ trades: [] });
  },

  setSelectedTrade: (trade) => set({ selectedTrade: trade }),
  setShowAddTradeModal: (show) => set({ showAddTradeModal: show }),
  setShowEditTradeModal: (show) => set({ showEditTradeModal: show }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),

  // ============================================================
  // Goals Actions
  // ============================================================

  updateGoals: (updates) => {
    const current = get().goals || storage.createDefaultGoals();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    storage.saveGoals(updated);
    set({ goals: updated });
  },

  // ============================================================
  // Alert Actions
  // ============================================================

  addAlert: (alertData) => {
    const alert: RiskAlert = {
      ...alertData,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    const alerts = [alert, ...get().alerts].slice(0, 50);
    storage.saveAlerts(alerts);
    set({ alerts });
  },

  markAlertRead: (id) => {
    const alerts = get().alerts.map(a =>
      a.id === id ? { ...a, read: true } : a
    );
    storage.saveAlerts(alerts);
    set({ alerts });
  },

  clearAlerts: () => {
    storage.saveAlerts([]);
    set({ alerts: [] });
  },

  // ============================================================
  // Notification Actions
  // ============================================================

  addNotification: (notifData) => {
    const notification: Notification = {
      ...notifData,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    const notifications = [notification, ...get().notifications].slice(0, 100);
    storage.saveNotifications(notifications);
    set({ notifications });
  },

  markNotificationRead: (id) => {
    const notifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    storage.saveNotifications(notifications);
    set({ notifications });
  },

  markAllNotificationsRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, read: true }));
    storage.saveNotifications(notifications);
    set({ notifications });
  },

  clearNotifications: () => {
    storage.saveNotifications([]);
    set({ notifications: [] });
  },

  // ============================================================
  // Symbol Actions
  // ============================================================

  addSymbol: (symbolData) => {
    const symbol: TradeSymbol = { ...symbolData, id: generateId() };
    const symbols = [...get().symbols, symbol];
    storage.saveSymbols(symbols);
    set({ symbols });
  },

  deleteSymbol: (id) => {
    const symbols = get().symbols.filter(s => s.id !== id);
    storage.saveSymbols(symbols);
    set({ symbols });
  },

  // ============================================================
  // UI Actions
  // ============================================================

  setCurrentPage: (page) => set({ currentPage: page, showMobileMenu: false }),
  setShowMobileMenu: (show) => set({ showMobileMenu: show }),
  
  setTradeFilter: (filter) => set(state => ({
    tradeFilter: { ...state.tradeFilter, ...filter },
    tradePage: 1,
  })),
  
  setTradeSort: (sort) => set({ tradeSort: sort, tradePage: 1 }),
  setTradePage: (page) => set({ tradePage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, tradePage: 1 }),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    storage.saveTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: newTheme });
  },

  // ============================================================
  // Backup Actions
  // ============================================================

  createBackup: () => {
    const backup = storage.createBackup();
    get().addNotification({
      type: 'system',
      title: 'نسخة احتياطية',
      message: 'تم إنشاء نسخة احتياطية بنجاح',
    });
    return backup;
  },

  restoreBackup: (id) => {
    const success = storage.restoreBackup(id);
    if (success) {
      set({
        settings: storage.getSettings(),
        trades: storage.getTrades(),
        goals: storage.getGoals(),
        symbols: storage.getSymbols(),
        alerts: storage.getAlerts(),
        notifications: storage.getNotifications(),
      });
      get().addNotification({
        type: 'system',
        title: 'استعادة البيانات',
        message: 'تمت استعادة البيانات بنجاح',
      });
    }
    return success;
  },

  exportData: () => {
    return storage.exportAllData();
  },

  importData: (json) => {
    const success = storage.importData(json);
    if (success) {
      set({
        settings: storage.getSettings(),
        trades: storage.getTrades(),
        goals: storage.getGoals(),
        symbols: storage.getSymbols(),
        alerts: storage.getAlerts(),
        notifications: storage.getNotifications(),
      });
    }
    return success;
  },

  // ============================================================
  // Risk Actions
  // ============================================================

  checkRiskLimits: () => {
    const { settings, trades } = get();
    if (!settings) return;

    const currentCapital = get().getCurrentCapital();
    const todayStr = getTodayStr();
    const dailyCheck = checkDailyLossLimit(trades, todayStr, currentCapital, settings.maxDailyLoss);
    const weeklyCheck = checkWeeklyLossLimit(trades, currentCapital, settings.maxWeeklyLoss);

    if (dailyCheck.exceeded) {
      get().addAlert({
        type: 'daily_loss',
        severity: 'danger',
        message: `تجاوز الحد اليومي للخسائر! الخسارة الحالية: $${dailyCheck.currentLoss.toFixed(2)} من $${dailyCheck.limit.toFixed(2)}`,
      });
    }

    if (weeklyCheck.exceeded) {
      get().addAlert({
        type: 'weekly_loss',
        severity: 'danger',
        message: `تجاوز الحد الأسبوعي للخسائر! الخسارة الحالية: $${weeklyCheck.currentLoss.toFixed(2)} من $${weeklyCheck.limit.toFixed(2)}`,
      });
    }
  },

  // ============================================================
  // Computed Getters
  // ============================================================

  getCurrentCapital: () => {
    const { settings, trades } = get();
    if (!settings) return 0;
    const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0);
    return settings.initialCapital + totalPL;
  },

  getTodayTrades: () => {
    const todayStr = getTodayStr();
    return get().trades.filter(t => t.date === todayStr);
  },

  getWeekTrades: () => {
    const { start, end } = getWeekRange(new Date());
    return get().trades.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  },

  getMonthTrades: () => {
    const { start, end } = getMonthRange(new Date());
    return get().trades.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  },

  getDailyStats: () => {
    const { settings, trades } = get();
    const stats = calculateDailyStats(trades, getTodayStr());
    stats.equity = settings ? settings.initialCapital + trades.filter(t => t.date === getTodayStr()).reduce((s, t) => s + t.profitLoss, 0) : 0;
    return stats;
  },

  getWeeklyStats: () => {
    const { settings, trades } = get();
    if (!settings) return calculateWeeklyStats([], '', '', 0);
    const { start, end } = getWeekRange(new Date());
    return calculateWeeklyStats(trades, start.toISOString().split('T')[0], end.toISOString().split('T')[0], settings.initialCapital);
  },

  getMonthlyStats: () => {
    const { settings, trades } = get();
    if (!settings) return calculateMonthlyStats([], 0, 0, 0);
    const now = new Date();
    return calculateMonthlyStats(trades, now.getFullYear(), now.getMonth(), settings.initialCapital);
  },

  getEquityCurve: () => {
    const { settings, trades } = get();
    if (!settings) return [];
    return calculateEquityCurve(trades, settings.initialCapital);
  },

  getMaxDrawdown: () => {
    const curve = get().getEquityCurve();
    return calculateMaxDrawdown(curve);
  },

  getFilteredTrades: () => {
    const { trades, tradeFilter, searchQuery } = get();
    let filtered = trades;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.symbol.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.date.includes(q)
      );
    }

    if (tradeFilter.dateFrom) filtered = filtered.filter(t => t.date >= tradeFilter.dateFrom!);
    if (tradeFilter.dateTo) filtered = filtered.filter(t => t.date <= tradeFilter.dateTo!);
    if (tradeFilter.symbol) filtered = filtered.filter(t => t.symbol === tradeFilter.symbol);
    if (tradeFilter.type) filtered = filtered.filter(t => t.type === tradeFilter.type);
    if (tradeFilter.result) filtered = filtered.filter(t => t.result === tradeFilter.result);
    if (tradeFilter.minProfit !== undefined) filtered = filtered.filter(t => t.profitLoss >= tradeFilter.minProfit!);
    if (tradeFilter.maxProfit !== undefined) filtered = filtered.filter(t => t.profitLoss <= tradeFilter.maxProfit!);

    return filtered;
  },

  getWinRate: () => {
    const trades = get().trades;
    if (trades.length === 0) return 0;
    const wins = trades.filter(t => t.result === 'win').length;
    return (wins / trades.length) * 100;
  },

  getGrowthRate: () => {
    const { settings } = get();
    if (!settings) return 0;
    const capital = get().getCurrentCapital();
    return ((capital - settings.initialCapital) / settings.initialCapital) * 100;
  },

  getUnreadAlerts: () => get().alerts.filter(a => !a.read),
  getUnreadNotifications: () => get().notifications.filter(n => !n.read),
}));

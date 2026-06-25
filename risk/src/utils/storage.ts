import type { TradeSymbol, UserSettings, TradingGoals, Trade, RiskAlert, Notification, Backup } from '../types';
import { generateId } from './formatting';

// ============================================================
// Storage Keys
// ============================================================

const KEYS = {
  SETTINGS: 'trade_rm_settings',
  TRADES: 'trade_rm_trades',
  GOALS: 'trade_rm_goals',
  SYMBOLS: 'trade_rm_symbols',
  ALERTS: 'trade_rm_alerts',
  NOTIFICATIONS: 'trade_rm_notifications',
  THEME: 'trade_rm_theme',
  BACKUPS: 'trade_rm_backups',
};

// ============================================================
// Generic Storage Helpers
// ============================================================

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

// ============================================================
// Settings
// ============================================================

export const getSettings = (): UserSettings | null => {
  return getStorageItem<UserSettings | null>(KEYS.SETTINGS, null);
};

export const saveSettings = (settings: UserSettings): void => {
  setStorageItem(KEYS.SETTINGS, { ...settings, updatedAt: new Date().toISOString() });
};

export const createDefaultSettings = (data: Partial<UserSettings>): UserSettings => {
  return {
    id: generateId(),
    initialCapital: data.initialCapital || 1000,
    currency: data.currency || 'USD',
    riskPerTrade: data.riskPerTrade || 1,
    maxDailyLoss: data.maxDailyLoss || 3,
    maxWeeklyLoss: data.maxWeeklyLoss || 8,
    weeklyTarget: data.weeklyTarget || 10,
    monthlyTarget: data.monthlyTarget || 40,
    yearlyTarget: data.yearlyTarget || 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// ============================================================
// Trades
// ============================================================

export const getTrades = (): Trade[] => {
  return getStorageItem<Trade[]>(KEYS.TRADES, []);
};

export const saveTrades = (trades: Trade[]): void => {
  setStorageItem(KEYS.TRADES, trades);
};

export const addTrade = (trade: Trade): void => {
  const trades = getTrades();
  trades.push(trade);
  saveTrades(trades);
};

export const updateTrade = (id: string, updates: Partial<Trade>): void => {
  const trades = getTrades();
  const index = trades.findIndex(t => t.id === id);
  if (index !== -1) {
    trades[index] = { ...trades[index], ...updates, updatedAt: new Date().toISOString() };
    saveTrades(trades);
  }
};

export const deleteTrade = (id: string): void => {
  const trades = getTrades().filter(t => t.id !== id);
  saveTrades(trades);
};

// ============================================================
// Goals
// ============================================================

export const getGoals = (): TradingGoals | null => {
  return getStorageItem<TradingGoals | null>(KEYS.GOALS, null);
};

export const saveGoals = (goals: TradingGoals): void => {
  setStorageItem(KEYS.GOALS, { ...goals, updatedAt: new Date().toISOString() });
};

export const createDefaultGoals = (): TradingGoals => {
  return {
    id: generateId(),
    dailyGoal: 0,
    weeklyGoal: 0,
    monthlyGoal: 0,
    yearlyGoal: 0,
    dailyProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    yearlyProgress: 0,
    dailyTarget: 0,
    weeklyTarget: 0,
    monthlyTarget: 0,
    yearlyTarget: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// ============================================================
// Symbols
// ============================================================

export const getSymbols = (): TradeSymbol[] => {
  const stored = getStorageItem<TradeSymbol[] | null>(KEYS.SYMBOLS, null);
  if (stored && stored.length > 0) return stored;
  const defaults: TradeSymbol[] = [
    { id: 'xauusd', name: 'XAUUSD', category: 'Commodities', pipValue: 0.01, isCustom: false },
    { id: 'xagusd', name: 'XAGUSD', category: 'Commodities', pipValue: 0.01, isCustom: false },
    { id: 'usoil', name: 'USOIL', category: 'Energy', pipValue: 0.01, isCustom: false },
    { id: 'eurusd', name: 'EURUSD', category: 'Forex', pipValue: 0.0001, isCustom: false },
    { id: 'gbpusd', name: 'GBPUSD', category: 'Forex', pipValue: 0.0001, isCustom: false },
    { id: 'usdjpy', name: 'USDJPY', category: 'Forex', pipValue: 0.01, isCustom: false },
  ];
  setStorageItem(KEYS.SYMBOLS, defaults);
  return defaults;
};

export const saveSymbols = (symbols: TradeSymbol[]): void => {
  setStorageItem(KEYS.SYMBOLS, symbols);
};

export const addSymbol = (symbol: TradeSymbol): void => {
  const symbols = getSymbols();
  symbols.push(symbol);
  saveSymbols(symbols);
};

export const deleteSymbol = (id: string): void => {
  const symbols = getSymbols().filter(s => s.id !== id);
  saveSymbols(symbols);
};

// ============================================================
// Alerts
// ============================================================

export const getAlerts = (): RiskAlert[] => {
  return getStorageItem<RiskAlert[]>(KEYS.ALERTS, []);
};

export const saveAlerts = (alerts: RiskAlert[]): void => {
  setStorageItem(KEYS.ALERTS, alerts);
};

export const addAlert = (alert: RiskAlert): void => {
  const alerts = getAlerts();
  alerts.unshift(alert);
  if (alerts.length > 50) alerts.pop();
  saveAlerts(alerts);
};

export const markAlertRead = (id: string): void => {
  const alerts = getAlerts();
  const alert = alerts.find(a => a.id === id);
  if (alert) {
    alert.read = true;
    saveAlerts(alerts);
  }
};

// ============================================================
// Notifications
// ============================================================

export const getNotifications = (): Notification[] => {
  return getStorageItem<Notification[]>(KEYS.NOTIFICATIONS, []);
};

export const saveNotifications = (notifications: Notification[]): void => {
  setStorageItem(KEYS.NOTIFICATIONS, notifications);
};

export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.unshift(notification);
  if (notifications.length > 100) notifications.pop();
  saveNotifications(notifications);
};

export const markNotificationRead = (id: string): void => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
};

// ============================================================
// Theme
// ============================================================

export const getTheme = (): 'light' | 'dark' => {
  return getStorageItem<'light' | 'dark'>(KEYS.THEME, 'dark');
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  setStorageItem(KEYS.THEME, theme);
};

// ============================================================
// Backup & Restore
// ============================================================

export const createBackup = (): Backup => {
  const data = {
    settings: getSettings(),
    trades: getTrades(),
    goals: getGoals(),
    symbols: getSymbols(),
    alerts: getAlerts(),
    notifications: getNotifications(),
  };

  const backup: Backup = {
    id: generateId(),
    name: `backup-${new Date().toISOString().slice(0, 10)}`,
    timestamp: new Date().toISOString(),
    size: new Blob([JSON.stringify(data)]).size,
    data: JSON.stringify(data),
  };

  const backups = getStorageItem<Backup[]>(KEYS.BACKUPS, []);
  backups.unshift(backup);
  if (backups.length > 10) backups.pop();
  setStorageItem(KEYS.BACKUPS, backups);

  return backup;
};

export const getBackups = (): Backup[] => {
  return getStorageItem<Backup[]>(KEYS.BACKUPS, []);
};

export const restoreBackup = (backupId: string): boolean => {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);
  if (!backup) return false;

  try {
    const data = JSON.parse(backup.data);
    if (data.settings) saveSettings(data.settings);
    if (data.trades) saveTrades(data.trades);
    if (data.goals) saveGoals(data.goals);
    if (data.symbols) saveSymbols(data.symbols);
    if (data.alerts) saveAlerts(data.alerts);
    if (data.notifications) saveNotifications(data.notifications);
    return true;
  } catch {
    return false;
  }
};

export const exportAllData = (): string => {
  return JSON.stringify({
    settings: getSettings(),
    trades: getTrades(),
    goals: getGoals(),
    symbols: getSymbols(),
    alerts: getAlerts(),
    notifications: getNotifications(),
  }, null, 2);
};

export const importData = (jsonStr: string): boolean => {
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) saveSettings(data.settings);
    if (data.trades) saveTrades(data.trades);
    if (data.goals) saveGoals(data.goals);
    if (data.symbols) saveSymbols(data.symbols);
    if (data.alerts) saveAlerts(data.alerts);
    if (data.notifications) saveNotifications(data.notifications);
    return true;
  } catch {
    return false;
  }
};

export const clearAllData = (): void => {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

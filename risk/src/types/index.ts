// ============================================================
// Trade Risk Manager - Type Definitions
// ============================================================

// User Settings
export interface UserSettings {
  id: string;
  initialCapital: number;
  currency: string;
  riskPerTrade: number; // percentage
  maxDailyLoss: number; // percentage
  maxWeeklyLoss: number; // percentage
  weeklyTarget: number; // percentage
  monthlyTarget: number; // percentage
  yearlyTarget: number; // percentage
  createdAt: string;
  updatedAt: string;
}

// Trade Symbol
export interface TradeSymbol {
  id: string;
  name: string;
  category: string;
  pipValue: number;
  isCustom: boolean;
}

// Trade Type
export type TradeType = 'buy' | 'sell';

// Trade Result
export type TradeResult = 'win' | 'loss' | 'breakeven';

// Trade
export interface Trade {
  id: string;
  date: string;
  dayOfWeek: string;
  symbol: string;
  type: TradeType;
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  result: TradeResult;
  profitLoss: number; // in USD
  pips: number;
  fees: number;
  notes: string;
  screenshot?: string;
  duration: number; // in minutes
  riskRewardRatio: number;
  createdAt: string;
  updatedAt: string;
}

// Daily Stats
export interface DailyStats {
  date: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  equity: number;
}

// Weekly Stats
export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  growthRate: number;
  bestDay: string;
  worstDay: string;
  bestTrade: number;
  worstTrade: number;
  equity: number;
}

// Monthly Stats
export interface MonthlyStats {
  month: string;
  year: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  growthRate: number;
  avgProfitPerTrade: number;
  avgLossPerTrade: number;
  equity: number;
}

// Performance Analysis
export interface PerformanceAnalysis {
  bestSymbol: string;
  worstSymbol: string;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  avgRiskReward: number;
  avgHoldDuration: number;
  commonMistakes: string[];
  symbolPerformance: SymbolPerformance[];
  dayPerformance: DayPerformance[];
  typePerformance: TypePerformance[];
}

export interface SymbolPerformance {
  symbol: string;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
}

export interface DayPerformance {
  day: string;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
}

export interface TypePerformance {
  type: TradeType;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
}

// Trading Goals
export interface TradingGoals {
  id: string;
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
  yearlyGoal: number;
  dailyProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  yearlyProgress: number;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  yearlyTarget: number;
  createdAt: string;
  updatedAt: string;
}

// Risk Alert
export interface RiskAlert {
  id: string;
  type: 'daily_loss' | 'weekly_loss' | 'risk_exceeded' | 'drawdown' | 'target_reached' | 'performance_drop';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
  read: boolean;
}

// Notification
export interface Notification {
  id: string;
  type: 'end_of_day' | 'end_of_week' | 'risk_alert' | 'target_reached' | 'performance' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Backup
export interface Backup {
  id: string;
  name: string;
  timestamp: string;
  size: number;
  data: string; // JSON stringified
}

// Dashboard State
export interface DashboardState {
  currentCapital: number;
  initialCapital: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  totalProfit: number;
  dailyTrades: number;
  weeklyTrades: number;
  monthlyTrades: number;
  winRate: number;
  growthRate: number;
  maxDrawdown: number;
  equityCurve: EquityPoint[];
}

export interface EquityPoint {
  date: string;
  equity: number;
  profit: number;
}

// App State
export interface AppState {
  settings: UserSettings | null;
  trades: Trade[];
  goals: TradingGoals | null;
  alerts: RiskAlert[];
  notifications: Notification[];
  symbols: TradeSymbol[];
  isSetupComplete: boolean;
  theme: 'light' | 'dark';
  language: 'ar';
}

// Form State for Add/Edit Trade
export interface TradeFormData {
  symbol: string;
  type: TradeType;
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  result: TradeResult;
  profitLoss: number;
  pips: number;
  fees: number;
  notes: string;
  screenshot?: string;
  duration: number;
}

// Pagination
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sort
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter
export interface TradeFilter {
  dateFrom?: string;
  dateTo?: string;
  symbol?: string;
  type?: TradeType;
  result?: TradeResult;
  minProfit?: number;
  maxProfit?: number;
}

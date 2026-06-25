import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Trade, DailyStats, WeeklyStats, MonthlyStats, PerformanceAnalysis, SymbolPerformance, DayPerformance, TypePerformance, TradeType } from '../types';

// ============================================================
// Date Utilities
// ============================================================

export const getArabicDayName = (dateStr: string): string => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[getDay(parseISO(dateStr))];
};

export const formatGregorianDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'yyyy/MM/dd', { locale: ar });
};

export const getWeekRange = (date: Date) => ({
  start: startOfWeek(date, { weekStartsOn: 0 }),
  end: endOfWeek(date, { weekStartsOn: 0 }),
});

export const getMonthRange = (date: Date) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

export const getYearRange = (date: Date) => ({
  start: startOfYear(date),
  end: endOfYear(date),
});

// ============================================================
// Trade Calculations
// ============================================================

export const calculateTradeProfitLoss = (
  type: TradeType,
  entryPrice: number,
  exitPrice: number,
  lotSize: number,
  pipValue: number = 10
): number => {
  const priceDiff = type === 'buy' ? exitPrice - entryPrice : entryPrice - exitPrice;
  const pips = priceDiff / pipValue;
  return pips * lotSize * pipValue;
};

export const calculatePips = (
  type: TradeType,
  entryPrice: number,
  exitPrice: number,
  pipSize: number = 0.01
): number => {
  const priceDiff = type === 'buy' ? exitPrice - entryPrice : entryPrice - exitPrice;
  return priceDiff / pipSize;
};

export const calculateRiskRewardRatio = (
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  type: TradeType
): number => {
  if (type === 'buy') {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    return risk > 0 ? reward / risk : 0;
  } else {
    const risk = Math.abs(stopLoss - entryPrice);
    const reward = Math.abs(entryPrice - takeProfit);
    return risk > 0 ? reward / risk : 0;
  }
};

export const calculateLotSize = (
  capital: number,
  riskPercent: number,
  stopLossPips: number,
  pipValue: number = 10
): number => {
  if (stopLossPips <= 0 || pipValue <= 0) return 0;
  const riskAmount = capital * (riskPercent / 100);
  const lotSize = riskAmount / (stopLossPips * pipValue);
  return Math.round(lotSize * 100) / 100;
};

// ============================================================
// Statistics Calculations
// ============================================================

export const calculateDailyStats = (trades: Trade[], date: string): DailyStats => {
  const dayTrades = trades.filter(t => t.date === date);
  
  const winningTrades = dayTrades.filter(t => t.result === 'win').length;
  const losingTrades = dayTrades.filter(t => t.result === 'loss').length;
  const breakevenTrades = dayTrades.filter(t => t.result === 'breakeven').length;
  const totalProfit = dayTrades.filter(t => t.profitLoss > 0).reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLoss = dayTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  const netProfit = totalProfit - totalLoss;
  const winRate = dayTrades.length > 0 ? (winningTrades / dayTrades.length) * 100 : 0;

  return {
    date,
    totalTrades: dayTrades.length,
    winningTrades,
    losingTrades,
    breakevenTrades,
    totalProfit,
    totalLoss,
    netProfit,
    winRate,
    equity: 0,
  };
};

export const calculateWeeklyStats = (
  trades: Trade[],
  weekStart: string,
  weekEnd: string,
  initialCapital: number
): WeeklyStats => {
  const start = parseISO(weekStart);
  const end = parseISO(weekEnd);
  
  const weekTrades = trades.filter(t => {
    const tradeDate = parseISO(t.date);
    return isWithinInterval(tradeDate, { start, end });
  });

  const winningTrades = weekTrades.filter(t => t.result === 'win').length;
  const losingTrades = weekTrades.filter(t => t.result === 'loss').length;
  const totalProfit = weekTrades.filter(t => t.profitLoss > 0).reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLoss = weekTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  const netProfit = totalProfit - totalLoss;
  const winRate = weekTrades.length > 0 ? (winningTrades / weekTrades.length) * 100 : 0;
  const growthRate = initialCapital > 0 ? (netProfit / initialCapital) * 100 : 0;

  // Find best and worst days
  const dailyProfits: Record<string, number> = {};
  weekTrades.forEach(t => {
    dailyProfits[t.date] = (dailyProfits[t.date] || 0) + t.profitLoss;
  });

  const sortedDays = Object.entries(dailyProfits).sort((a, b) => b[1] - a[1]);
  const bestDay = sortedDays.length > 0 ? sortedDays[0][0] : weekStart;
  const worstDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1][0] : weekStart;

  const bestTrade = weekTrades.length > 0 ? Math.max(...weekTrades.map(t => t.profitLoss)) : 0;
  const worstTrade = weekTrades.length > 0 ? Math.min(...weekTrades.map(t => t.profitLoss)) : 0;

  return {
    weekStart,
    weekEnd,
    totalTrades: weekTrades.length,
    winningTrades,
    losingTrades,
    totalProfit,
    totalLoss,
    netProfit,
    winRate,
    growthRate,
    bestDay,
    worstDay,
    bestTrade,
    worstTrade,
    equity: initialCapital + netProfit,
  };
};

export const calculateMonthlyStats = (
  trades: Trade[],
  year: number,
  month: number,
  initialCapital: number
): MonthlyStats => {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTrades = trades.filter(t => t.date.startsWith(monthStr));

  const winningTrades = monthTrades.filter(t => t.result === 'win').length;
  const losingTrades = monthTrades.filter(t => t.result === 'loss').length;
  const totalProfit = monthTrades.filter(t => t.profitLoss > 0).reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLoss = monthTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  const netProfit = totalProfit - totalLoss;
  const winRate = monthTrades.length > 0 ? (winningTrades / monthTrades.length) * 100 : 0;
  const growthRate = initialCapital > 0 ? (netProfit / initialCapital) * 100 : 0;
  const avgProfitPerTrade = winningTrades > 0 ? totalProfit / winningTrades : 0;
  const avgLossPerTrade = losingTrades > 0 ? totalLoss / losingTrades : 0;

  return {
    month: monthStr,
    year,
    totalTrades: monthTrades.length,
    winningTrades,
    losingTrades,
    totalProfit,
    totalLoss,
    netProfit,
    winRate,
    growthRate,
    avgProfitPerTrade,
    avgLossPerTrade,
    equity: initialCapital + netProfit,
  };
};

export const calculatePerformanceAnalysis = (trades: Trade[]): PerformanceAnalysis => {
  // Symbol performance
  const symbolMap: Record<string, Trade[]> = {};
  trades.forEach(t => {
    if (!symbolMap[t.symbol]) symbolMap[t.symbol] = [];
    symbolMap[t.symbol].push(t);
  });

  const symbolPerformance: SymbolPerformance[] = Object.entries(symbolMap).map(([symbol, symTrades]) => ({
    symbol,
    totalTrades: symTrades.length,
    winRate: (symTrades.filter(t => t.result === 'win').length / symTrades.length) * 100,
    totalProfit: symTrades.reduce((sum, t) => sum + t.profitLoss, 0),
    avgProfit: symTrades.reduce((sum, t) => sum + t.profitLoss, 0) / symTrades.length,
  }));

  const bestSymbol = symbolPerformance.length > 0
    ? symbolPerformance.reduce((best, curr) => curr.totalProfit > best.totalProfit ? curr : best).symbol
    : '';
  const worstSymbol = symbolPerformance.length > 0
    ? symbolPerformance.reduce((worst, curr) => curr.totalProfit < worst.totalProfit ? curr : worst).symbol
    : '';

  // Day of week performance
  const dayMap: Record<string, Trade[]> = {};
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  trades.forEach(t => {
    const dayName = dayNames[getDay(parseISO(t.date))];
    if (!dayMap[dayName]) dayMap[dayName] = [];
    dayMap[dayName].push(t);
  });

  const dayPerformance: DayPerformance[] = Object.entries(dayMap).map(([day, dayTrades]) => ({
    day,
    totalTrades: dayTrades.length,
    winRate: (dayTrades.filter(t => t.result === 'win').length / dayTrades.length) * 100,
    totalProfit: dayTrades.reduce((sum, t) => sum + t.profitLoss, 0),
    avgProfit: dayTrades.reduce((sum, t) => sum + t.profitLoss, 0) / dayTrades.length,
  }));

  const bestDayOfWeek = dayPerformance.length > 0
    ? dayPerformance.reduce((best, curr) => curr.totalProfit > best.totalProfit ? curr : best).day
    : '';
  const worstDayOfWeek = dayPerformance.length > 0
    ? dayPerformance.reduce((worst, curr) => curr.totalProfit < worst.totalProfit ? curr : worst).day
    : '';

  // Type performance
  const buyTrades = trades.filter(t => t.type === 'buy');
  const sellTrades = trades.filter(t => t.type === 'sell');

  const typePerformance: TypePerformance[] = [
    {
      type: 'buy',
      totalTrades: buyTrades.length,
      winRate: buyTrades.length > 0 ? (buyTrades.filter(t => t.result === 'win').length / buyTrades.length) * 100 : 0,
      totalProfit: buyTrades.reduce((sum, t) => sum + t.profitLoss, 0),
      avgProfit: buyTrades.length > 0 ? buyTrades.reduce((sum, t) => sum + t.profitLoss, 0) / buyTrades.length : 0,
    },
    {
      type: 'sell',
      totalTrades: sellTrades.length,
      winRate: sellTrades.length > 0 ? (sellTrades.filter(t => t.result === 'win').length / sellTrades.length) * 100 : 0,
      totalProfit: sellTrades.reduce((sum, t) => sum + t.profitLoss, 0),
      avgProfit: sellTrades.length > 0 ? sellTrades.reduce((sum, t) => sum + t.profitLoss, 0) / sellTrades.length : 0,
    },
  ];

  // Average risk/reward
  const rrTrades = trades.filter(t => t.riskRewardRatio > 0);
  const avgRiskReward = rrTrades.length > 0
    ? rrTrades.reduce((sum, t) => sum + t.riskRewardRatio, 0) / rrTrades.length
    : 0;

  // Average hold duration
  const avgHoldDuration = trades.length > 0
    ? trades.reduce((sum, t) => sum + t.duration, 0) / trades.length
    : 0;

  return {
    bestSymbol,
    worstSymbol,
    bestDayOfWeek,
    worstDayOfWeek,
    avgRiskReward,
    avgHoldDuration,
    commonMistakes: [],
    symbolPerformance,
    dayPerformance,
    typePerformance,
  };
};

// ============================================================
// Equity Curve
// ============================================================

export const calculateEquityCurve = (trades: Trade[], initialCapital: number) => {
  let equity = initialCapital;
  const curve = [{ date: 'بداية', equity: initialCapital, profit: 0 }];

  const sortedTrades = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedTrades.forEach(trade => {
    equity += trade.profitLoss;
    curve.push({
      date: trade.date,
      equity,
      profit: trade.profitLoss,
    });
  });

  return curve;
};

// ============================================================
// Risk Calculations
// ============================================================

export const checkDailyLossLimit = (
  trades: Trade[],
  date: string,
  capital: number,
  maxDailyLossPercent: number
): { exceeded: boolean; currentLoss: number; limit: number } => {
  const dayTrades = trades.filter(t => t.date === date);
  const dailyLoss = dayTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  const limit = capital * (maxDailyLossPercent / 100);

  return {
    exceeded: dailyLoss >= limit,
    currentLoss: dailyLoss,
    limit,
  };
};

export const checkWeeklyLossLimit = (
  trades: Trade[],
  capital: number,
  maxWeeklyLossPercent: number
): { exceeded: boolean; currentLoss: number; limit: number } => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const weekTrades = trades.filter(t => {
    const tradeDate = parseISO(t.date);
    return isWithinInterval(tradeDate, { start: weekStart, end: weekEnd });
  });

  const weeklyLoss = weekTrades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  const limit = capital * (maxWeeklyLossPercent / 100);

  return {
    exceeded: weeklyLoss >= limit,
    currentLoss: weeklyLoss,
    limit,
  };
};

export const calculateMaxDrawdown = (equityCurve: { equity: number }[]): number => {
  if (equityCurve.length === 0) return 0;

  let maxEquity = equityCurve[0].equity;
  let maxDrawdown = 0;

  equityCurve.forEach(point => {
    if (point.equity > maxEquity) {
      maxEquity = point.equity;
    }
    const drawdown = ((maxEquity - point.equity) / maxEquity) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};

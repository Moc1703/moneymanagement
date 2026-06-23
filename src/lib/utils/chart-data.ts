import { format, startOfWeek, startOfMonth, endOfMonth, parseISO, subWeeks, subMonths, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Transaction, Account } from "@/lib/types";

// Compute current balance for each account
export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): { account: Account; balance: number; monthDelta: number }[] {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");

  return accounts.map((acc) => {
    let balance = Number(acc.initial_balance);
    let monthDelta = 0;
    for (const tx of transactions) {
      if (tx.account_id !== acc.id) continue;
      const sign = tx.type === "income" ? 1 : -1;
      const delta = sign * Number(tx.amount);
      balance += delta;
      if (tx.date >= monthStart) {
        monthDelta += delta;
      }
    }
    return { account: acc, balance, monthDelta };
  });
}

export function computeTotalBalance(
  balances: { balance: number }[]
): number {
  return balances.reduce((sum, b) => sum + b.balance, 0);
}

// Build cashflow series for last N weeks
export function buildCashflowByWeek(
  transactions: Transaction[],
  weeks: number = 8
): { period: string; label: string; income: number; expense: number }[] {
  const now = new Date();
  const series: { period: string; label: string; income: number; expense: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    const label = format(weekStart, "d MMM", { locale: idLocale });

    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const txDate = parseISO(tx.date);
      if (txDate >= weekStart && txDate < weekEnd) {
        if (tx.type === "income") income += Number(tx.amount);
        else expense += Number(tx.amount);
      }
    }
    series.push({ period: key, label, income, expense });
  }

  return series;
}

export function buildCashflowByMonth(
  transactions: Transaction[],
  months: number = 6
): { period: string; label: string; income: number; expense: number }[] {
  const now = new Date();
  const series: { period: string; label: string; income: number; expense: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = startOfMonth(subMonths(now, i - 1));
    const key = format(monthStart, "yyyy-MM");
    const label = format(monthStart, "MMM", { locale: idLocale });

    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const txDate = parseISO(tx.date);
      if (txDate >= monthStart && txDate < monthEnd) {
        if (tx.type === "income") income += Number(tx.amount);
        else expense += Number(tx.amount);
      }
    }
    series.push({ period: key, label, income, expense });
  }

  return series;
}

// Build expense-by-category series for current month
export function buildExpenseByCategory(
  transactions: Transaction[],
  categoryMap: Map<string, { name: string; color: string; icon: string }>
): { name: string; value: number; color: string }[] {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const map = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense" || tx.date < monthStart) continue;
    map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + Number(tx.amount));
  }

  return Array.from(map.entries())
    .map(([catId, value]) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat?.name ?? "Lainnya",
        value,
        color: cat?.color ?? "#6b7280",
      };
    })
    .sort((a, b) => b.value - a.value);
}

// Smart insights — computed entirely client-side from existing transactions.
export type SmartInsights = {
  monthIncome: number;
  monthExpense: number;
  savingsRate: number;
  expenseDeltaPct: number | null;
  projectedMonthExpense: number;
  topCategory: { name: string; color: string; icon: string; value: number } | null;
  biggestDay: { date: string; total: number } | null;
  daysLeftInMonth: number;
  anomaly: { date: string; total: number; ratio: number } | null;
  categorySurge: {
    name: string;
    color: string;
    icon: string;
    currentWeek: number;
    prevWeek: number;
    deltaPct: number;
  } | null;
  thrBonus: {
    amount: number;
    monthLabel: string;
    avgMonthly: number;
    ratio: number;
  } | null;
};

export function buildSmartInsights(
  transactions: Transaction[],
  categoryMap: Map<string, { name: string; color: string; icon: string }>
): SmartInsights {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const monthEnd = endOfMonth(now);
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const prevMonthStartStr = format(prevMonthStart, "yyyy-MM-dd");

  let monthIncome = 0;
  let monthExpense = 0;
  let prevMonthExpense = 0;
  const byCategory = new Map<string, number>();
  const byDay = new Map<string, number>();

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.date >= monthStartStr) {
      if (tx.type === "income") monthIncome += amount;
      else {
        monthExpense += amount;
        byCategory.set(tx.category_id, (byCategory.get(tx.category_id) ?? 0) + amount);
        byDay.set(tx.date, (byDay.get(tx.date) ?? 0) + amount);
      }
    } else if (tx.date >= prevMonthStartStr && tx.date < monthStartStr && tx.type === "expense") {
      prevMonthExpense += amount;
    }
  }

  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;
  const expenseDeltaPct = prevMonthExpense > 0 ? ((monthExpense - prevMonthExpense) / prevMonthExpense) * 100 : null;

  const dayOfMonth = now.getDate();
  const totalDays = monthEnd.getDate();
  const dailyBurn = dayOfMonth > 0 ? monthExpense / dayOfMonth : 0;
  const projectedMonthExpense = Math.round(dailyBurn * totalDays);

  let topCategory: SmartInsights["topCategory"] = null;
  let topVal = 0;
  for (const [id, val] of byCategory) {
    if (val > topVal) {
      const cat = categoryMap.get(id);
      if (cat) {
        topVal = val;
        topCategory = { name: cat.name, color: cat.color, icon: cat.icon, value: val };
      }
    }
  }

  let biggestDay: SmartInsights["biggestDay"] = null;
  let biggestVal = 0;
  for (const [d, val] of byDay) {
    if (val > biggestVal) {
      biggestVal = val;
      biggestDay = { date: d, total: val };
    }
  }

  const daysLeftInMonth = Math.max(0, differenceInDays(monthEnd, now));

  // -- Anomaly: last 30 days, find day whose total > 3× median of non-zero days
  const dayTotals30 = new Map<string, number>();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = format(thirtyDaysAgo, "yyyy-MM-dd");
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (tx.date < cutoff) continue;
    dayTotals30.set(tx.date, (dayTotals30.get(tx.date) ?? 0) + Number(tx.amount));
  }
  const sortedDayValues = Array.from(dayTotals30.values()).sort((a, b) => a - b);
  let anomaly: SmartInsights["anomaly"] = null;
  if (sortedDayValues.length >= 5) {
    const med = sortedDayValues[Math.floor(sortedDayValues.length / 2)];
    if (med > 0) {
      let topDay: { date: string; total: number } | null = null;
      for (const [d, total] of dayTotals30) {
        if (!topDay || total > topDay.total) topDay = { date: d, total };
      }
      if (topDay && topDay.total >= 3 * med) {
        anomaly = { date: topDay.date, total: topDay.total, ratio: topDay.total / med };
      }
    }
  }

  // -- Category surge: current 7d vs previous 7d, expense per category, top % delta
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const curStart = format(sevenDaysAgo, "yyyy-MM-dd");
  const prevStart = format(fourteenDaysAgo, "yyyy-MM-dd");

  const currentByCat = new Map<string, number>();
  const prevByCat = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    const amt = Number(tx.amount);
    if (tx.date >= curStart) {
      currentByCat.set(tx.category_id, (currentByCat.get(tx.category_id) ?? 0) + amt);
    } else if (tx.date >= prevStart && tx.date < curStart) {
      prevByCat.set(tx.category_id, (prevByCat.get(tx.category_id) ?? 0) + amt);
    }
  }
  let categorySurge: SmartInsights["categorySurge"] = null;
  let bestDelta = 0;
  for (const [id, current] of currentByCat) {
    const prev = prevByCat.get(id) ?? 0;
    if (prev === 0) continue; // ignore "new" categories (no comparison baseline)
    const deltaPct = ((current - prev) / prev) * 100;
    if (deltaPct >= 50 && current >= 100_000 && deltaPct > bestDelta) {
      const cat = categoryMap.get(id);
      if (cat) {
        bestDelta = deltaPct;
        categorySurge = {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          currentWeek: current,
          prevWeek: prev,
          deltaPct,
        };
      }
    }
  }

  // -- THR-aware: detect anomalously large income in Mar-May (Ramadan/Lebaran window)
  //    Compute avg monthly income over last 6 months (excluding current), flag
  //    any single income tx in Mar-May > 1.8x that average.
  let thrBonus: SmartInsights["thrBonus"] = null;
  {
    const monthlyIncome = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "income") continue;
      const ym = tx.date.slice(0, 7);
      monthlyIncome.set(ym, (monthlyIncome.get(ym) ?? 0) + Number(tx.amount));
    }
    // Compute average of last 6 full months (exclude current)
    const monthlyValues: number[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyValues.push(monthlyIncome.get(key) ?? 0);
    }
    const nonZero = monthlyValues.filter((v) => v > 0);
    if (nonZero.length >= 2) {
      const avgMonthly = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
      // Look for big income tx within Mar-May (months 2-4) of current year
      const currentYear = now.getFullYear();
      const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      let bestRatio = 0;
      for (const tx of transactions) {
        if (tx.type !== "income") continue;
        const txDate = parseISO(tx.date);
        const m = txDate.getMonth();
        if (txDate.getFullYear() !== currentYear) continue;
        if (m < 2 || m > 4) continue; // Mar-May only (0-indexed)
        const ratio = Number(tx.amount) / avgMonthly;
        if (ratio >= 1.8 && ratio > bestRatio) {
          bestRatio = ratio;
          thrBonus = {
            amount: Number(tx.amount),
            monthLabel: monthsLabels[m],
            avgMonthly,
            ratio,
          };
        }
      }
    }
  }

  return {
    monthIncome,
    monthExpense,
    savingsRate,
    expenseDeltaPct,
    projectedMonthExpense,
    topCategory,
    biggestDay,
    daysLeftInMonth,
    anomaly,
    categorySurge,
    thrBonus,
  };
}

// Build income/expense per project for current month
export function buildProjectSummary(
  transactions: Transaction[],
  projectMap: Map<string, { name: string; color: string }>
): { name: string; income: number; expense: number; net: number; color: string }[] {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const map = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    if (tx.date < monthStart) continue;
    const pid = tx.project_id ?? "_none";
    if (!map.has(pid)) map.set(pid, { income: 0, expense: 0 });
    const entry = map.get(pid)!;
    if (tx.type === "income") entry.income += Number(tx.amount);
    else entry.expense += Number(tx.amount);
  }

  return Array.from(map.entries())
    .map(([pid, { income, expense }]) => {
      const proj = projectMap.get(pid);
      return {
        name: proj?.name ?? "Tanpa Project",
        income,
        expense,
        net: income - expense,
        color: proj?.color ?? "#64748b",
      };
    })
    .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}

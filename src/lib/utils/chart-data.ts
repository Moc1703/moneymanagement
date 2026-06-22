import { format, startOfWeek, startOfMonth, parseISO, subWeeks, subMonths } from "date-fns";
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

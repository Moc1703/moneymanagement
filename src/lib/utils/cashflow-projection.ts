// Projected cashflow — Simplifi-style 12-month forward curve.
// Inputs: current total balance + active recurring rules.
// Output: { label, balance, income, expense } for each future month.
//
// Algorithm:
//   1. Start at "today" with currentBalance.
//   2. For each month in horizon: expand all active recurring rules into
//      occurrences within that month. Sum signed deltas. Add to running balance.
//   3. Emit month-end balance as the projected value.

import { expandOccurrences } from "@/lib/utils/recurring";
import type { RecurringRule } from "@/lib/types";

export type ProjectionPoint = {
  label: string;
  month: string; // YYYY-MM
  balance: number;
  income: number;
  expense: number;
};

const ID_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function endOfMonth(year: number, monthIdx: number): Date {
  return new Date(year, monthIdx + 1, 0); // day 0 of next month
}

export function buildProjection(
  currentBalance: number,
  rules: RecurringRule[],
  horizonMonths: number = 12,
): ProjectionPoint[] {
  const out: ProjectionPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let running = currentBalance;

  // First point: today (current balance baseline)
  out.push({
    label: "Sekarang",
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    balance: Math.round(running),
    income: 0,
    expense: 0,
  });

  for (let i = 0; i < horizonMonths; i++) {
    const target = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const winStart = i === 0 ? now : new Date(target.getFullYear(), target.getMonth(), 1);
    const winEnd = endOfMonth(target.getFullYear(), target.getMonth());

    let income = 0;
    let expense = 0;

    for (const rule of rules) {
      if (!rule.active) continue;
      const dates = expandOccurrences(rule, winStart, winEnd);
      // Filter skip_dates
      const skipSet = new Set(rule.skip_dates ?? []);
      for (const d of dates) {
        if (skipSet.has(d)) continue;
        if (rule.type === "income") income += Number(rule.amount);
        else expense += Number(rule.amount);
      }
    }

    running += income - expense;
    // Move target to NEXT month so labels make sense (Sep, Okt, Nov, ...)
    const labelMonth = new Date(target.getFullYear(), target.getMonth() + 1, 1);
    out.push({
      label: ID_MONTHS[labelMonth.getMonth()],
      month: `${labelMonth.getFullYear()}-${String(labelMonth.getMonth() + 1).padStart(2, "0")}`,
      balance: Math.round(running),
      income: Math.round(income),
      expense: Math.round(expense),
    });
  }

  return out;
}

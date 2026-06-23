// Pure date math for recurring rule expansion.
// No external lib — covers weekly/biweekly/monthly/yearly which is 95% of
// Indonesian household patterns (gajian, KPR, langganan, tahunan).

import type { RecurringRule } from "@/lib/types";

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function clampMonthDay(year: number, month: number, day: number): Date {
  const last = lastDayOfMonth(year, month);
  return new Date(year, month, Math.min(day, last));
}

export function expandOccurrences(
  rule: Pick<
    RecurringRule,
    "frequency" | "day_of_week" | "day_of_month" | "start_date" | "end_date"
  >,
  windowFrom: Date,
  windowUntil: Date,
): string[] {
  const start = new Date(rule.start_date + "T00:00:00");
  const end = rule.end_date ? new Date(rule.end_date + "T00:00:00") : null;
  const effectiveStart = start > windowFrom ? start : windowFrom;
  const effectiveEnd = end && end < windowUntil ? end : windowUntil;
  if (effectiveStart > effectiveEnd) return [];

  const out: string[] = [];

  switch (rule.frequency) {
    case "weekly":
    case "biweekly": {
      const stepDays = rule.frequency === "weekly" ? 7 : 14;
      let cursor = new Date(start);
      while (cursor < effectiveStart) cursor = addDays(cursor, stepDays);
      while (cursor <= effectiveEnd) {
        out.push(toISO(cursor));
        cursor = addDays(cursor, stepDays);
      }
      break;
    }
    case "monthly": {
      const day = rule.day_of_month ?? start.getDate();
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= effectiveEnd) {
        const occ = clampMonthDay(cursor.getFullYear(), cursor.getMonth(), day);
        if (occ >= effectiveStart && occ <= effectiveEnd && occ >= start) {
          out.push(toISO(occ));
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
      break;
    }
    case "yearly": {
      const cursor = new Date(start.getFullYear(), 0, 1);
      while (cursor <= effectiveEnd) {
        const occ = clampMonthDay(cursor.getFullYear(), start.getMonth(), start.getDate());
        if (occ >= effectiveStart && occ <= effectiveEnd && occ >= start) {
          out.push(toISO(occ));
        }
        cursor.setFullYear(cursor.getFullYear() + 1);
      }
      break;
    }
  }
  return out;
}

export { addDays, toISO };

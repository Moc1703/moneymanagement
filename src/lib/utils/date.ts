import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  subWeeks,
  subMonths,
  parseISO,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ISO week key: "2026-W25"
export function weekKey(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-'W'II", { locale: idLocale });
}

// Week label: "1-7 Jun"
export function weekLabel(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM", { locale: idLocale });
}

// Month key: "2026-06"
export function monthKey(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM");
}

// Month label: "Jun 2026"
export function monthLabel(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM yyyy", { locale: idLocale });
}

// Get last N weeks (each Monday) — for chart X-axis
export function getLastNWeeks(n: number, reference: Date = new Date()): Date[] {
  const today = reference;
  const lastWeek = startOfWeek(subWeeks(today, n - 1), { weekStartsOn: 1 });
  return eachWeekOfInterval(
    { start: lastWeek, end: startOfWeek(today, { weekStartsOn: 1 }) },
    { weekStartsOn: 1 }
  );
}

// Get last N months — for chart X-axis
export function getLastNMonths(n: number, reference: Date = new Date()): Date[] {
  const start = startOfMonth(subMonths(reference, n - 1));
  const end = startOfMonth(reference);
  return eachMonthOfInterval({ start, end });
}

// Bucket date into week start (Monday) or month start
export function bucketDate(
  date: string,
  granularity: "week" | "month"
): string {
  const d = parseISO(date);
  if (granularity === "week") {
    return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
  }
  return format(startOfMonth(d), "yyyy-MM-dd");
}

export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO };

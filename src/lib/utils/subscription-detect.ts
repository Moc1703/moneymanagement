// Pure TS subscription detection — no ML, no API.
//
// Heuristic:
//   1. Group expense transactions by *normalized* description.
//   2. For each group with >= 3 occurrences:
//      * Compute gap (days) between consecutive dates.
//      * Median gap must fall into a known cadence window:
//        weekly 6-8, biweekly 13-16, monthly 27-32, quarterly 88-92, yearly 358-368.
//      * Amount stddev / mean < 15%.
//   3. Score: 0.4·amount_stability + 0.4·interval_regularity + 0.2·sample_log.
//   4. Confidence >= 0.6 → emit candidate.
//
// Designed for ~year of transactions (a few hundred rows). O(n log n) overall.

import type { Transaction } from "@/lib/types";

const CADENCE_WINDOWS = [
  { name: "weekly", days: 7, min: 6, max: 8 },
  { name: "biweekly", days: 14, min: 13, max: 16 },
  { name: "monthly", days: 30, min: 27, max: 32 },
  { name: "quarterly", days: 91, min: 85, max: 95 },
  { name: "yearly", days: 365, min: 358, max: 368 },
];

export type SubscriptionCandidate = {
  patternKey: string;
  displayName: string;
  expectedAmount: number;
  amountStddevPct: number;
  intervalDays: number;
  occurrences: number;
  confidence: number;
  firstSeenDate: string;
  lastSeenDate: string;
  nextExpectedDate: string | null;
};

/** Normalize description: lowercase, strip digits/punctuation, collapse whitespace. */
export function normalizeKey(desc: string | null | undefined): string {
  if (!desc) return "";
  return desc
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 === 1) return sorted[(n - 1) / 2];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function stddev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const sumSq = values.reduce((s, v) => s + (v - mean) ** 2, 0);
  return Math.sqrt(sumSq / (values.length - 1));
}

function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function detectSubscriptions(transactions: Transaction[]): SubscriptionCandidate[] {
  // Group expense transactions only, by normalized description.
  const groups = new Map<string, { displayName: string; entries: { date: string; amount: number }[] }>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (tx.transfer_group_id) continue; // skip transfers
    if (tx.recurring_rule_id) continue; // already explicit recurring, no need to detect
    const desc = tx.description ?? "";
    const key = normalizeKey(desc);
    if (!key || key.length < 3) continue;
    if (!groups.has(key)) groups.set(key, { displayName: desc, entries: [] });
    const g = groups.get(key)!;
    g.entries.push({ date: tx.date, amount: Number(tx.amount) });
    // Keep latest description as display name
    if (tx.date >= g.entries[0].date) g.displayName = desc;
  }

  const candidates: SubscriptionCandidate[] = [];

  for (const [key, group] of groups) {
    if (group.entries.length < 3) continue;
    const sorted = [...group.entries].sort((a, b) => a.date.localeCompare(b.date));

    // Inter-occurrence gaps
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(dayDiff(sorted[i - 1].date, sorted[i].date));
    }
    if (gaps.length === 0) continue;
    const sortedGaps = [...gaps].sort((a, b) => a - b);
    const medGap = median(sortedGaps);

    const matched = CADENCE_WINDOWS.find((w) => medGap >= w.min && medGap <= w.max);
    if (!matched) continue;

    // Amount stability
    const amounts = sorted.map((e) => e.amount);
    const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    const sd = stddev(amounts, mean);
    const stdPct = mean > 0 ? (sd / mean) * 100 : 0;
    if (stdPct > 15) continue;

    // Interval regularity: how tight are the gaps around median
    const gapMean = gaps.reduce((s, v) => s + v, 0) / gaps.length;
    const gapSd = stddev(gaps, gapMean);
    const gapRegularity = Math.max(0, 1 - gapSd / matched.days);

    const amountStability = Math.max(0, 1 - stdPct / 15);
    const sampleScore = Math.min(1, Math.log2(sorted.length) / 3); // 3 → 0.53, 5 → 0.77, 8 → 1.0

    const confidence = 0.4 * amountStability + 0.4 * gapRegularity + 0.2 * sampleScore;
    if (confidence < 0.6) continue;

    const lastSeen = sorted[sorted.length - 1].date;
    const nextExpected = addDaysIso(lastSeen, matched.days);

    candidates.push({
      patternKey: key,
      displayName: group.displayName.trim() || key,
      expectedAmount: Math.round(mean),
      amountStddevPct: Number(stdPct.toFixed(2)),
      intervalDays: matched.days,
      occurrences: sorted.length,
      confidence: Number(confidence.toFixed(2)),
      firstSeenDate: sorted[0].date,
      lastSeenDate: lastSeen,
      nextExpectedDate: nextExpected,
    });
  }

  // Sort by confidence desc, then amount desc
  candidates.sort((a, b) =>
    b.confidence !== a.confidence ? b.confidence - a.confidence : b.expectedAmount - a.expectedAmount,
  );

  return candidates;
}

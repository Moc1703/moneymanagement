// Stitch snapshots from asset_snapshots + liability_snapshots + account
// initial balances into a daily timeline. Forward-fill per-entity so any
// missing day inherits the last known value.

import type { AssetSnapshot, LiabilitySnapshot, Account } from "@/lib/types";
import type { TimelinePoint } from "@/components/networth/networth-timeline";

export function buildNetWorthTimeline(
  accounts: Account[],
  accountBalanceFn: (a: Account) => number,
  assetSnapshots: AssetSnapshot[],
  liabilitySnapshots: LiabilitySnapshot[],
  today: Date = new Date(),
): TimelinePoint[] {
  // Collect all distinct snapshot dates
  const dateSet = new Set<string>();
  for (const s of assetSnapshots) dateSet.add(s.snapshot_date);
  for (const s of liabilitySnapshots) dateSet.add(s.snapshot_date);
  const todayStr = today.toISOString().slice(0, 10);
  dateSet.add(todayStr);

  const dates = Array.from(dateSet).sort();
  if (dates.length === 0) return [];

  // Last known value per entity, forward-filled
  const assetById = new Map<string, number>();
  const liabById = new Map<string, number>();

  // Pre-sort snapshots by date asc
  const aSorted = [...assetSnapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
  const lSorted = [...liabilitySnapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));

  const points: TimelinePoint[] = [];
  // Accounts current balance is "now" only — we don't have historical account
  // balance data, so contribute current value flat across the timeline.
  const accountsTotal = accounts.reduce((s, a) => s + accountBalanceFn(a), 0);

  let aIdx = 0;
  let lIdx = 0;
  for (const date of dates) {
    while (aIdx < aSorted.length && aSorted[aIdx].snapshot_date <= date) {
      assetById.set(aSorted[aIdx].asset_id, Number(aSorted[aIdx].value));
      aIdx++;
    }
    while (lIdx < lSorted.length && lSorted[lIdx].snapshot_date <= date) {
      liabById.set(lSorted[lIdx].liability_id, Number(lSorted[lIdx].balance));
      lIdx++;
    }
    const assetsSum = Array.from(assetById.values()).reduce((s, v) => s + v, 0);
    const liabsSum = Array.from(liabById.values()).reduce((s, v) => s + v, 0);
    points.push({
      date,
      assets: Math.round(accountsTotal + assetsSum),
      liabilities: Math.round(liabsSum),
      net: Math.round(accountsTotal + assetsSum - liabsSum),
    });
  }

  return points;
}

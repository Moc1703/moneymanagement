"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { detectSubscriptions } from "@/lib/utils/subscription-detect";
import type { DetectedSubscription, Transaction } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getDetectedSubscriptions(
  options?: { includeDismissed?: boolean },
): Promise<DetectedSubscription[]> {
  const supabase = await createClient();
  let query = supabase
    .from("detected_subscriptions")
    .select("*")
    .order("expected_amount", { ascending: false });
  if (!options?.includeDismissed) query = query.is("dismissed_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DetectedSubscription[];
}

export async function dismissSubscription(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("detected_subscriptions")
    .update({ dismissed_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function undismissSubscription(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("detected_subscriptions")
    .update({ dismissed_at: null } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

/**
 * Run heuristic detection over the user's recent transactions and upsert
 * results into detected_subscriptions. Idempotent on (user_id, pattern_key).
 * Safe to call on every app visit; runs in <50ms for typical history sizes.
 */
export async function refreshSubscriptionDetection(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Pull ~1 year of expense transactions
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const sinceDate = oneYearAgo.toISOString().slice(0, 10);

  const { data: txData } = await supabase
    .from("transactions")
    .select("id,type,amount,date,description,transfer_group_id,recurring_rule_id")
    .eq("type", "expense")
    .gte("date", sinceDate)
    .order("date", { ascending: true });
  const txs = (txData ?? []) as unknown as Transaction[];
  if (txs.length < 9) return; // not enough signal

  const candidates = detectSubscriptions(txs);
  if (candidates.length === 0) return;

  // Upsert each candidate
  const rows = candidates.map((c) => ({
    user_id: user.id,
    pattern_key: c.patternKey,
    display_name: c.displayName,
    expected_amount: c.expectedAmount,
    amount_stddev_pct: c.amountStddevPct,
    interval_days: c.intervalDays,
    occurrences: c.occurrences,
    confidence: c.confidence,
    first_seen_date: c.firstSeenDate,
    last_seen_date: c.lastSeenDate,
    next_expected_date: c.nextExpectedDate,
  }));

  await supabase
    .from("detected_subscriptions")
    .upsert(rows as never, { onConflict: "user_id,pattern_key", ignoreDuplicates: false });
}

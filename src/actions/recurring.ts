"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recurringRuleSchema } from "@/lib/utils/validators";
import { expandOccurrences, addDays, toISO } from "@/lib/utils/recurring";
import type { RecurringRule } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getRecurringRules(): Promise<RecurringRule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_rules")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RecurringRule[];
}

export async function createRecurringRule(formData: FormData): Promise<ActionResult> {
  const parsed = recurringRuleSchema.safeParse({
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id"),
    project_id: formData.get("project_id") || null,
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description") || "",
    frequency: formData.get("frequency"),
    day_of_week: formData.get("day_of_week") || null,
    day_of_month: formData.get("day_of_month") || null,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("recurring_rules")
    .insert({
      user_id: user.id,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id,
      project_id: parsed.data.project_id || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      frequency: parsed.data.frequency,
      day_of_week:
        parsed.data.frequency === "weekly" || parsed.data.frequency === "biweekly"
          ? parsed.data.day_of_week ?? null
          : null,
      day_of_month: parsed.data.frequency === "monthly" ? parsed.data.day_of_month ?? null : null,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date || null,
      active: true,
    } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function toggleRecurringRule(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_rules")
    .update({ active } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteRecurringRule(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_rules").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

const HORIZON_DAYS = 30;

export async function ensureRecurringMaterialized(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: rulesData } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("active", true);
  const rules = (rulesData ?? []) as RecurringRule[];
  if (rules.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = addDays(today, HORIZON_DAYS);

  for (const rule of rules) {
    const fromDate = rule.last_generated_until
      ? addDays(new Date(rule.last_generated_until + "T00:00:00"), 1)
      : new Date(rule.start_date + "T00:00:00");
    if (fromDate > horizon) continue;

    const occurrences = expandOccurrences(rule, fromDate, horizon);
    const skipSet = new Set(rule.skip_dates ?? []);
    const toInsert = occurrences
      .filter((d) => !skipSet.has(d))
      .map((d) => ({
        user_id: user.id,
        account_id: rule.account_id,
        project_id: rule.project_id ?? null,
        category_id: rule.category_id,
        type: rule.type,
        amount: rule.amount,
        date: d,
        description: rule.description,
        recurring_rule_id: rule.id,
      }));

    if (toInsert.length > 0) {
      const { error: insertErr } = await supabase.from("transactions").insert(toInsert as never);
      if (insertErr) continue;
    }

    const newLast = toISO(horizon);
    await supabase
      .from("recurring_rules")
      .update({ last_generated_until: newLast } as never)
      .eq("id", rule.id);
  }
}

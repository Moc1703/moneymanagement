"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema } from "@/lib/utils/validators";
import type { Budget, BudgetProgress } from "@/lib/types";

export type ActionResult = { error?: string };

function currentMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function getBudgetsForMonth(periodMonth?: string): Promise<BudgetProgress[]> {
  const supabase = await createClient();
  const month = periodMonth ?? currentMonthIso();
  const { data, error } = await supabase
    .from("budget_progress")
    .select("*")
    .eq("period_month", month);
  if (error) throw error;
  return (data ?? []) as unknown as BudgetProgress[];
}

export async function getBudgets(): Promise<Budget[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .order("period_month", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function upsertBudget(formData: FormData): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    period_month: formData.get("period_month"),
    amount: formData.get("amount"),
    rollover: formData.get("rollover") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  // Upsert on unique (user_id, category_id, period_month)
  const { error } = await supabase
    .from("budgets")
    .upsert(
      {
        user_id: user.id,
        category_id: parsed.data.category_id,
        period_month: parsed.data.period_month,
        amount: parsed.data.amount,
        rollover: parsed.data.rollover ?? false,
      } as never,
      { onConflict: "user_id,category_id,period_month" },
    );
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

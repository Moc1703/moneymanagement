"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema, goalContributionSchema } from "@/lib/utils/validators";
import type { GoalProgress, GoalContribution } from "@/lib/types";

export type ActionResult = { error?: string; data?: { id: string } };

export async function getGoals(): Promise<GoalProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goal_progress")
    .select("*")
    .is("archived_at", null)
    .order("target_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as GoalProgress[];
}

export async function getGoal(id: string): Promise<GoalProgress | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goal_progress")
    .select("*")
    .eq("goal_id", id)
    .single();
  if (error) return null;
  return data as unknown as GoalProgress;
}

export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goal_contributions")
    .select("*")
    .eq("goal_id", goalId)
    .order("contribution_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GoalContribution[];
}

export async function createGoal(formData: FormData): Promise<ActionResult> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    target_amount: formData.get("target_amount"),
    target_date: formData.get("target_date") || null,
    account_id: formData.get("account_id") || null,
    color: formData.get("color"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
      target_date: parsed.data.target_date || null,
      account_id: parsed.data.account_id || null,
      color: parsed.data.color,
      icon: parsed.data.icon,
    } as never)
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { data: data as { id: string } };
}

export async function updateGoal(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    target_amount: formData.get("target_amount"),
    target_date: formData.get("target_date") || null,
    account_id: formData.get("account_id") || null,
    color: formData.get("color"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
      target_date: parsed.data.target_date || null,
      account_id: parsed.data.account_id || null,
      color: parsed.data.color,
      icon: parsed.data.icon,
    } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function archiveGoal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ archived_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function addGoalContribution(formData: FormData): Promise<ActionResult> {
  const parsed = goalContributionSchema.safeParse({
    goal_id: formData.get("goal_id"),
    amount: formData.get("amount"),
    contribution_date: formData.get("contribution_date"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("goal_contributions")
    .insert({
      user_id: user.id,
      goal_id: parsed.data.goal_id,
      amount: parsed.data.amount,
      contribution_date: parsed.data.contribution_date,
      note: parsed.data.note || null,
    } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteGoalContribution(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("goal_contributions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

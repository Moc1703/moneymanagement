"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function setInitialBalances(
  balances: { accountId: string; amount: number }[],
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  for (const { accountId, amount } of balances) {
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: "Jumlah saldo tidak valid" };
    }
    const { error } = await supabase
      .from("accounts")
      .update({ initial_balance: amount } as never)
      .eq("id", accountId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function completeOnboarding(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_done: true } as never)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

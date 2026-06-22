"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { accountSchema } from "@/lib/utils/validators";
import type { Account } from "@/lib/types";

export type ActionResult<T = void> = { error?: string; data?: T };

export async function getAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function getAccount(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Account;
}

export async function createAccount(formData: FormData): Promise<ActionResult> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    initial_balance: formData.get("initial_balance") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
    icon: parsed.data.icon,
    initial_balance: parsed.data.initial_balance,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  revalidatePath("/dashboard");
  return {};
}

export async function updateAccount(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    initial_balance: formData.get("initial_balance") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: parsed.data.icon,
      initial_balance: parsed.data.initial_balance,
    } as never)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  revalidatePath("/dashboard");
  return {};
}

export async function archiveAccount(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ is_archived: true } as never)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  revalidatePath("/dashboard");
  return {};
}

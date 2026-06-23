"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { debtSchema, debtPaymentSchema } from "@/lib/utils/validators";
import type { DebtBalance, DebtPayment, DebtDirection } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getDebts(direction?: DebtDirection): Promise<DebtBalance[]> {
  const supabase = await createClient();
  let query = supabase.from("debt_balance").select("*");
  if (direction) query = query.eq("direction", direction);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DebtBalance[];
}

export async function getDebt(id: string): Promise<DebtBalance | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_balance")
    .select("*")
    .eq("debt_id", id)
    .single();
  if (error) return null;
  return data as unknown as DebtBalance;
}

export async function getDebtPayments(debtId: string): Promise<DebtPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("debt_id", debtId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DebtPayment[];
}

export async function createDebt(formData: FormData): Promise<ActionResult> {
  const parsed = debtSchema.safeParse({
    counterparty: formData.get("counterparty"),
    direction: formData.get("direction"),
    principal: formData.get("principal"),
    due_date: formData.get("due_date") || null,
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      counterparty: parsed.data.counterparty,
      direction: parsed.data.direction,
      principal: parsed.data.principal,
      due_date: parsed.data.due_date || null,
      note: parsed.data.note || null,
    } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("debts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function settleDebt(formData: FormData): Promise<ActionResult> {
  const parsed = debtPaymentSchema.safeParse({
    debt_id: formData.get("debt_id"),
    amount: formData.get("amount"),
    payment_date: formData.get("payment_date"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("settle_debt", {
    p_debt_id: parsed.data.debt_id,
    p_amount: parsed.data.amount,
    p_payment_date: parsed.data.payment_date,
    p_note: parsed.data.note || null,
    p_transaction_id: null,
  } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

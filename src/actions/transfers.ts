"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transferSchema } from "@/lib/utils/validators";
import type { TransactionWithRelations } from "@/lib/types";

export type ActionResult = { error?: string; transferGroupId?: string };

export type TransferGroup = {
  groupId: string;
  transactions: TransactionWithRelations[];
};

export async function getTransfers(options?: { limit?: number }): Promise<TransferGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, account:accounts(*), category:categories(*)")
    .not("transfer_group_id", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const txs = (data ?? []) as TransactionWithRelations[];
  const groups = new Map<string, TransactionWithRelations[]>();
  for (const tx of txs) {
    const gid = tx.transfer_group_id!;
    if (!groups.has(gid)) groups.set(gid, []);
    groups.get(gid)!.push(tx);
  }

  const result: TransferGroup[] = Array.from(groups.entries()).map(([groupId, transactions]) => ({
    groupId,
    transactions,
  }));

  return options?.limit ? result.slice(0, options.limit) : result;
}

export async function createTransfer(formData: FormData): Promise<ActionResult> {
  const parsed = transferSchema.safeParse({
    from_account_id: formData.get("from_account_id"),
    to_account_id: formData.get("to_account_id"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_transfer", {
    p_from_account_id: parsed.data.from_account_id,
    p_to_account_id: parsed.data.to_account_id,
    p_amount: parsed.data.amount,
    p_date: parsed.data.date,
    p_description: parsed.data.description || null,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { transferGroupId: data as string };
}

export async function deleteTransfer(groupId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("transfer_group_id", groupId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

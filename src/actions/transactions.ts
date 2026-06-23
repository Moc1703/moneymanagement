"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/utils/validators";
import type { TransactionWithRelations } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getTransactions(options?: {
  limit?: number;
  accountId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  type?: "income" | "expense";
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*, account:accounts(*), project:projects(*), category:categories(*)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.accountId) query = query.eq("account_id", options.accountId);
  if (options?.projectId) query = query.eq("project_id", options.projectId);
  if (options?.type) query = query.eq("type", options.type);
  if (options?.startDate) query = query.gte("date", options.startDate);
  if (options?.endDate) query = query.lte("date", options.endDate);
  if (options?.search) {
    const trimmed = options.search.trim();
    if (trimmed.length > 0) {
      query = query.textSearch("search_vector", trimmed, {
        type: "websearch",
        config: "simple",
      });
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TransactionWithRelations[];
}

export async function createTransaction(formData: FormData): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id"),
    project_id: formData.get("project_id") || null,
    date: formData.get("date"),
    description: formData.get("description") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  // If no project, fall back to "Umum"
  let projectId = parsed.data.project_id;
  if (!projectId) {
    const { data: umum } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single();
    projectId = (umum as any)?.id ?? null;
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: parsed.data.type,
    amount: parsed.data.amount,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id,
    project_id: projectId,
    date: parsed.data.date,
    description: parsed.data.description || null,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateTransaction(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id"),
    project_id: formData.get("project_id") || null,
    date: formData.get("date"),
    description: formData.get("description") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({
      type: parsed.data.type,
      amount: parsed.data.amount,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id,
      project_id: parsed.data.project_id,
      date: parsed.data.date,
      description: parsed.data.description || null,
    } as never)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

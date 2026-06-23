"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assetSchema, liabilitySchema } from "@/lib/utils/validators";
import type { Asset, AssetSnapshot, Liability, LiabilitySnapshot } from "@/lib/types";

export type ActionResult = { error?: string };

// ============================================================================
// Read
// ============================================================================
export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .is("archived_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Asset[];
}

export async function getLiabilities(): Promise<Liability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("liabilities")
    .select("*")
    .is("archived_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Liability[];
}

export async function getAssetSnapshots(): Promise<AssetSnapshot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AssetSnapshot[];
}

export async function getLiabilitySnapshots(): Promise<LiabilitySnapshot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("liability_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LiabilitySnapshot[];
}

// ============================================================================
// Asset CRUD
// ============================================================================
export async function createAsset(formData: FormData): Promise<ActionResult> {
  const parsed = assetSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    current_value: formData.get("current_value"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("assets")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      current_value: parsed.data.current_value,
      color: parsed.data.color,
      icon: parsed.data.icon,
      note: parsed.data.note || null,
    } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function updateAssetValue(id: string, value: number): Promise<ActionResult> {
  if (!Number.isFinite(value) || value < 0) return { error: "Nilai tidak valid" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("assets")
    .update({ current_value: value } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function archiveAsset(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assets")
    .update({ archived_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

// ============================================================================
// Liability CRUD
// ============================================================================
export async function createLiability(formData: FormData): Promise<ActionResult> {
  const parsed = liabilitySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    current_balance: formData.get("current_balance"),
    original_amount: formData.get("original_amount") || null,
    interest_rate_pct: formData.get("interest_rate_pct") || null,
    end_date: formData.get("end_date") || null,
    color: formData.get("color"),
    icon: formData.get("icon"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("liabilities")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      current_balance: parsed.data.current_balance,
      original_amount: parsed.data.original_amount || null,
      interest_rate_pct: parsed.data.interest_rate_pct || null,
      end_date: parsed.data.end_date || null,
      color: parsed.data.color,
      icon: parsed.data.icon,
      note: parsed.data.note || null,
    } as never);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function updateLiabilityBalance(id: string, balance: number): Promise<ActionResult> {
  if (!Number.isFinite(balance) || balance < 0) return { error: "Saldo tidak valid" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("liabilities")
    .update({ current_balance: balance } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function archiveLiability(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("liabilities")
    .update({ archived_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

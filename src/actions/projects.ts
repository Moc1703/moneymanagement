"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/utils/validators";
import type { Project } from "@/lib/types";

export type ActionResult = { error?: string };

export async function getProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    color: parsed.data.color,
    is_default: false,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/settings/projects");
  return {};
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color,
    } as never)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/settings/projects");
  return {};
}

export async function archiveProject(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: proj } = await supabase.from("projects").select("is_default").eq("id", id).single();
  if ((proj as any)?.is_default) {
    return { error: "Project Umum tidak bisa diarsipkan" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_archived: true } as never)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/settings/projects");
  return {};
}

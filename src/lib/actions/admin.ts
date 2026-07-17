"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Oturum gerekli" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, error: "Yetkisiz" as const };
  }

  return { supabase, error: null, user };
}

export async function approveCompany(companyId: string): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/firmalar");
  return { success: "Firma onaylandı" };
}

export async function toggleUserActive(userId: string): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "Kullanıcı bulunamadı" };

  await supabase
    .from("profiles")
    .update({ is_active: !profile.is_active })
    .eq("id", userId);

  revalidatePath("/admin/kullanicilar");
  return { success: "Kullanıcı güncellendi" };
}

export async function upsertProfession(formData: FormData): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const name = formData.get("name") as string;
  const category = (formData.get("category") as string) || null;
  const id = formData.get("id") as string | null;
  const is_trending = formData.get("is_trending") === "true";

  if (!name) return { error: "Meslek adı gerekli" };

  if (id) {
    await supabase
      .from("professions")
      .update({ name, category, is_trending })
      .eq("id", id);
  } else {
    await supabase.from("professions").insert({
      name,
      slug: slugify(name),
      category,
      is_trending,
    });
  }

  revalidatePath("/admin/meslekler");
  return { success: "Meslek kaydedildi" };
}

export async function upsertSalaryRange(formData: FormData): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const profession_id = formData.get("profession_id") as string;
  const avg_salary = Number(formData.get("avg_salary"));
  const min_salary = Number(formData.get("min_salary") || avg_salary * 0.8);
  const max_salary = Number(formData.get("max_salary") || avg_salary * 1.3);
  const id = formData.get("id") as string | null;

  if (!profession_id || !avg_salary) {
    return { error: "Meslek ve ortalama maaş gerekli" };
  }

  if (id) {
    await supabase
      .from("salary_ranges")
      .update({ avg_salary, min_salary, max_salary, updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await supabase.from("salary_ranges").insert({
      profession_id,
      avg_salary,
      min_salary,
      max_salary,
      city: null,
    });
  }

  revalidatePath("/admin/maaslar");
  return { success: "Maaş verisi kaydedildi" };
}

export async function getAdminStats() {
  const { supabase, error } = await requireAdmin();
  if (error) return null;

  const [
    { count: workers },
    { count: companies },
    { count: messages },
    { data: stats },
  ] = await Promise.all([
    supabase.from("workers").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("site_stats").select("*").eq("id", 1).single(),
  ]);

  return {
    workers: workers ?? 0,
    companies: companies ?? 0,
    messages: messages ?? 0,
    views: stats?.total_views ?? 0,
  };
}

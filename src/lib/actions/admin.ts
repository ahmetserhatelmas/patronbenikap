"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
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

export async function getAdminCompany(companyId: string) {
  const { error } = await requireAdmin();
  if (error) return null;

  const admin = createServiceClient();
  const { data } = await admin
    .from("companies")
    .select(
      `
      *,
      profile:profiles(id, email, full_name, phone, is_active, created_at, avatar_url, last_seen_at)
    `
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!data) return null;

  const [{ count: favorites }, { count: conversations }, { count: views }] =
    await Promise.all([
      admin
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
      admin
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
      admin
        .from("recently_viewed")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
    ]);

  return {
    ...data,
    stats: {
      favorites: favorites ?? 0,
      conversations: conversations ?? 0,
      profileViews: views ?? 0,
    },
  };
}

export async function approveCompany(companyId: string): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { error: updateError } = await admin
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/firmalar");
  revalidatePath(`/admin/firmalar/${companyId}`);
  revalidatePath("/firma/panel");
  return { success: "Firma doğrulandı" };
}

export async function revokeCompanyVerification(
  companyId: string
): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { error: updateError } = await admin
    .from("companies")
    .update({ is_verified: false })
    .eq("id", companyId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/firmalar");
  revalidatePath(`/admin/firmalar/${companyId}`);
  revalidatePath("/firma/panel");
  return { success: "Firma onayı kaldırıldı" };
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
  const { error } = await requireAdmin();
  if (error) return { error };

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const id = (formData.get("id") as string) || null;
  const is_trending = formData.get("is_trending") === "true";

  if (!name) return { error: "Meslek adı gerekli" };
  if (!category) return { error: "Kategori seçmelisin" };

  const admin = createServiceClient();

  const { data: cat } = await admin
    .from("profession_categories")
    .select("id, name")
    .eq("name", category)
    .maybeSingle();

  if (!cat) {
    return { error: "Geçersiz kategori. Önce Kategoriler’den ekle." };
  }

  if (id) {
    const { error: updateError } = await admin
      .from("professions")
      .update({ name, category: cat.name, is_trending })
      .eq("id", id);
    if (updateError) return { error: updateError.message };
  } else {
    const { error: insertError } = await admin.from("professions").insert({
      name,
      slug: slugify(name),
      category: cat.name,
      is_trending,
    });
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/admin/meslekler");
  revalidatePath("/admin/kategoriler");
  return { success: id ? "Meslek güncellendi" : "Meslek eklendi" };
}

export async function deleteProfession(id: string): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { error: deleteError } = await admin
    .from("professions")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/meslekler");
  revalidatePath("/admin/maaslar");
  return { success: "Meslek silindi" };
}

/** Ensure every professions.category exists in profession_categories */
export async function syncProfessionCategories(): Promise<
  ActionResult & { categories?: { id: string; name: string; slug: string; sort_order: number; created_at: string }[] }
> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();

  const [{ data: professions }, { data: existing }] = await Promise.all([
    admin.from("professions").select("category"),
    admin.from("profession_categories").select("name"),
  ]);

  const have = new Set((existing ?? []).map((c) => c.name));
  const missing = [
    ...new Set(
      (professions ?? [])
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c) && !have.has(c))
    ),
  ];

  if (missing.length) {
    const { error: insertError } = await admin
      .from("profession_categories")
      .insert(
        missing.map((name) => ({
          name,
          slug: slugify(name),
          sort_order: 200,
        }))
      );
    if (insertError) return { error: insertError.message };
  }

  const { data: categories, error: listError } = await admin
    .from("profession_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (listError) return { error: listError.message };

  // No revalidatePath here — this runs during page render too
  return { success: "Kategoriler senkron", categories: categories ?? [] };
}

export async function upsertProfessionCategory(
  formData: FormData
): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const name = (formData.get("name") as string)?.trim();
  const id = (formData.get("id") as string) || null;
  const sort_order = Number(formData.get("sort_order") || 100);

  if (!name) return { error: "Kategori adı gerekli" };

  const admin = createServiceClient();
  const slug = slugify(name);

  if (id) {
    const { data: existing } = await admin
      .from("profession_categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    const { error: updateError } = await admin
      .from("profession_categories")
      .update({ name, slug, sort_order })
      .eq("id", id);

    if (updateError) return { error: updateError.message };

    // Keep professions.category text in sync when renaming
    if (existing?.name && existing.name !== name) {
      await admin
        .from("professions")
        .update({ category: name })
        .eq("category", existing.name);
    }
  } else {
    const { error: insertError } = await admin
      .from("profession_categories")
      .insert({ name, slug, sort_order });
    if (insertError) {
      if (insertError.message.toLowerCase().includes("duplicate")) {
        return { error: "Bu kategori zaten var" };
      }
      return { error: insertError.message };
    }
  }

  revalidatePath("/admin/kategoriler");
  revalidatePath("/admin/meslekler");
  return { success: id ? "Kategori güncellendi" : "Kategori eklendi" };
}

export async function deleteProfessionCategory(
  id: string
): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { data: cat } = await admin
    .from("profession_categories")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (!cat) return { error: "Kategori bulunamadı" };

  const { count } = await admin
    .from("professions")
    .select("*", { count: "exact", head: true })
    .eq("category", cat.name);

  if ((count ?? 0) > 0) {
    return {
      error: `Bu kategoride ${count} meslek var. Önce meslekleri taşı veya sil.`,
    };
  }

  const { error: deleteError } = await admin
    .from("profession_categories")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/kategoriler");
  revalidatePath("/admin/meslekler");
  return { success: "Kategori silindi" };
}

export async function upsertSalaryRange(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const profession_id = formData.get("profession_id") as string;
  const avg_salary = Number(formData.get("avg_salary"));
  const min_salary = Number(formData.get("min_salary") || avg_salary * 0.8);
  const max_salary = Number(formData.get("max_salary") || avg_salary * 1.3);
  const id = (formData.get("id") as string) || null;

  if (!profession_id || !avg_salary) {
    return { error: "Meslek ve ortalama maaş gerekli" };
  }

  const admin = createServiceClient();

  if (id) {
    const { error: updateError } = await admin
      .from("salary_ranges")
      .update({
        profession_id,
        avg_salary,
        min_salary,
        max_salary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (updateError) return { error: updateError.message };
  } else {
    const { error: insertError } = await admin.from("salary_ranges").insert({
      profession_id,
      avg_salary,
      min_salary,
      max_salary,
      city: null,
    });
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/admin/maaslar");
  return { success: id ? "Maaş verisi güncellendi" : "Maaş verisi kaydedildi" };
}

export async function deleteSalaryRange(id: string): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { error: deleteError } = await admin
    .from("salary_ranges")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/maaslar");
  return { success: "Maaş verisi silindi" };
}

/** Pasife al / tekrar yayınla (workers.is_visible) */
export async function toggleListingVisibility(
  workerId: string
): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { data: worker } = await admin
    .from("workers")
    .select("id, is_visible")
    .eq("id", workerId)
    .maybeSingle();

  if (!worker) return { error: "İlan bulunamadı" };

  const { error: updateError } = await admin
    .from("workers")
    .update({ is_visible: !worker.is_visible })
    .eq("id", workerId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/ilanlar");
  revalidatePath(`/admin/ilanlar/${workerId}`);
  revalidatePath("/firma/ara");
  return {
    success: worker.is_visible ? "İlan pasife alındı" : "İlan tekrar yayınlandı",
  };
}

/** İlanı (işçi profilini) kalıcı sil */
export async function deleteListing(workerId: string): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { error };

  const admin = createServiceClient();
  const { error: deleteError } = await admin
    .from("workers")
    .delete()
    .eq("id", workerId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/ilanlar");
  revalidatePath(`/admin/ilanlar/${workerId}`);
  revalidatePath("/firma/ara");
  return { success: "İlan silindi" };
}

export async function getAdminListings() {
  const { error } = await requireAdmin();
  if (error) return null;

  const admin = createServiceClient();
  const { data } = await admin
    .from("workers")
    .select(
      `
      id,
      first_name,
      last_name,
      slug,
      city,
      is_visible,
      view_count,
      created_at,
      updated_at,
      profession:professions(name),
      profile:profiles(email, is_active)
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}

export async function getAdminListing(workerId: string) {
  const { error } = await requireAdmin();
  if (error) return null;

  const admin = createServiceClient();
  const { data } = await admin
    .from("workers")
    .select(
      `
      *,
      profession:professions(*),
      skills:worker_skills(id, skill_id, level, skill:skills(*)),
      certificates(*),
      portfolio_images(*),
      profile:profiles(id, email, full_name, phone, is_active, created_at, avatar_url)
    `
    )
    .eq("id", workerId)
    .maybeSingle();

  return data;
}

export async function getAdminStats() {
  const { error } = await requireAdmin();
  if (error) return null;

  // Service role: gerçek toplamlar (RLS mesajları gizlemesin / sahte site_stats kullanma)
  const admin = createServiceClient();

  const [
    { count: workers },
    { count: companies },
    { count: messages },
    { data: workerViews },
  ] = await Promise.all([
    admin.from("workers").select("*", { count: "exact", head: true }),
    admin.from("companies").select("*", { count: "exact", head: true }),
    admin.from("messages").select("*", { count: "exact", head: true }),
    admin.from("workers").select("view_count"),
  ]);

  const views = (workerViews ?? []).reduce(
    (sum, row) => sum + (row.view_count ?? 0),
    0
  );

  return {
    workers: workers ?? 0,
    companies: companies ?? 0,
    messages: messages ?? 0,
    views,
  };
}

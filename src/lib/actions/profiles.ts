"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  workerProfileSchema,
  companyProfileSchema,
} from "@/lib/validations/auth";
import {
  calculateProfileCompletion,
  slugify,
} from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";
import type { WorkerSearchParams } from "@/types/database";

export async function upsertWorkerProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const skillIds = formData.getAll("skill_ids") as string[];
  const languages = formData.getAll("languages") as string[];
  const driverLicense = formData.getAll("driver_license") as string[];
  const specializationsRaw = (formData.get("specializations") as string) || "";
  const specializations = specializationsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = workerProfileSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    age: formData.get("age") || null,
    city: formData.get("city") || null,
    district: formData.get("district") || null,
    profession_id: formData.get("profession_id") || null,
    experience_years: formData.get("experience_years") || 0,
    education: formData.get("education") || null,
    languages,
    driver_license: driverLicense,
    military_status: formData.get("military_status") || null,
    currently_working: formData.get("currently_working") === "true",
    shift_work: formData.get("shift_work") === "true",
    expected_salary: formData.get("expected_salary") || null,
    availability: formData.get("availability") || null,
    about_me: formData.get("about_me") || null,
    specializations,
    whatsapp: formData.get("whatsapp") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    is_visible: formData.get("is_visible") !== "false",
    skill_ids: skillIds,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      error: "Lütfen işaretli alanları doldur",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Oturum gerekli" };

  const { skill_ids, ...data } = parsed.data;
  const completion = calculateProfileCompletion(data);
  const baseSlug = slugify(`${data.first_name}-${data.last_name}`);
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const { data: existing } = await supabase
    .from("workers")
    .select("id, slug")
    .eq("profile_id", user.id)
    .maybeSingle();

  let workerId = existing?.id;

  if (existing) {
    const { error } = await supabase
      .from("workers")
      .update({
        ...data,
        profile_completion: completion,
        email: data.email || user.email,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("workers")
      .insert({
        ...data,
        profile_id: user.id,
        slug,
        profile_completion: completion,
        email: data.email || user.email,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    workerId = created.id;
  }

  if (workerId && skill_ids.length >= 0) {
    await supabase.from("worker_skills").delete().eq("worker_id", workerId);
    if (skill_ids.length > 0) {
      await supabase.from("worker_skills").insert(
        skill_ids.map((skill_id) => ({
          worker_id: workerId!,
          skill_id,
          level: 3,
        }))
      );
    }
  }

  await supabase
    .from("profiles")
    .update({
      is_onboarded: true,
      full_name: `${data.first_name} ${data.last_name}`,
      phone: data.phone,
    })
    .eq("id", user.id);

  revalidatePath("/isci/profil");
  revalidatePath("/isci/panel");
  return { success: "Profil kaydedildi" };
}

export async function upsertCompanyProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = companyProfileSchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector") || null,
    city: formData.get("city") || null,
    description: formData.get("description") || null,
    website: formData.get("website") || null,
    phone: formData.get("phone") || null,
    employee_count: formData.get("employee_count") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Oturum gerekli" };

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const slug = `${slugify(parsed.data.name)}-${user.id.slice(0, 6)}`;

  if (existing) {
    const { error } = await supabase
      .from("companies")
      .update(parsed.data)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("companies").insert({
      ...parsed.data,
      profile_id: user.id,
      slug,
    });
    if (error) return { error: error.message };
  }

  await supabase
    .from("profiles")
    .update({
      is_onboarded: true,
      full_name: parsed.data.name,
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  revalidatePath("/firma/profil");
  revalidatePath("/firma/panel");
  return { success: "Firma profili kaydedildi" };
}

export async function searchWorkers(params: WorkerSearchParams) {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("workers")
    .select(
      `
      *,
      profession:professions(*),
      skills:worker_skills(id, level, skill:skills(*)),
      profile:profiles(avatar_url)
    `,
      { count: "exact" }
    )
    .eq("is_visible", true);

  if (params.city) query = query.eq("city", params.city);
  if (params.district) query = query.ilike("district", `%${params.district}%`);
  if (params.profession) query = query.eq("profession_id", params.profession);
  if (params.experience_min != null)
    query = query.gte("experience_years", params.experience_min);
  if (params.experience_max != null)
    query = query.lte("experience_years", params.experience_max);
  if (params.salary_min != null)
    query = query.gte("expected_salary", params.salary_min);
  if (params.salary_max != null)
    query = query.lte("expected_salary", params.salary_max);
  if (params.availability) query = query.eq("availability", params.availability);
  if (params.education) query = query.eq("education", params.education);
  if (params.shift_work === true) query = query.eq("shift_work", true);
  if (params.languages?.length)
    query = query.overlaps("languages", params.languages);
  if (params.q) {
    query = query.or(
      `first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%,about_me.ilike.%${params.q}%`
    );
  }

  switch (params.sort) {
    case "experience":
      query = query.order("experience_years", { ascending: false });
      break;
    case "salary_asc":
      query = query.order("expected_salary", { ascending: true, nullsFirst: false });
      break;
    case "salary_desc":
      query = query.order("expected_salary", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return { workers: [], total: 0, error: error.message };
  }

  return { workers: data ?? [], total: count ?? 0, error: null };
}

export async function toggleFavorite(workerId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!company) return { error: "Firma profili gerekli" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("company_id", company.id)
    .eq("worker_id", workerId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath("/firma/favoriler");
    return { success: "Favorilerden çıkarıldı" };
  }

  await supabase.from("favorites").insert({
    company_id: company.id,
    worker_id: workerId,
  });

  const { data: worker } = await supabase
    .from("workers")
    .select("profile_id, first_name")
    .eq("id", workerId)
    .single();

  if (worker) {
    const { data: companyInfo } = await supabase
      .from("companies")
      .select("name")
      .eq("id", company.id)
      .single();

    await supabase.from("notifications").insert({
      user_id: worker.profile_id,
      type: "favorite",
      title: "PATRON SENİ KAPMAK İSTİYOR 🔥",
      body: companyInfo?.name
        ? `${companyInfo.name} seni favorilerine ekledi. Hadi, fırsatı kaçırma!`
        : "Bir firma seni favorilerine ekledi. Hadi, fırsatı kaçırma!",
      link: "/isci/bildirimler",
      metadata: { company_id: company.id },
    });
  }

  revalidatePath("/firma/favoriler");
  return { success: "Favorilere eklendi" };
}

export async function getSalaryForProfession(professionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("salary_ranges")
    .select("*")
    .eq("profession_id", professionId)
    .is("city", null)
    .maybeSingle();
  return data;
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "Fotoğraf seçilmedi" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Sadece görsel yükleyebilirsin" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Fotoğraf en fazla 5MB olmalı" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return {
      error:
        uploadError.message.includes("Bucket") ||
        uploadError.message.includes("not found")
          ? "Storage bucket eksik: Supabase Storage'da 'avatars' bucket'ını public oluştur."
          : uploadError.message,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  revalidatePath("/isci/profil");
  revalidatePath("/isci/panel");
  return { success: "Fotoğraf güncellendi" };
}

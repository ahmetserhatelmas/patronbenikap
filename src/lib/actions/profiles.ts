"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  workerProfileSchema,
  companyProfileSchema,
} from "@/lib/validations/auth";
import {
  calculateProfileCompletion,
  normalizeTrPhoneInput,
  slugify,
} from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/auth";
import { setWorkerSlugCookie } from "@/lib/auth-cookies";
import type { WorkerSearchParams } from "@/types/database";

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function upsertWorkerProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const skillIds = formData.getAll("skill_ids").filter((v): v is string => typeof v === "string");
  const languages = formData.getAll("languages").filter((v): v is string => typeof v === "string");
  const driverLicense = formData
    .getAll("driver_license")
    .filter((v): v is string => typeof v === "string");
  const specializationsRaw = str(formData, "specializations");
  const specializations = specializationsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Keep submitted values as strings (not null) so required fields get Turkish errors
  // and the form can restore Select / checkbox state after validation fails.
  const values = {
    first_name: str(formData, "first_name"),
    last_name: str(formData, "last_name"),
    age: str(formData, "age"),
    city: str(formData, "city"),
    district: str(formData, "district"),
    profession_id: str(formData, "profession_id"),
    experience_years: str(formData, "experience_years"),
    education: str(formData, "education"),
    military_status: str(formData, "military_status"),
    expected_salary: str(formData, "expected_salary"),
    availability: str(formData, "availability"),
    about_me: str(formData, "about_me"),
    specializations: specializationsRaw,
    phone: normalizeTrPhoneInput(str(formData, "phone")),
    // WhatsApp ayrı girilmez; telefon numarasıyla aynı tutulur
    whatsapp: normalizeTrPhoneInput(
      str(formData, "phone") || str(formData, "whatsapp")
    ),
    email: str(formData, "email"),
    currently_working: str(formData, "currently_working") || "false",
    shift_work: str(formData, "shift_work") || "false",
    is_visible: str(formData, "is_visible") || "true",
    languages: languages.join("|"),
    driver_license: driverLicense.join("|"),
    skill_ids: skillIds.join("|"),
  };

  const parsed = workerProfileSchema.safeParse({
    first_name: values.first_name,
    last_name: values.last_name,
    age: values.age,
    city: values.city,
    district: values.district,
    profession_id: values.profession_id,
    experience_years: values.experience_years || 0,
    education: values.education,
    languages,
    driver_license: driverLicense,
    military_status: values.military_status,
    currently_working: values.currently_working === "true",
    shift_work: values.shift_work === "true",
    expected_salary: values.expected_salary,
    availability: values.availability,
    about_me: values.about_me,
    specializations,
    whatsapp: values.whatsapp,
    phone: values.phone,
    email: values.email,
    is_visible: values.is_visible !== "false",
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
      values,
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

  await setWorkerSlugCookie(existing?.slug ?? slug);

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

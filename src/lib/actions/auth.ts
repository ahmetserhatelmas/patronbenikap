"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";
import {
  clearAuthNavCookies,
  setRoleCookie,
  setWorkerSlugCookie,
} from "@/lib/auth-cookies";
import { getSiteUrl } from "@/lib/utils";
import { z } from "zod";
import type { Profile } from "@/types/database";

export type ActionResult = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Keep form fields after validation / auth errors (React resets uncontrolled forms). */
  values?: Record<string, string>;
};

function formValues(formData: FormData, keys: string[]) {
  const values: Record<string, string> = {};
  for (const key of keys) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }
  return values;
}

export async function signIn(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const values = formValues(formData, ["email", "password", "next"]);

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Geçersiz form",
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-posta veya şifre hatalı", values };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      await clearAuthNavCookies();
      return {
        error: "Hesabın pasifleştirilmiş. Destek ile iletişime geç.",
        values,
      };
    }

    if (profile?.role) {
      await setRoleCookie(profile.role);
      if (profile.role === "worker") {
        const { data: worker } = await supabase
          .from("workers")
          .select("slug")
          .eq("profile_id", user.id)
          .maybeSingle();
        await setWorkerSlugCookie(worker?.slug);
      } else {
        await setWorkerSlugCookie(null);
      }
    }
  }

  const next = (formData.get("next") as string) || "/";
  redirect(next);
}

export async function signUp(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const values = formValues(formData, [
    "email",
    "password",
    "confirmPassword",
    "fullName",
    "role",
    "acceptLegal",
  ]);

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    acceptLegal: formData.get("acceptLegal"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Geçersiz form",
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
      emailRedirectTo: `${await getSiteUrl()}/callback`,
    },
  });

  if (error) {
    const message =
      typeof error.message === "string" && error.message.trim()
        ? error.message
        : "Kayıt başarısız. Lütfen tekrar deneyin.";

    if (
      message.toLowerCase().includes("database error") ||
      message.toLowerCase().includes("saving new user")
    ) {
      return {
        error:
          "Veritabanı hatası: Supabase'te signup trigger'ı düzeltilmeli. SQL Editor'de supabase/migrations/002_fix_signup_trigger.sql dosyasını çalıştır.",
        values,
      };
    }

    if (message.toLowerCase().includes("already registered")) {
      return {
        error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.",
        values,
      };
    }

    return { error: message, values };
  }

  // Supabase sometimes returns a user with empty identities when email exists
  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    return {
      error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.",
      values,
    };
  }

  const onboardingPath =
    parsed.data.role === "company" ? "/firma/profil" : "/isci/profil";

  // Email onayı kapalıysa oturum gelir — panele yönlendir
  if (data.session) {
    redirect(onboardingPath);
  }

  // Email onayı zorunlu: mail gitti, kullanıcı linke tıklayınca /callback
  return {
    success:
      "Kayıt alındı. E-posta adresine onay linki gönderdik. Maildeki butona tıklayınca hesabın açılır.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearAuthNavCookies();
  redirect("/");
}

export async function signInWithGoogle(next = "/") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await getSiteUrl()}/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/giris?error=${encodeURIComponent(error?.message ?? "Google girişi başarısız")}`);
  }

  redirect(data.url);
}

export async function forgotPassword(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const values = formValues(formData, ["email"]);

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta",
      values,
    };
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/sifre-yenile`,
  });

  if (error) {
    return { error: error.message, values };
  }

  return { success: "Şifre sıfırlama linki e-posta adresinize gönderildi." };
}

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export async function updatePassword(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const values = formValues(formData, ["password", "confirmPassword"]);

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Geçersiz form",
      values,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Oturum bulunamadı. Şifre sıfırlama linkine tekrar tıkla.",
      values,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message, values };
  }

  return { success: "Şifren güncellendi. Giriş yapabilirsin." };
}

/** Deduped per RSC request — layout + page share one auth/profile fetch */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && profile.is_active === false) return null;

  return profile;
});

/** Direct nav target for "Profil" — avoids /profil → /isci/slug hop */
export const getProfileNavHref = cache(async (profile: Profile) => {
  if (profile.role === "company") return "/firma/profil";
  if (profile.role === "admin") return "/admin";

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("workers")
    .select("slug")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (worker?.slug) return `/isci/${worker.slug}`;
  return "/isci/profil";
});

export async function revalidateDashboard() {
  revalidatePath("/", "layout");
}

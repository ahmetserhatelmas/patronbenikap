"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function signIn(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-posta veya şifre hatalı" };
  }

  const next = (formData.get("next") as string) || "/";
  redirect(next);
}

export async function signUp(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
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
      };
    }

    if (message.toLowerCase().includes("already registered")) {
      return { error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." };
    }

    return { error: message };
  }

  // Supabase sometimes returns a user with empty identities when email exists
  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    return { error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." };
  }

  const onboardingPath =
    parsed.data.role === "company" ? "/firma/profil" : "/isci/profil";

  // Email doğrulaması kapalıysa signUp oturum döndürür — direkt yönlendir
  if (data.session) {
    redirect(onboardingPath);
  }

  // Doğrulama açıksa oturum gelmez; şifreyle giriş yapmayı dene
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!signInError) {
    redirect(onboardingPath);
  }

  return {
    error:
      "Otomatik giriş yapılamadı. Supabase Dashboard → Authentication → Sign In / Providers → Email altında 'Confirm email' ayarını kapat, sonra tekrar kayıt ol.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle(next = "/") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=${encodeURIComponent(next)}`,
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
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/sifre-yenile`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Şifre sıfırlama linki e-posta adresinize gönderildi." };
}

export async function getCurrentProfile() {
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

  return profile;
}

export async function revalidateDashboard() {
  revalidatePath("/", "layout");
}

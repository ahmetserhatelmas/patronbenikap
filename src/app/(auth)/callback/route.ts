import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/sifremi-unuttum?error=expired`);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return NextResponse.redirect(`${origin}/sifremi-unuttum?error=expired`);
    }
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/sifre-yenile`);
    }
  } else {
    return NextResponse.redirect(`${origin}/giris?error=auth`);
  }

  // Explicit next (password reset) beats role dashboards
  if (next && next !== "/") {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_onboarded")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_onboarded) {
      const dest =
        profile.role === "company" ? "/firma/profil" : "/isci/profil";
      return NextResponse.redirect(`${origin}${dest}`);
    }

    if (profile?.role === "admin") {
      return NextResponse.redirect(`${origin}/admin`);
    }
    if (profile?.role === "company") {
      return NextResponse.redirect(`${origin}/firma/panel`);
    }
    if (profile?.role === "worker") {
      return NextResponse.redirect(`${origin}/isci/panel`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}

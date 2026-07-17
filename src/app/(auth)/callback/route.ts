import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/giris?error=auth`);
}

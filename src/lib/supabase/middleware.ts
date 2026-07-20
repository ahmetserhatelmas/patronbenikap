import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/giris") ||
    path.startsWith("/kayit") ||
    path.startsWith("/sifremi-unuttum");
  // Recovery session is logged-in; allow staying on reset page
  const isPasswordResetPage = path.startsWith("/sifre-yenile");
  const isProtected =
    path.startsWith("/isci/panel") ||
    path.startsWith("/isci/profil") ||
    path.startsWith("/isci/mesajlar") ||
    path.startsWith("/isci/bildirimler") ||
    path.startsWith("/firma") ||
    path.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    // İşçi ara için giriş yerine firma kaydı göster — daha net
    if (path.startsWith("/firma/ara") || path.startsWith("/firma")) {
      url.pathname = "/kayit";
      url.search = "role=company";
      return NextResponse.redirect(url);
    }
    url.pathname = "/giris";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Allow "şifremi unuttum" while logged in (expired recovery links land here)
  if (user && isAuthPage && !path.startsWith("/sifremi-unuttum")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user && !isPasswordResetPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Giriş yapan kullanıcının ana sayfası paneli — landing sadece çıkışta
    if (path === "/") {
      const url = request.nextUrl.clone();
      url.pathname =
        profile?.role === "company"
          ? "/firma/panel"
          : profile?.role === "admin"
            ? "/admin"
            : "/isci/panel";
      return NextResponse.redirect(url);
    }

    if (profile?.role === "worker" && path.startsWith("/firma")) {
      const url = request.nextUrl.clone();
      url.pathname = "/isci/panel";
      return NextResponse.redirect(url);
    }

    const isWorkerDashboard =
      path.startsWith("/isci/panel") ||
      path.startsWith("/isci/profil") ||
      path.startsWith("/isci/mesajlar") ||
      path.startsWith("/isci/bildirimler");

    if (profile?.role === "company" && isWorkerDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/firma/panel";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

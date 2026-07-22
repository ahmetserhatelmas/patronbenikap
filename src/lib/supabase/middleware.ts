import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_COOKIE = "pbk_role";
const WORKER_SLUG_COOKIE = "pbk_worker_slug";

function needsRoleLookup(path: string) {
  return (
    path === "/" ||
    path.startsWith("/firma") ||
    path.startsWith("/isci/panel") ||
    path.startsWith("/isci/profil") ||
    path.startsWith("/isci/mesajlar") ||
    path.startsWith("/isci/bildirimler") ||
    path.startsWith("/admin")
  );
}

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
    if (path.startsWith("/firma/ara") || path.startsWith("/firma")) {
      url.pathname = "/kayit";
      url.search = "role=company";
      return NextResponse.redirect(url);
    }
    url.pathname = "/giris";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage && !path.startsWith("/sifremi-unuttum")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Instant /profil hop — no white RSC redirect page
  if (user && path === "/profil") {
    let role = request.cookies.get(ROLE_COOKIE)?.value;
    if (!role || !["worker", "company", "admin"].includes(role)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = profile?.role ?? undefined;
    }

    const url = request.nextUrl.clone();
    if (role === "company") {
      url.pathname = "/firma/profil";
      return NextResponse.redirect(url);
    }
    if (role === "admin") {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    const slug = request.cookies.get(WORKER_SLUG_COOKIE)?.value;
    if (slug) {
      url.pathname = `/isci/${slug}`;
      return NextResponse.redirect(url);
    }

    if (role === "worker") {
      const { data: worker } = await supabase
        .from("workers")
        .select("slug")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (worker?.slug) {
        url.pathname = `/isci/${worker.slug}`;
        const res = NextResponse.redirect(url);
        res.cookies.set(WORKER_SLUG_COOKIE, worker.slug, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          httpOnly: true,
        });
        if (role) {
          res.cookies.set(ROLE_COOKIE, role, {
            path: "/",
            maxAge: 60 * 60,
            sameSite: "lax",
            httpOnly: true,
          });
        }
        return res;
      }
      url.pathname = "/isci/profil";
      return NextResponse.redirect(url);
    }
  }

  if (user && !isPasswordResetPage && needsRoleLookup(path)) {
    let role = request.cookies.get(ROLE_COOKIE)?.value;

    if (!role || !["worker", "company", "admin"].includes(role)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = profile?.role ?? undefined;
      if (role) {
        supabaseResponse.cookies.set(ROLE_COOKIE, role, {
          path: "/",
          maxAge: 60 * 60,
          sameSite: "lax",
          httpOnly: true,
        });
      }
    }

    if (path === "/") {
      const url = request.nextUrl.clone();
      url.pathname =
        role === "company"
          ? "/firma/panel"
          : role === "admin"
            ? "/admin"
            : "/isci/panel";
      return NextResponse.redirect(url);
    }

    if (role === "worker" && path.startsWith("/firma")) {
      const url = request.nextUrl.clone();
      url.pathname = "/isci/panel";
      return NextResponse.redirect(url);
    }

    const isWorkerDashboard =
      path.startsWith("/isci/panel") ||
      path.startsWith("/isci/profil") ||
      path.startsWith("/isci/mesajlar") ||
      path.startsWith("/isci/bildirimler");

    if (role === "company" && isWorkerDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/firma/panel";
      return NextResponse.redirect(url);
    }

    // Unverified companies cannot use İşçi Ara
    if (role === "company" && path.startsWith("/firma/ara")) {
      const { data: company } = await supabase
        .from("companies")
        .select("is_verified")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (!company?.is_verified) {
        const url = request.nextUrl.clone();
        url.pathname = "/firma/panel";
        return NextResponse.redirect(url);
      }
    }
  }

  // Clear stale nav cookies on logout
  if (!user) {
    if (request.cookies.get(ROLE_COOKIE)) {
      supabaseResponse.cookies.set(ROLE_COOKIE, "", { path: "/", maxAge: 0 });
    }
    if (request.cookies.get(WORKER_SLUG_COOKIE)) {
      supabaseResponse.cookies.set(WORKER_SLUG_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
    }
  }

  return supabaseResponse;
}

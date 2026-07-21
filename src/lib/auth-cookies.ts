import { cookies } from "next/headers";

export const ROLE_COOKIE = "pbk_role";
export const WORKER_SLUG_COOKIE = "pbk_worker_slug";

const cookieOpts = {
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "lax" as const,
  httpOnly: true,
};

export async function setRoleCookie(role: string) {
  try {
    const jar = await cookies();
    jar.set(ROLE_COOKIE, role, cookieOpts);
  } catch {
    /* Server Component render — ignore */
  }
}

export async function setWorkerSlugCookie(slug: string | null | undefined) {
  try {
    const jar = await cookies();
    if (slug) {
      jar.set(WORKER_SLUG_COOKIE, slug, cookieOpts);
    } else {
      jar.set(WORKER_SLUG_COOKIE, "", { ...cookieOpts, maxAge: 0 });
    }
  } catch {
    /* ignore */
  }
}

export async function clearAuthNavCookies() {
  try {
    const jar = await cookies();
    jar.set(ROLE_COOKIE, "", { path: "/", maxAge: 0 });
    jar.set(WORKER_SLUG_COOKIE, "", { path: "/", maxAge: 0 });
  } catch {
    /* ignore */
  }
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles Supabase password-recovery redirects that land with hash tokens/errors
 * (middleware cannot see the hash, so logged-in users were bounced to /isci/panel).
 */
export function AuthRecoveryListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const params = new URLSearchParams(hash);
      const errorCode = params.get("error_code");
      const error = params.get("error");
      const type = params.get("type");

      if (error || errorCode) {
        const dest =
          errorCode === "otp_expired"
            ? "/sifremi-unuttum?error=expired"
            : "/sifremi-unuttum?error=auth";
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(dest);
        return;
      }

      if (type === "recovery" && pathname !== "/sifre-yenile") {
        router.replace("/sifre-yenile");
      }
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/sifre-yenile") {
        router.replace("/sifre-yenile");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}

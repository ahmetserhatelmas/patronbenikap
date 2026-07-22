import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

/**
 * Email link landing (signup confirm + password recovery).
 * Supports both PKCE (?code=) and token_hash (?token_hash=&type=) flows.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = safeNextPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const site = await getSiteUrl();

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = next === "/" ? "/" : next;
      return NextResponse.redirect(`${site}${dest}`);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Recovery must land on password form — never role dashboards
      const dest = type === "recovery" ? "/sifre-yenile" : next;
      return NextResponse.redirect(`${site}${dest}`);
    }
  }

  return NextResponse.redirect(
    `${site}/sifremi-unuttum?error=${encodeURIComponent("expired")}`
  );
}

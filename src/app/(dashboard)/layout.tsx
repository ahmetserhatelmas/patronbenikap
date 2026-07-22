import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { getCurrentProfile, getProfileNavHref } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

async function DashboardHeader() {
  const profile = await getCurrentProfile();
  const profileHref = profile ? await getProfileNavHref(profile) : undefined;

  let canSearchWorkers = true;
  if (profile?.role === "company") {
    const supabase = await createClient();
    const { data: company } = await supabase
      .from("companies")
      .select("is_verified")
      .eq("profile_id", profile.id)
      .maybeSingle();
    canSearchWorkers = !!company?.is_verified;
  }

  return (
    <Header
      profile={profile}
      profileHref={profileHref}
      canSearchWorkers={canSearchWorkers}
    />
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/60 glass" />
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth redirects live in middleware — keep layout sync so page loading.tsx
  // can paint immediately while header + page stream in parallel.
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <DashboardHeader />
      </Suspense>
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicProfileView } from "@/components/worker/public-profile";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data: worker } = await supabase
      .from("workers")
      .select("first_name, last_name, about_me, city, profession:professions(name)")
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();

    if (!worker) return { title: "Profil bulunamadı" };

    const profession = (worker.profession as unknown as { name: string } | null)?.name;
    const title = `${worker.first_name} ${worker.last_name}${profession ? ` — ${profession}` : ""}`;
    const description =
      worker.about_me?.slice(0, 160) ||
      `${worker.first_name} ${worker.last_name}${worker.city ? ` · ${worker.city}` : ""} profili`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
      },
    };
  } catch {
    return { title: "İşçi Profili" };
  }
}

export default async function WorkerPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getCurrentProfile().catch(() => null);
  const supabase = await createClient();

  const { data: worker } = await supabase
    .from("workers")
    .select(
      `
      *,
      profession:professions(*),
      skills:worker_skills(id, skill_id, level, skill:skills(*)),
      certificates(*),
      portfolio_images(*),
      profile:profiles(avatar_url, email)
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!worker || (!worker.is_visible && worker.profile_id !== profile?.id)) {
    notFound();
  }

  // Increment view + notify (security definer RPC; bypasses worker update RLS)
  let viewCount = worker.view_count ?? 0;
  if (profile?.role === "company" && worker.profile_id !== profile.id) {
    const { data: newCount } = await supabase.rpc(
      "record_worker_profile_view",
      { p_worker_id: worker.id }
    );
    if (typeof newCount === "number") {
      viewCount = newCount;
    }
  }

  const workerWithViews = { ...worker, view_count: viewCount };

  let isFavorited = false;
  if (profile?.role === "company") {
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (company) {
      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("company_id", company.id)
        .eq("worker_id", worker.id)
        .maybeSingle();
      isFavorited = !!fav;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${worker.first_name} ${worker.last_name}`,
    jobTitle: worker.profession?.name,
    address: worker.city
      ? { "@type": "PostalAddress", addressLocality: worker.city }
      : undefined,
    description: worker.about_me,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header profile={profile} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PublicProfileView
          worker={workerWithViews}
          isCompany={profile?.role === "company"}
          isOwner={worker.profile_id === profile?.id}
          isFavorited={isFavorited}
          profileUrl={`/isci/${worker.slug}`}
        />
      </main>
      <Footer />
    </>
  );
}

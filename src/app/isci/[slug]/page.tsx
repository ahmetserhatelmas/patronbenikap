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

  // Increment view + notify worker (with company name)
  if (profile?.role === "company" && worker.profile_id !== profile.id) {
    await supabase
      .from("workers")
      .update({ view_count: worker.view_count + 1 })
      .eq("id", worker.id);

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (company) {
      const { data: previous } = await supabase
        .from("recently_viewed")
        .select("id, viewed_at")
        .eq("company_id", company.id)
        .eq("worker_id", worker.id)
        .maybeSingle();

      await supabase.from("recently_viewed").upsert(
        {
          company_id: company.id,
          worker_id: worker.id,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "company_id,worker_id" }
      );

      // Notify on first view or if last view was > 12 hours ago
      const shouldNotify =
        !previous ||
        Date.now() - new Date(previous.viewed_at).getTime() > 12 * 60 * 60 * 1000;

      if (shouldNotify) {
        await supabase.from("notifications").insert({
          user_id: worker.profile_id,
          type: "view",
          title: `${company.name} seni inceledi`,
          body: `${company.name} profiline baktı. Belki patron seni kapmak üzeredir!`,
          link: "/isci/bildirimler",
          metadata: { company_id: company.id, company_name: company.name },
        });
      }
    }
  }

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
          worker={worker}
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

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Advantages } from "@/components/landing/advantages";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTABanner } from "@/components/landing/cta-banner";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let profile = null;
  let stats = { workers: 20000, companies: 500, views: 100000 };

  try {
    profile = await getCurrentProfile();
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_stats")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      stats = {
        workers: data.active_workers,
        companies: data.active_companies,
        views: data.total_views,
      };
    }
  } catch {
    // Supabase not configured — use defaults
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Patron Beni Kap",
    url: process.env.NEXT_PUBLIC_APP_URL,
    description: "İşi değil, iş seni bulsun. Modern işçi-firma buluşma platformu.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL}/firma/ara?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header profile={profile} />
      <main>
        <HeroSection />
        <StatsSection
          workers={stats.workers}
          companies={stats.companies}
          views={stats.views}
        />
        <HowItWorks />
        <Advantages />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}

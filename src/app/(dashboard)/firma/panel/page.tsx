import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Heart, MessageSquare, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/worker/worker-card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Firma Paneli" };

export default async function CompanyDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");
  if (profile.role !== "company" && profile.role !== "admin") {
    redirect("/isci/panel");
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!company) redirect("/firma/profil");

  const [{ data: recent }, { count: favCount }] = await Promise.all([
    supabase
      .from("recently_viewed")
      .select(
        `worker:workers(*, profession:professions(*), skills:worker_skills(id, level, skill:skills(*)), profile:profiles(avatar_url))`
      )
      .eq("company_id", company.id)
      .order("viewed_at", { ascending: false })
      .limit(4),
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company.id),
  ]);

  const searchOpen = company.is_verified;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-3xl font-bold">
              {company.name}
              {company.is_verified && (
                <BadgeCheck className="h-7 w-7 text-primary" />
              )}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {company.sector}
              {company.city ? ` · ${company.city}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/firma/profil">Firma ayarları</Link>
            </Button>
            {searchOpen ? (
              <Button asChild>
                <Link href="/firma/ara">
                  <Search className="mr-1.5 h-4 w-4" />
                  İşçi Ara
                </Link>
              </Button>
            ) : (
              <Button disabled title="Admin onayından sonra aktif olur">
                <Search className="mr-1.5 h-4 w-4" />
                İşçi Ara
              </Button>
            )}
          </div>
        </div>

        {!searchOpen && (
          <div className="mt-6 rounded-2xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 text-sm">
            Firma hesabın onay bekliyor. MERSİS no kaydın tamamsa admin
            onayından sonra <strong>İşçi Ara</strong> açılacak.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            href={searchOpen ? "/firma/ara" : "/firma/panel"}
            icon={Search}
            label="İşçi ara"
            value={searchOpen ? "Keşfet" : "Onay bekleniyor"}
            color="primary"
          />
          <StatCard
            href="/firma/favoriler"
            icon={Heart}
            label="Favoriler"
            value={String(favCount ?? 0)}
            color="orange"
          />
          <StatCard
            href="/firma/mesajlar"
            icon={MessageSquare}
            label="Mesajlar"
            value="Sohbet"
            color="primary"
          />
        </div>

        {recent && recent.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
              Son bakılanlar
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((r) => {
                const w = r.worker as unknown as Parameters<
                  typeof WorkerCard
                >[0]["worker"];
                if (!w) return null;
                return <WorkerCard key={w.id} worker={w} />;
              })}
            </div>
          </section>
        )}
      </main>
  );
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  color,
}: {
  href: string;
  icon: typeof Search;
  label: string;
  value: string;
  color: "primary" | "orange";
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`mb-3 inline-flex rounded-lg p-2 ${
          color === "primary" ? "bg-primary/10 text-primary" : "bg-brand-orange/10 text-brand-orange"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

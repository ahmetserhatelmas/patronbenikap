import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Heart, MessageSquare, Percent } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "İşçi Paneli" };

export default async function WorkerDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");
  if (profile.role !== "worker" && profile.role !== "admin") {
    redirect("/firma/panel");
  }

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!worker) {
    redirect("/isci/profil");
  }

  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*, conversation:conversations!inner(worker_id)", {
      count: "exact",
      head: true,
    })
    .eq("is_read", false)
    .neq("sender_id", profile.id);

  const { count: unreadNotifs } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("type", "view")
    .eq("is_read", false);

  const { count: uniqueCompanyViews } = await supabase
    .from("recently_viewed")
    .select("*", { count: "exact", head: true })
    .eq("worker_id", worker.id);

  const cards = [
    {
      label: "Profil tamamlanma",
      value: `%${worker.profile_completion}`,
      icon: Percent,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Firma görüntüleme",
      value: uniqueCompanyViews ?? 0,
      hint: `${worker.view_count} toplam bakış`,
      icon: Eye,
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
    },
    {
      label: "Favoriye alan firma",
      value: worker.favorite_count,
      icon: Heart,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Okunmamış mesaj",
      value: unreadMessages ?? 0,
      icon: MessageSquare,
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
    },
  ];

  return (
    <>
      <Header
        profile={profile}
        unreadNotifications={unreadNotifs ?? 0}
        unreadMessages={unreadMessages ?? 0}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Merhaba, {worker.first_name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Profilin {worker.is_visible ? "görünür" : "gizli"} ·{" "}
              {worker.profile_completion}% tamamlandı
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/isci/${worker.slug}`}>Profilimi gör</Link>
            </Button>
            <Button asChild>
              <Link href="/isci/profil">Profili düzenle</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              {"hint" in c && c.hint ? (
                <p className="mt-0.5 text-xs text-muted-foreground/80">{c.hint}</p>
              ) : null}
            </div>
          ))}
        </div>

        {worker.profile_completion < 100 && (
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="font-semibold text-primary">Profilini tamamla</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Eksik alanları doldurarak firmaların seni daha kolay bulmasını
              sağla.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${worker.profile_completion}%` }}
              />
            </div>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/isci/profil">Devam et</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <QuickLink href="/isci/mesajlar" title="Mesajlar" desc="Firmalarla sohbet et" />
          <QuickLink href="/isci/bildirimler" title="Bildirimler" desc="Yeni aktiviteler" />
          <QuickLink href={`/isci/${worker.slug}`} title="Paylaş" desc="Profil linkini kopyala" />
        </div>
      </main>
    </>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}

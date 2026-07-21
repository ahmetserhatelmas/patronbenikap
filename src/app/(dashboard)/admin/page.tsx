import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Building2,
  MessageSquare,
  Eye,
  Briefcase,
  Wallet,
  FileText,
  Tags,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/actions/auth";
import { getAdminStats } from "@/lib/actions/admin";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");
  if (profile.role !== "admin") redirect("/");

  const stats = await getAdminStats();

  const cards = [
    {
      label: "İşçiler",
      value: formatNumber(stats?.workers ?? 0),
      icon: Users,
      href: "/admin/kullanicilar",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Firmalar",
      value: formatNumber(stats?.companies ?? 0),
      icon: Building2,
      href: "/admin/firmalar",
      color: "text-brand-orange bg-brand-orange/10",
    },
    {
      label: "Mesajlar",
      value: formatNumber(stats?.messages ?? 0),
      icon: MessageSquare,
      href: "/admin",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Profil görüntülenme",
      value: formatNumber(stats?.views ?? 0),
      icon: Eye,
      href: "/admin",
      color: "text-brand-orange bg-brand-orange/10",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Admin Paneli
        </h1>
        <p className="mt-1 text-muted-foreground">Site yönetimi ve istatistikler</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <AdminLink
            href="/admin/ilanlar"
            icon={FileText}
            title="İlanlar"
            desc="Profilleri gör, pasife al veya sil"
          />
          <AdminLink
            href="/admin/kullanicilar"
            icon={Users}
            title="Kullanıcılar"
            desc="İşçi hesaplarını yönet"
          />
          <AdminLink
            href="/admin/firmalar"
            icon={Building2}
            title="Firmalar"
            desc="Onayla ve yönet"
          />
          <AdminLink
            href="/admin/meslekler"
            icon={Briefcase}
            title="Meslekler"
            desc="Meslek listesini düzenle"
          />
          <AdminLink
            href="/admin/kategoriler"
            icon={Tags}
            title="Kategoriler"
            desc="Meslek kategorilerini yönet"
          />
          <AdminLink
            href="/admin/maaslar"
            icon={Wallet}
            title="Maaş verileri"
            desc="Ortalama maaşları güncelle"
          />
        </div>
      </main>
  );
}

function AdminLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30"
    >
      <Icon className="mt-0.5 h-5 w-5 text-primary" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}

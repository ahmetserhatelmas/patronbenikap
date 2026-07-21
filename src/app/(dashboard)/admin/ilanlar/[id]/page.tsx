import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/actions/auth";
import {
  deleteListing,
  getAdminListing,
  toggleListingVisibility,
} from "@/lib/actions/admin";
import {
  AVAILABILITY_LABELS,
  EDUCATION_LABELS,
  MILITARY_LABELS,
} from "@/lib/constants";
import {
  formatNumber,
  formatSalary,
  formatTrPhoneDisplay,
} from "@/lib/utils";

export const metadata = { title: "İlan Detayı — Admin" };

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const worker = await getAdminListing(id);
  if (!worker) notFound();

  const owner = worker.profile as unknown as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    avatar_url: string | null;
  } | null;

  const skills = (worker.skills ?? []) as {
    id: string;
    skill?: { name: string } | null;
  }[];
  const certificates = (worker.certificates ?? []) as {
    id: string;
    name: string;
    issuer: string | null;
  }[];
  const portfolio = (worker.portfolio_images ?? []) as {
    id: string;
    image_url: string;
    caption: string | null;
  }[];

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Ad Soyad", value: `${worker.first_name} ${worker.last_name}` },
    { label: "Slug", value: worker.slug },
    { label: "Meslek", value: worker.profession?.name ?? "—" },
    {
      label: "Konum",
      value: [worker.city, worker.district].filter(Boolean).join(" / ") || "—",
    },
    { label: "Yaş", value: worker.age ?? "—" },
    { label: "Deneyim", value: `${worker.experience_years} yıl` },
    {
      label: "Eğitim",
      value: worker.education
        ? EDUCATION_LABELS[worker.education] ?? worker.education
        : "—",
    },
    {
      label: "Askerlik",
      value: worker.military_status
        ? MILITARY_LABELS[worker.military_status] ?? worker.military_status
        : "—",
    },
    {
      label: "Müsaitlik",
      value: worker.availability
        ? AVAILABILITY_LABELS[worker.availability] ?? worker.availability
        : "—",
    },
    {
      label: "Beklenen maaş",
      value: formatSalary(worker.expected_salary),
    },
    {
      label: "Çalışıyor mu",
      value: worker.currently_working ? "Evet" : "Hayır",
    },
    {
      label: "Vardiya",
      value: worker.shift_work ? "Evet" : "Hayır",
    },
    {
      label: "Diller",
      value: worker.languages?.length ? worker.languages.join(", ") : "—",
    },
    {
      label: "Ehliyet",
      value: worker.driver_license?.length
        ? worker.driver_license.join(", ")
        : "—",
    },
    {
      label: "Uzmanlıklar",
      value: worker.specializations?.length
        ? worker.specializations.join(", ")
        : "—",
    },
    {
      label: "Telefon",
      value: worker.phone ? formatTrPhoneDisplay(worker.phone) : "—",
    },
    {
      label: "WhatsApp",
      value: worker.whatsapp ? formatTrPhoneDisplay(worker.whatsapp) : "—",
    },
    { label: "E-posta (profil)", value: worker.email || "—" },
    { label: "Hesap e-posta", value: owner?.email || "—" },
    {
      label: "Hesap durumu",
      value: owner?.is_active ? "Aktif" : "Pasif",
    },
    {
      label: "Profil tamamlanma",
      value: `%${worker.profile_completion}`,
    },
    {
      label: "Görüntülenme",
      value: formatNumber(worker.view_count ?? 0),
    },
    {
      label: "Favori",
      value: formatNumber(worker.favorite_count ?? 0),
    },
    {
      label: "Oluşturulma",
      value: new Date(worker.created_at).toLocaleString("tr-TR"),
    },
    {
      label: "Güncelleme",
      value: new Date(worker.updated_at).toLocaleString("tr-TR"),
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/admin/ilanlar"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          İlanlara dön
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                {worker.first_name} {worker.last_name}
              </h1>
              {worker.is_visible ? (
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                  Yayında
                </Badge>
              ) : (
                <Badge variant="secondary">Pasif</Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {worker.profession?.name ?? "Meslek yok"}
              {worker.city ? ` · ${worker.city}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/isci/${worker.slug}`} target="_blank">
                Genel profili aç
              </Link>
            </Button>
            <form
              action={async () => {
                "use server";
                await toggleListingVisibility(worker.id);
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                {worker.is_visible ? "Pasife al" : "Yayına al"}
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteListing(worker.id);
                redirect("/admin/ilanlar");
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                Sil
              </Button>
            </form>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
            Tüm alanlar
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-medium break-words">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Hakkımda
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {worker.about_me || "—"}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Yetenekler
          </h2>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s.id} variant="secondary">
                  {s.skill?.name ?? "—"}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Sertifikalar
          </h2>
          {certificates.length ? (
            <ul className="space-y-2 text-sm">
              {certificates.map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.name}</span>
                  {c.issuer ? (
                    <span className="text-muted-foreground"> — {c.issuer}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>

        {worker.cv_url && (
          <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
              CV
            </h2>
            <Button asChild variant="outline" size="sm">
              <a href={worker.cv_url} target="_blank" rel="noopener noreferrer">
                CV dosyasını aç
              </a>
            </Button>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Portfolyo
          </h2>
          {portfolio.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {portfolio.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-xl border">
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={img.image_url}
                      alt={img.caption || "Portfolyo"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>
      </main>
  );
}

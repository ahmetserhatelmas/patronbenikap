import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/actions/auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  approveCompany,
  deleteCompanyAccount,
  getAdminCompany,
  revokeCompanyVerification,
  toggleCompanyActive,
} from "@/lib/actions/admin";
import { formatNumber, formatTrPhoneDisplay } from "@/lib/utils";
import type { ReactNode } from "react";

export const metadata = { title: "Firma Detayı — Admin" };

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const company = await getAdminCompany(id);
  if (!company) notFound();

  const owner = company.profile as unknown as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    avatar_url: string | null;
    last_seen_at: string | null;
  } | null;

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Firma adı", value: company.name },
    { label: "Slug", value: company.slug },
    { label: "Sektör", value: company.sector || "—" },
    { label: "Şehir", value: company.city || "—" },
    {
      label: "Telefon",
      value: company.phone ? formatTrPhoneDisplay(company.phone) : "—",
    },
    {
      label: "Web sitesi",
      value: company.website ? (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {company.website}
        </a>
      ) : (
        "—"
      ),
    },
    { label: "Çalışan sayısı", value: company.employee_count || "—" },
    {
      label: "Doğrulama",
      value: company.is_verified ? "Doğrulandı" : "Bekliyor",
    },
    {
      label: "Yetkili ad",
      value: owner?.full_name || "—",
    },
    { label: "Hesap e-posta", value: owner?.email || "—" },
    {
      label: "Hesap telefon",
      value: owner?.phone ? formatTrPhoneDisplay(owner.phone) : "—",
    },
    {
      label: "Hesap durumu",
      value: owner?.is_active ? "Aktif" : "Pasif",
    },
    {
      label: "Favori işçi",
      value: formatNumber(company.stats.favorites),
    },
    {
      label: "Konuşma",
      value: formatNumber(company.stats.conversations),
    },
    {
      label: "Profil görüntüleme",
      value: formatNumber(company.stats.profileViews),
    },
    {
      label: "Kayıt",
      value: new Date(company.created_at).toLocaleString("tr-TR"),
    },
    {
      label: "Güncelleme",
      value: new Date(company.updated_at).toLocaleString("tr-TR"),
    },
    {
      label: "Son görülme",
      value: owner?.last_seen_at
        ? new Date(owner.last_seen_at).toLocaleString("tr-TR")
        : "—",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/admin/firmalar"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Firmalara dön
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {company.logo_url ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                  {company.name}
                </h1>
                {company.is_verified && (
                  <BadgeCheck className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="mt-1 text-muted-foreground">
                {[company.sector, company.city].filter(Boolean).join(" · ") ||
                  "—"}
              </p>
              {company.is_verified ? (
                <Badge className="mt-2 bg-primary/15 text-primary">
                  Doğrulandı
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2">
                  Bekliyor
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {company.is_verified ? (
              <form
                action={async () => {
                  "use server";
                  await revokeCompanyVerification(company.id);
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Onayı kaldır
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await approveCompany(company.id);
                }}
              >
                <Button type="submit" size="sm">
                  Onayla
                </Button>
              </form>
            )}
            {owner && owner.id !== profile.id && (
              <>
                <form
                  action={async () => {
                    "use server";
                    await toggleCompanyActive(company.id);
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    {owner.is_active ? "Pasifleştir" : "Aktifleştir"}
                  </Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    const result = await deleteCompanyAccount(company.id);
                    if (!result.error) redirect("/admin/firmalar");
                  }}
                >
                  <ConfirmSubmitButton
                    label="Hesabı sil"
                    confirmMessage={`${company.name} hesabını kalıcı silmek istediğine emin misin? Bu işlem geri alınamaz.`}
                  />
                </form>
              </>
            )}
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
                <dd className="mt-0.5 text-sm font-medium break-all">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Açıklama
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {company.description || "—"}
          </p>
        </section>
      </main>
  );
}

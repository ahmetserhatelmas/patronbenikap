import { Suspense } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/company/search-filters";
import { WorkerCard } from "@/components/worker/worker-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canCompanySearchWorkers,
  searchWorkers,
} from "@/lib/actions/profiles";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilityStatus, EducationLevel } from "@/types/database";

export const metadata = {
  title: "İşçi Ara",
  description: "Şehir, meslek, deneyim ve daha fazlasına göre işçi ara.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const allowed = await canCompanySearchWorkers();
  if (!allowed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            İşçi Ara henüz aktif değil
          </h1>
          <p className="mt-3 text-muted-foreground">
            Firma hesabın admin onayından sonra İşçi Ara açılır. Profilinde
            MERSİS no kayıtlı olduğundan emin ol; onay sürecini bekleyebilirsin.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/firma/panel">Panele dön</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/firma/profil">Profili kontrol et</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const supabase = await createClient();
  const [professionsResult, searchResult] = await Promise.all([
    supabase.from("professions").select("*").order("sort_order"),
    searchWorkers({
      q: params.q,
      city: params.city,
      profession: params.profession,
      experience_min: params.experience_min
        ? Number(params.experience_min)
        : undefined,
      salary_max: params.salary_max ? Number(params.salary_max) : undefined,
      availability: params.availability as AvailabilityStatus | undefined,
      education: params.education as EducationLevel | undefined,
      shift_work: params.shift_work === "1" ? true : undefined,
      sort:
        (params.sort as
          | "newest"
          | "experience"
          | "salary_asc"
          | "salary_desc") || "newest",
      page,
      limit: 12,
    }).catch(() => ({ workers: [], total: 0, error: null })),
  ]);

  const professions = professionsResult.data ?? [];
  const { workers, total } = searchResult;

  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            İşçi Ara
          </h1>
          <p className="mt-1 text-muted-foreground">
            {total > 0
              ? `${total} profil bulundu`
              : "Filtrelere göre ara veya tümünü gör"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <SearchFilters professions={professions} />
          </Suspense>

          <div>
            {workers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
                <p className="font-medium">Sonuç bulunamadı</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Filtreleri gevşetmeyi dene
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {workers.map((w) => (
                  <WorkerCard key={w.id} worker={w} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <Link
                      href={`/firma/ara?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>).toString()}`}
                    >
                      Önceki
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" asChild>
                    <Link
                      href={`/firma/ara?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>).toString()}`}
                    >
                      Sonraki
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

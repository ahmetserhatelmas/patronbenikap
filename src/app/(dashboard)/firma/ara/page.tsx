import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/company/search-filters";
import { WorkerCard } from "@/components/worker/worker-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchWorkers } from "@/lib/actions/profiles";
import { getCurrentProfile } from "@/lib/actions/auth";
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
  const params = await searchParams;
  const profile = await getCurrentProfile();

  let professions: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    icon: string | null;
    is_trending: boolean;
    sort_order: number;
  }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("professions")
      .select("*")
      .order("sort_order");
    professions = data ?? [];
  } catch {
    professions = [];
  }

  const page = Number(params.page) || 1;
  const { workers, total } = await searchWorkers({
    q: params.q,
    city: params.city,
    profession: params.profession,
    experience_min: params.experience_min
      ? Number(params.experience_min)
      : undefined,
    salary_max: params.salary_max ? Number(params.salary_max) : undefined,
    availability: params.availability as AvailabilityStatus | undefined,
    education: params.education as EducationLevel | undefined,
    sort: (params.sort as "newest" | "experience" | "salary_asc" | "salary_desc") || "newest",
    page,
    limit: 12,
  }).catch(() => ({ workers: [], total: 0, error: null }));

  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <>
      <Header profile={profile} />
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

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { WorkerCard } from "@/components/worker/worker-card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Favoriler" };

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!company) redirect("/firma/profil");

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `*, worker:workers(*, profession:professions(*), skills:worker_skills(id, level, skill:skills(*)), profile:profiles(avatar_url))`
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Favoriler
        </h1>
        <p className="mt-1 text-muted-foreground">
          Kaydettiğin işçiler burada.
        </p>

        {!favorites?.length ? (
          <div className="mt-12 rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">Henüz favori yok</p>
            <p className="mt-1 text-sm text-muted-foreground">
              İşçi ara ve beğendiklerini kaydet
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => {
              const w = f.worker as unknown as Parameters<
                typeof WorkerCard
              >[0]["worker"];
              if (!w) return null;
              return <WorkerCard key={f.id} worker={w} />;
            })}
          </div>
        )}
      </main>
    </>
  );
}

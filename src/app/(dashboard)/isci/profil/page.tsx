import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { WorkerProfileForm } from "@/components/worker/profile-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Profilimi Düzenle" };

export default async function WorkerProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();

  const [{ data: worker }, { data: professions }, { data: skills }] =
    await Promise.all([
      supabase
        .from("workers")
        .select("*, skills:worker_skills(id, skill_id, level, skill:skills(*))")
        .eq("profile_id", profile.id)
        .maybeSingle(),
      supabase.from("professions").select("*").order("sort_order"),
      supabase.from("skills").select("*").order("name"),
    ]);

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          {worker ? "Profilini düzenle" : "Profilini oluştur"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Birkaç dakika yeter. Firmalar seni bu bilgilerle bulacak.
        </p>
        <div className="mt-8">
          <WorkerProfileForm
            worker={worker}
            professions={professions ?? []}
            skills={skills ?? []}
            avatarUrl={profile.avatar_url}
          />
        </div>
      </main>
    </>
  );
}

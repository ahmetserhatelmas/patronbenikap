import { redirect } from "next/navigation";
import { ProfessionsManager } from "@/components/admin/professions-manager";
import { createServiceClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/actions/auth";
import type { Profession, ProfessionCategory } from "@/types/database";

export const metadata = { title: "Meslekler — Admin" };

export default async function AdminProfessionsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const admin = createServiceClient();
  const [{ data: professions }, { data: categories }] = await Promise.all([
    admin
      .from("professions")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    admin
      .from("profession_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(500),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Meslekler
        </h1>
        <p className="mt-1 text-muted-foreground">
          Kategori seçimi zorunlu — {categories?.length ?? 0} kategori
        </p>

        <ProfessionsManager
          professions={(professions ?? []) as Profession[]}
          categories={(categories ?? []) as ProfessionCategory[]}
        />
      </main>
  );
}

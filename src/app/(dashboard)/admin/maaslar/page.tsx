import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  SalaryRangesManager,
  type SalaryRow,
} from "@/components/admin/salary-ranges-manager";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Maaşlar — Admin" };

export default async function AdminSalariesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const [{ data: salaries }, { data: professions }] = await Promise.all([
    supabase
      .from("salary_ranges")
      .select("id, profession_id, min_salary, avg_salary, max_salary, profession:professions(name)")
      .order("updated_at", { ascending: false }),
    supabase.from("professions").select("id, name, category").order("name"),
  ]);

  const rows: SalaryRow[] = (salaries ?? []).map((s) => ({
    id: s.id,
    profession_id: s.profession_id,
    min_salary: s.min_salary,
    avg_salary: s.avg_salary,
    max_salary: s.max_salary,
    profession: s.profession as unknown as { name: string } | null,
  }));

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Maaş verileri
        </h1>
        <p className="mt-1 text-muted-foreground">
          Profil formunda gösterilen ortalama maaşlar — düzenle veya sil
        </p>

        <SalaryRangesManager
          salaries={rows}
          professions={professions ?? []}
        />
      </main>
    </>
  );
}

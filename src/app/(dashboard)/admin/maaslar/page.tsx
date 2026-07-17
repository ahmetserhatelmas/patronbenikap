import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { upsertSalaryRange } from "@/lib/actions/admin";
import { formatSalary } from "@/lib/utils";

export const metadata = { title: "Maaşlar — Admin" };

export default async function AdminSalariesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const [{ data: salaries }, { data: professions }] = await Promise.all([
    supabase
      .from("salary_ranges")
      .select("*, profession:professions(name)")
      .order("updated_at", { ascending: false }),
    supabase.from("professions").select("id, name").order("name"),
  ]);

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Maaş verileri
        </h1>
        <p className="mt-1 text-muted-foreground">
          Profil formunda gösterilen ortalama maaşlar
        </p>

        <form
          action={async (fd) => {
            "use server";
            await upsertSalaryRange(fd);
          }}
          className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
        >
          <div className="space-y-2">
            <Label>Meslek</Label>
            <Select name="profession_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {professions?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="min_salary">Min</Label>
              <Input id="min_salary" name="min_salary" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg_salary">Ortalama</Label>
              <Input id="avg_salary" name="avg_salary" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_salary">Max</Label>
              <Input id="max_salary" name="max_salary" type="number" />
            </div>
          </div>
          <Button type="submit">Kaydet</Button>
        </form>

        <ul className="mt-8 space-y-2">
          {salaries?.map((s) => {
            const prof = s.profession as unknown as { name: string };
            return (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
              >
                <p className="font-medium">{prof?.name}</p>
                <p className="text-sm text-primary font-semibold">
                  {formatSalary(s.avg_salary)}
                </p>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

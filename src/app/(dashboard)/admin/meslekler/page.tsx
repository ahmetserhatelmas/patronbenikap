import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { upsertProfession } from "@/lib/actions/admin";

export const metadata = { title: "Meslekler — Admin" };

export default async function AdminProfessionsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: professions } = await supabase
    .from("professions")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Meslekler
        </h1>

        <form
          action={async (fd) => {
            "use server";
            await upsertProfession(fd);
          }}
          className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
        >
          <h2 className="font-semibold">Yeni meslek ekle</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Ad</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_trending" value="true" />
            Trend meslek
          </label>
          <Button type="submit">Ekle</Button>
        </form>

        <ul className="mt-8 space-y-2">
          {professions?.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              {p.is_trending && (
                <Badge className="bg-brand-orange/15 text-brand-orange">
                  Trend
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

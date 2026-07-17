import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { approveCompany } from "@/lib/actions/admin";

export const metadata = { title: "Firmalar — Admin" };

export default async function AdminCompaniesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Firmalar
        </h1>
        <div className="mt-8 grid gap-4">
          {companies?.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{c.name}</h2>
                  {c.is_verified && (
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.sector} · {c.city}
                </p>
                {c.is_verified ? (
                  <Badge className="mt-2 bg-primary/15 text-primary">
                    Doğrulandı
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">
                    Bekliyor
                  </Badge>
                )}
              </div>
              {!c.is_verified && (
                <form
                  action={async () => {
                    "use server";
                    await approveCompany(c.id);
                  }}
                >
                  <Button type="submit">Onayla</Button>
                </form>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

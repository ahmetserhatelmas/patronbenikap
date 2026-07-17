import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { toggleUserActive } from "@/lib/actions/admin";

export const metadata = { title: "Kullanıcılar — Admin" };

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Kullanıcılar
        </h1>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="text-primary">Aktif</span>
                    ) : (
                      <span className="text-destructive">Pasif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleUserActive(u.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        {u.is_active ? "Pasifleştir" : "Aktifleştir"}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

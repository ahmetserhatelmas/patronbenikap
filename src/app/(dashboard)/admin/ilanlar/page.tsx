import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/actions/auth";
import {
  deleteListing,
  getAdminListings,
  toggleListingVisibility,
} from "@/lib/actions/admin";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "İlanlar — Admin" };

export default async function AdminListingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const listings = (await getAdminListings()) ?? [];

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              İlanlar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Yayınlanan işçi profilleri — pasife al veya sil
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatNumber(listings.length)} kayıt
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">İsim</th>
                <th className="px-4 py-3 font-medium">Meslek</th>
                <th className="px-4 py-3 font-medium">Şehir</th>
                <th className="px-4 py-3 font-medium">Görüntülenme</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Henüz ilan yok
                  </td>
                </tr>
              ) : (
                listings.map((w) => {
                  const profession = w.profession as unknown as {
                    name: string;
                  } | null;
                  const owner = w.profile as unknown as {
                    email: string;
                    is_active: boolean;
                  } | null;

                  return (
                    <tr key={w.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            href={`/admin/ilanlar/${w.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {w.first_name} {w.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {owner?.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{profession?.name ?? "—"}</td>
                      <td className="px-4 py-3">{w.city ?? "—"}</td>
                      <td className="px-4 py-3">
                        {formatNumber(w.view_count ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        {w.is_visible ? (
                          <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                            Yayında
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/admin/ilanlar/${w.id}`}>Detay</Link>
                          </Button>
                          <form
                            action={async () => {
                              "use server";
                              await toggleListingVisibility(w.id);
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">
                              {w.is_visible ? "Pasife al" : "Yayına al"}
                            </Button>
                          </form>
                          <form
                            action={async () => {
                              "use server";
                              await deleteListing(w.id);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="destructive"
                              size="sm"
                            >
                              Sil
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

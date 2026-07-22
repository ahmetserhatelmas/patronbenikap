import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { createServiceClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/actions/auth";
import {
  approveCompany,
  deleteCompanyAccount,
  revokeCompanyVerification,
  toggleCompanyActive,
} from "@/lib/actions/admin";

export const metadata = { title: "Firmalar — Admin" };

export default async function AdminCompaniesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const admin = createServiceClient();
  const { data: companies } = await admin
    .from("companies")
    .select("*, profile:profiles(id, email, is_active)")
    .order("created_at", { ascending: false })
    .limit(200);

  const pending = companies?.filter((c) => !c.is_verified).length ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        Firmalar
      </h1>
      <p className="mt-1 text-muted-foreground">
        Firma hesaplarını doğrula, pasifleştir veya sil. Onaylanan firmalarda
        mavi tik görünür. {pending > 0 ? `${pending} bekleyen var.` : "Bekleyen yok."}
      </p>

      <div className="mt-8 grid gap-4">
        {!companies?.length ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Henüz firma yok
          </p>
        ) : (
          companies.map((c) => {
            const owner = c.profile as unknown as {
              id: string;
              email: string;
              is_active: boolean;
            } | null;
            const isSelf = owner?.id === profile.id;
            return (
              <div
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/firmalar/${c.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.is_verified && (
                      <BadgeCheck className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[c.sector, c.city].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {owner?.email && (
                    <p className="text-xs text-muted-foreground">
                      {owner.email}
                    </p>
                  )}
                  {c.mersis_no && (
                    <p className="text-xs text-muted-foreground">
                      MERSİS: {c.mersis_no}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.is_verified ? (
                      <Badge className="bg-primary/15 text-primary">
                        Doğrulandı
                      </Badge>
                    ) : (
                      <Badge variant="outline">Bekliyor</Badge>
                    )}
                    {owner && !owner.is_active ? (
                      <Badge variant="destructive">Pasif</Badge>
                    ) : (
                      <Badge variant="secondary">Aktif</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/firmalar/${c.id}`}>Detay</Link>
                  </Button>
                  {c.is_verified ? (
                    <form
                      action={async () => {
                        "use server";
                        await revokeCompanyVerification(c.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Onayı kaldır
                      </Button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await approveCompany(c.id);
                      }}
                    >
                      <Button type="submit" size="sm">
                        Onayla
                      </Button>
                    </form>
                  )}
                  {!isSelf && owner && (
                    <form
                      action={async () => {
                        "use server";
                        await toggleCompanyActive(c.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        {owner.is_active ? "Pasifleştir" : "Aktifleştir"}
                      </Button>
                    </form>
                  )}
                  {!isSelf && owner && (
                    <form
                      action={async () => {
                        "use server";
                        await deleteCompanyAccount(c.id);
                      }}
                    >
                      <ConfirmSubmitButton
                        label="Sil"
                        confirmMessage={`${c.name} (${owner.email}) hesabını kalıcı silmek istediğine emin misin? Bu işlem geri alınamaz.`}
                      />
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

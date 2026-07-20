import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ProfessionCategoriesManager } from "@/components/admin/profession-categories-manager";
import { createServiceClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/actions/auth";
import { syncProfessionCategories } from "@/lib/actions/admin";
import type { ProfessionCategory } from "@/types/database";

export const metadata = { title: "Kategoriler — Admin" };

export default async function AdminCategoriesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  const synced = await syncProfessionCategories();
  let categories = (synced.categories ?? []) as ProfessionCategory[];
  let error = synced.error;

  if (!error && categories.length === 0) {
    try {
      const admin = createServiceClient();
      const { data, error: listError } = await admin
        .from("profession_categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
        .limit(500);
      categories = (data ?? []) as ProfessionCategory[];
      if (listError) error = listError.message;
    } catch {
      error = "Kategori tablosu okunamadı";
    }
  }

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/admin/meslekler"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Mesleklere dön
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Kategoriler
        </h1>
        <p className="mt-1 text-muted-foreground">
          Meslek eklerken buradaki kategorilerden seçilir · {categories.length}{" "}
          kategori
        </p>

        {error && !categories.length ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Kategori tablosu henüz yok. Supabase SQL Editor’de{" "}
            <code className="font-mono">007_profession_categories.sql</code> ve{" "}
            <code className="font-mono">008_sync_profession_category_order.sql</code>{" "}
            dosyalarını çalıştır. ({error})
          </div>
        ) : (
          <ProfessionCategoriesManager categories={categories} />
        )}
      </main>
    </>
  );
}

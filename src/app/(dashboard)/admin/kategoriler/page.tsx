import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfessionCategoriesManager } from "@/components/admin/profession-categories-manager";
import { createServiceClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/actions/auth";
import type { ProfessionCategory } from "@/types/database";

export const metadata = { title: "Kategoriler — Admin" };

export default async function AdminCategoriesPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  let categories: ProfessionCategory[] = [];
  let error: string | undefined;

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

  return (
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
        Meslek formunda zorunlu kategori listesi
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <ProfessionCategoriesManager categories={categories} />
      )}
    </main>
  );
}

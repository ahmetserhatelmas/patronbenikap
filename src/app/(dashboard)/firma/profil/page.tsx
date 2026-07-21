import { redirect } from "next/navigation";
import { CompanyProfileForm } from "@/components/company/profile-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Firma Profili" };

export default async function CompanyProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          {company ? "Firma profilini düzenle" : "Firma profilini oluştur"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Firmamı tanıt, işçiler seni güvenilir görsün.
        </p>
        <div className="mt-8">
          <CompanyProfileForm company={company} />
        </div>
      </main>
  );
}

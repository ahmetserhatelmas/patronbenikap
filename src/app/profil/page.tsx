import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Profilim" };

export default async function MyProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris?next=/profil");

  if (profile.role === "company") redirect("/firma/profil");
  if (profile.role === "admin") redirect("/admin");

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("workers")
    .select("slug")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!worker) redirect("/isci/profil");

  redirect(`/isci/${worker.slug}`);
}

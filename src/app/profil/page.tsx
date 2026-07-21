import { redirect } from "next/navigation";
import { getCurrentProfile, getProfileNavHref } from "@/lib/actions/auth";

export const metadata = { title: "Profilim" };

/** Fallback if middleware cookie redirect missed — still one server hop */
export default async function MyProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris?next=/profil");
  redirect(await getProfileNavHref(profile));
}

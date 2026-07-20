import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { BrandLogo } from "@/components/shared/brand-logo";

export const metadata = {
  title: "Şifre Yenile",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mesh px-4 py-12">
      <Link href="/" className="mb-8">
        <BrandLogo size={44} />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-primary/5">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold">
          Yeni şifre belirle
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          E-postadaki linkle geldin. Yeni şifreni yaz.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}

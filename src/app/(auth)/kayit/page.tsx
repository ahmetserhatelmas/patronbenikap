import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Kayıt Ol",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mesh px-4 py-12">
      <Link href="/" className="mb-8">
        <BrandLogo size={44} />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-primary/5">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold">
          Hesap oluştur
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Birkaç dakikada profilini tamamla.
        </p>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

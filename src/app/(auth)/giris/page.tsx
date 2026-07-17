import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/shared/brand-logo";

export const metadata = {
  title: "Giriş Yap",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mesh px-4 py-12">
      <Link href="/" className="mb-8">
        <BrandLogo size={44} />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-primary/5">
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold">
          Hoş geldin
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Hesabına giriş yap ve devam et.
        </p>
        <LoginForm next={next || "/"} />
      </div>
    </div>
  );
}

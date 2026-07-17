import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

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
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md">
          PB
        </span>
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Patron Beni Kap
        </span>
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

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/actions/auth";

export async function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile().catch(() => null);

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted-foreground">Yasal</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Son güncelleme: {updated}
        </p>
        <article className="prose-legal mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </article>
        <p className="mt-12 text-sm text-muted-foreground">
          Sorularınız için:{" "}
          <a
            href="mailto:merhaba@patronbenikap.com"
            className="font-medium text-primary hover:underline"
          >
            merhaba@patronbenikap.com
          </a>
          {" · "}
          <Link href="/gizlilik" className="hover:underline">
            Gizlilik
          </Link>
          {" · "}
          <Link href="/aydinlatma-metni" className="hover:underline">
            Aydınlatma
          </Link>
          {" · "}
          <Link href="/kullanim-kosullari" className="hover:underline">
            Kullanım Koşulları
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

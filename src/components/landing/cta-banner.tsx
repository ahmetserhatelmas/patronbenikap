import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-brand-orange px-8 py-16 text-center text-white shadow-xl shadow-primary/30 sm:px-16">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              Hazır mısın?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/90">
              Profilini oluştur, firmalar seni bulsun. Ücretsiz, hızlı, modern.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 bg-white text-primary hover:bg-white/90 shadow-lg"
              asChild
            >
              <Link href="/kayit">
                Hemen Başla
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

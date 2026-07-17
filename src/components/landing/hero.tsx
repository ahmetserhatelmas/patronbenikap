import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed işe alım / el sıkışma fotoğrafı */}
      <Image
        src="/hero-suit-handshake.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Okunabilirlik: fotoğrafı soft yıkayıp marka renklerini taşı */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/82 to-white/90 dark:from-background/90 dark:via-background/85 dark:to-background/92" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-orange/15" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="mb-8 animate-fade-up">
          <Image
            src="/logo.png"
            alt="Patron Beni Kap"
            width={120}
            height={120}
            className="mx-auto drop-shadow-lg"
            priority
          />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange backdrop-blur-sm animate-fade-up [animation-delay:80ms]">
          <UserRound className="h-3.5 w-3.5" />
          İşçiler profil yayınlar · Firmalar bulur
        </div>

        <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up [animation-delay:120ms]">
          Sen işi değil,{" "}
          <span className="bg-gradient-to-r from-primary to-brand-orange bg-clip-text text-transparent">
            iş seni bulsun.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-balance sm:text-xl animate-fade-up [animation-delay:200ms]">
          Burada iş ilanı aramazsın.{" "}
          <strong className="font-semibold text-foreground">
            Profilini yayınlarsın
          </strong>
          , firmalar seni keşfeder ve sana ulaşır.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up [animation-delay:300ms]">
          <Button
            size="lg"
            className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
            asChild
          >
            <Link href="/kayit?role=worker">
              Profilimi Yayınla
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base border-brand-orange/40 bg-white/60 text-brand-orange backdrop-blur-sm hover:bg-brand-orange/10 hover:text-brand-orange dark:bg-background/50"
            asChild
          >
            <Link href="/kayit?role=company">
              <Search className="mr-1 h-4 w-4" />
              Firma olarak işçi ara
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground animate-fade-up [animation-delay:350ms]">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
          5 dakikada profil · Ücretsiz · Firma teklifleri sana gelsin
        </p>
      </div>
    </section>
  );
}

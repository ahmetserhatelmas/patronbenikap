import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-mesh">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQ0IzNzEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-fade-up">
          <Sparkles className="h-3.5 w-3.5" />
          Yeni nesil iş platformu
        </div>

        <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up [animation-delay:100ms]">
          İşi değil,{" "}
          <span className="bg-gradient-to-r from-primary to-brand-orange bg-clip-text text-transparent">
            iş seni bulsun.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance sm:text-xl animate-fade-up [animation-delay:200ms]">
          Kendini tanıt. Profilini oluştur. Firmalar seni bulsun.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up [animation-delay:300ms]">
          <Button
            size="lg"
            className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
            asChild
          >
            <Link href="/kayit?role=worker">
              Profil Oluştur
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange"
            asChild
          >
            <Link href="/kayit?role=company">
              <Search className="mr-1 h-4 w-4" />
              İşçi Ara
            </Link>
          </Button>
        </div>

        <div className="mt-16 w-full max-w-3xl animate-fade-up [animation-delay:450ms]">
          <div className="relative mx-auto aspect-[16/7] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-brand-orange/20" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="grid w-full max-w-lg gap-3 sm:grid-cols-3">
                {["Profil", "Uzmanlık", "Teklif"].map((label, i) => (
                  <div
                    key={label}
                    className="glass rounded-xl p-4 text-left shadow-sm"
                    style={{ animationDelay: `${600 + i * 100}ms` }}
                  >
                    <div
                      className={`mb-2 h-2 w-8 rounded-full ${i === 1 ? "bg-brand-orange" : "bg-primary"}`}
                    />
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {i === 0 && "Dakikalar içinde"}
                      {i === 1 && "Yeteneklerini ekle"}
                      {i === 2 && "Firmalar ulaşsın"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

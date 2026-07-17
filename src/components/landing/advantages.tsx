import { Check, Smartphone, Zap, Gift, FileText, Gauge } from "lucide-react";

const ADVANTAGES = [
  { icon: Gauge, title: "Kolay profil", desc: "Sade form, net alanlar" },
  { icon: FileText, title: "Karmaşık CV yok", desc: "İstersen yükle, zorunlu değil" },
  { icon: Smartphone, title: "Mobil uyumlu", desc: "Her cihazda akıcı" },
  { icon: Gift, title: "Ücretsiz", desc: "Temel özellikler bedava" },
  { icon: Zap, title: "Hızlı", desc: "5 dakikada yayında" },
  { icon: Check, title: "Doğrudan iletişim", desc: "WhatsApp & mesaj" },
];

export function Advantages() {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Neden Patron Beni Kap?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Daha az form, daha çok fırsat.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

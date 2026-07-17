import { UserPlus, Wrench, Handshake } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Profilini oluştur",
    desc: "Adın, mesleğin ve birkaç bilgi. Karmaşık CV yok — 5 dakikada hazırsın.",
    accent: "bg-primary/15 text-primary",
  },
  {
    icon: Wrench,
    title: "Uzmanlığını ekle",
    desc: "Yetenekler, sertifikalar ve portföy. Firmalar seni net görsün.",
    accent: "bg-brand-orange/15 text-brand-orange",
  },
  {
    icon: Handshake,
    title: "Firmalardan teklif al",
    desc: "İlgilenen firmalar sana mesaj atsın. Sen seç, sen karar ver.",
    accent: "bg-primary/15 text-primary",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Nasıl çalışır?
          </h2>
          <p className="mt-3 text-muted-foreground">
            İşçi olarak profil yayınla — firmalar seni bulsun. Üç adım.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="absolute right-6 top-6 font-[family-name:var(--font-display)] text-5xl font-bold text-muted/80">
                {i + 1}
              </span>
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.accent}`}
              >
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Kullanıcılar ne diyor?
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="relative rounded-2xl border border-border/60 bg-card p-8 shadow-sm"
            >
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.text}&rdquo;
              </p>
              <footer className="mt-6">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.role} · {t.city}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

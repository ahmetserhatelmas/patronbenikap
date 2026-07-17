import { formatNumber } from "@/lib/utils";

interface StatsSectionProps {
  workers?: number;
  companies?: number;
  views?: number;
}

export function StatsSection({
  workers = 20000,
  companies = 500,
  views = 100000,
}: StatsSectionProps) {
  const stats = [
    { value: workers, suffix: "+", label: "Aktif İşçi", color: "text-primary" },
    { value: companies, suffix: "+", label: "Firma", color: "text-brand-orange" },
    { value: views, suffix: "+", label: "Görüntülenme", color: "text-primary" },
  ];

  return (
    <section className="border-y border-border/60 bg-primary/5 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-3 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className={`font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl ${stat.color}`}
            >
              {formatNumber(stat.value)}
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

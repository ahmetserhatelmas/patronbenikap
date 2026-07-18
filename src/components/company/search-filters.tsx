"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfessionSelectOptions } from "@/components/shared/profession-select-options";
import {
  CITIES,
  EDUCATION_LABELS,
  AVAILABILITY_LABELS,
  POPULAR_CITIES,
} from "@/lib/constants";
import type { Profession } from "@/types/database";

interface SearchFiltersProps {
  professions: Profession[];
}

export function SearchFilters({ professions }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clear = () => {
    startTransition(() => router.push(pathname));
  };

  return (
    <aside className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filtrele</h2>
        <Button variant="ghost" size="sm" onClick={clear} className="h-8 text-xs">
          <X className="mr-1 h-3 w-3" />
          Temizle
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Ara</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="İsim veya açıklama..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              const t = setTimeout(() => update("q", v), 400);
              return () => clearTimeout(t);
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Şehir</Label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {POPULAR_CITIES.slice(0, 4).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update("city", c)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                searchParams.get("city") === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-primary/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Select
          value={searchParams.get("city") ?? ""}
          onValueChange={(v) => update("city", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tüm şehirler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Meslek</Label>
        <Select
          value={searchParams.get("profession") ?? ""}
          onValueChange={(v) => update("profession", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tüm meslekler" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">Tümü</SelectItem>
            <ProfessionSelectOptions professions={professions} />
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min deneyim</Label>
          <Input
            type="number"
            min={0}
            defaultValue={searchParams.get("experience_min") ?? ""}
            onBlur={(e) => update("experience_min", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max maaş</Label>
          <Input
            type="number"
            defaultValue={searchParams.get("salary_max") ?? ""}
            onBlur={(e) => update("salary_max", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Müsaitlik</Label>
        <Select
          value={searchParams.get("availability") ?? ""}
          onValueChange={(v) => update("availability", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Hepsi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hepsi</SelectItem>
            {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Eğitim</Label>
        <Select
          value={searchParams.get("education") ?? ""}
          onValueChange={(v) => update("education", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Hepsi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hepsi</SelectItem>
            {Object.entries(EDUCATION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor="shift_filter" className="text-sm">
          Vardiyalı çalışır
        </Label>
        <button
          type="button"
          id="shift_filter"
          onClick={() =>
            update(
              "shift_work",
              searchParams.get("shift_work") === "1" ? "" : "1"
            )
          }
          className={`relative h-6 w-11 rounded-full transition-colors ${
            searchParams.get("shift_work") === "1"
              ? "bg-brand-orange"
              : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              searchParams.get("shift_work") === "1" ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <Label>Sırala</Label>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(v) => update("sort", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En yeni</SelectItem>
            <SelectItem value="experience">En deneyimli</SelectItem>
            <SelectItem value="salary_asc">En düşük maaş</SelectItem>
            <SelectItem value="salary_desc">En yüksek maaş</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pending && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Güncelleniyor...
        </p>
      )}
    </aside>
  );
}

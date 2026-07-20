"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfessionSelectOptions } from "@/components/shared/profession-select-options";
import {
  deleteSalaryRange,
  upsertSalaryRange,
} from "@/lib/actions/admin";
import { formatSalary } from "@/lib/utils";
import type { Profession } from "@/types/database";

export type SalaryRow = {
  id: string;
  profession_id: string;
  min_salary: number;
  avg_salary: number;
  max_salary: number;
  profession?: { name: string } | null;
};

type Props = {
  salaries: SalaryRow[];
  professions: Pick<Profession, "id" | "name" | "category">[];
};

export function SalaryRangesManager({ salaries, professions }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [professionId, setProfessionId] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [avgSalary, setAvgSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [pending, startTransition] = useTransition();

  const editing = useMemo(
    () => salaries.find((s) => s.id === editingId) ?? null,
    [editingId, salaries]
  );

  function startEdit(row: SalaryRow) {
    setEditingId(row.id);
    setProfessionId(row.profession_id);
    setMinSalary(String(row.min_salary));
    setAvgSalary(String(row.avg_salary));
    setMaxSalary(String(row.max_salary));
  }

  function resetForm() {
    setEditingId(null);
    setProfessionId("");
    setMinSalary("");
    setAvgSalary("");
    setMaxSalary("");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    if (editingId) fd.set("id", editingId);
    fd.set("profession_id", professionId);
    fd.set("min_salary", minSalary);
    fd.set("avg_salary", avgSalary);
    fd.set("max_salary", maxSalary);

    startTransition(async () => {
      const res = await upsertSalaryRange(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`“${name}” maaş verisini silmek istediğine emin misin?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteSalaryRange(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      if (editingId === id) resetForm();
      router.refresh();
    });
  }

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">
            {editing ? "Maaş verisini düzenle" : "Yeni maaş verisi ekle"}
          </h2>
          {editing && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              İptal
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Meslek</Label>
          <Select
            value={professionId || undefined}
            onValueChange={setProfessionId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seç" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <ProfessionSelectOptions professions={professions} />
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="min_salary">Min</Label>
            <Input
              id="min_salary"
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg_salary">Ortalama</Label>
            <Input
              id="avg_salary"
              type="number"
              required
              value={avgSalary}
              onChange={(e) => setAvgSalary(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_salary">Max</Label>
            <Input
              id="max_salary"
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={pending || !professionId}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editing ? "Güncelle" : "Kaydet"}
        </Button>
      </form>

      <ul className="space-y-2">
        {salaries.map((s) => {
          const name = s.profession?.name ?? "Meslek";
          const isEditing = editingId === s.id;
          return (
            <li
              key={s.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 ${
                isEditing ? "border-primary/40" : "border-border/60"
              }`}
            >
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSalary(s.min_salary)} – {formatSalary(s.max_salary)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="mr-2 text-sm font-semibold text-primary">
                  {formatSalary(s.avg_salary)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => startEdit(s)}
                >
                  Düzenle
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleDelete(s.id, name)}
                >
                  Sil
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteProfession,
  upsertProfession,
} from "@/lib/actions/admin";
import type { Profession, ProfessionCategory } from "@/types/database";

type Props = {
  professions: Profession[];
  categories: ProfessionCategory[];
};

export function ProfessionsManager({ professions, categories }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [trending, setTrending] = useState(false);
  const [pending, startTransition] = useTransition();

  function startEdit(p: Profession) {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category ?? "");
    setTrending(p.is_trending);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("");
    setTrending(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast.error("Kategori seçmelisin");
      return;
    }

    const fd = new FormData();
    if (editingId) fd.set("id", editingId);
    fd.set("name", name);
    fd.set("category", category);
    if (trending) fd.set("is_trending", "true");

    startTransition(async () => {
      const res = await upsertProfession(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(p: Profession) {
    if (!confirm(`“${p.name}” mesleğini silmek istediğine emin misin?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProfession(p.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      if (editingId === p.id) resetForm();
      router.refresh();
    });
  }

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            {editingId ? "Meslek düzenle" : "Yeni meslek ekle"}
          </h2>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/kategoriler">Kategorileri yönet</Link>
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                İptal
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Ad *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select
              value={category || undefined}
              onValueChange={setCategory}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="max-h-[min(24rem,var(--radix-select-content-available-height))]"
              >
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Önce{" "}
                    <Link href="/admin/kategoriler" className="underline">
                      kategori ekle
                    </Link>
                  </div>
                ) : (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={trending}
            onCheckedChange={(v) => setTrending(v === true)}
          />
          Trend meslek
        </label>

        <Button
          type="submit"
          disabled={pending || !name.trim() || !category || categories.length === 0}
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingId ? "Güncelle" : "Ekle"}
        </Button>
      </form>

      <ul className="space-y-2">
        {professions.map((p) => (
          <li
            key={p.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 ${
              editingId === p.id ? "border-primary/40" : "border-border/60"
            }`}
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.category || "Kategori yok"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {p.is_trending && (
                <Badge className="bg-brand-orange/15 text-brand-orange">
                  Trend
                </Badge>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => startEdit(p)}
              >
                Düzenle
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => handleDelete(p)}
              >
                Sil
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

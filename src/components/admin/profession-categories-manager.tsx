"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteProfessionCategory,
  upsertProfessionCategory,
} from "@/lib/actions/admin";
import type { ProfessionCategory } from "@/types/database";

type Props = {
  categories: ProfessionCategory[];
};

export function ProfessionCategoriesManager({ categories }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("100");
  const [pending, startTransition] = useTransition();

  function startEdit(cat: ProfessionCategory) {
    setEditingId(cat.id);
    setName(cat.name);
    setSortOrder(String(cat.sort_order));
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setSortOrder("100");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    if (editingId) fd.set("id", editingId);
    fd.set("name", name);
    fd.set("sort_order", sortOrder);

    startTransition(async () => {
      const res = await upsertProfessionCategory(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(cat: ProfessionCategory) {
    if (!confirm(`“${cat.name}” kategorisini silmek istediğine emin misin?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteProfessionCategory(cat.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success);
      if (editingId === cat.id) resetForm();
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
            {editingId ? "Kategori düzenle" : "Yeni kategori ekle"}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              İptal
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Kategori adı *</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Örn. Teknoloji"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sıra</Label>
            <Input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending || !name.trim()}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingId ? "Güncelle" : "Ekle"}
        </Button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 ${
              editingId === cat.id ? "border-primary/40" : "border-border/60"
            }`}
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-muted-foreground">
                Sıra: {cat.sort_order}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => startEdit(cat)}
              >
                Düzenle
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => handleDelete(cat)}
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

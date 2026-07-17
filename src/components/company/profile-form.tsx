"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, SECTORS } from "@/lib/constants";
import { upsertCompanyProfile } from "@/lib/actions/profiles";
import type { ActionResult } from "@/lib/actions/auth";
import type { Company } from "@/types/database";

const initial: ActionResult = {};

export function CompanyProfileForm({ company }: { company?: Company | null }) {
  const [state, action, pending] = useActionState(upsertCompanyProfile, initial);
  const [sector, setSector] = useState(company?.sector ?? "");
  const [city, setCity] = useState(company?.city ?? "");
  const [employeeCount, setEmployeeCount] = useState(
    company?.employee_count ?? ""
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="employee_count" value={employeeCount} />

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Firma bilgileri
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Firma adı</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={company?.name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Sektör</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger>
                <SelectValue placeholder="Sektör seç" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Şehir</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Şehir seç" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Web sitesi</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              defaultValue={company?.website ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={company?.phone ?? ""}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Çalışan sayısı</Label>
            <Select value={employeeCount} onValueChange={setEmployeeCount}>
              <SelectTrigger>
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={company?.description ?? ""}
              className="resize-none"
            />
          </div>
        </div>
        {company?.is_verified && (
          <p className="text-sm text-primary font-medium">✓ Doğrulanmış firma</p>
        )}
      </section>

      <Button type="submit" size="lg" className="h-12" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kaydet
      </Button>
    </form>
  );
}

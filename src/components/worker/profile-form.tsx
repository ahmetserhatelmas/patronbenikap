"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CITIES,
  EDUCATION_LABELS,
  AVAILABILITY_LABELS,
  MILITARY_LABELS,
  DRIVER_LICENSES,
  LANGUAGES,
} from "@/lib/constants";
import { formatSalary } from "@/lib/utils";
import {
  upsertWorkerProfile,
  getSalaryForProfession,
} from "@/lib/actions/profiles";
import type { ActionResult } from "@/lib/actions/auth";
import type { Profession, Skill, Worker, SalaryRange } from "@/types/database";

const initial: ActionResult = {};

interface WorkerProfileFormProps {
  worker?: Worker | null;
  professions: Profession[];
  skills: Skill[];
}

export function WorkerProfileForm({
  worker,
  professions,
  skills,
}: WorkerProfileFormProps) {
  const [state, action, pending] = useActionState(upsertWorkerProfile, initial);
  const [professionId, setProfessionId] = useState(
    worker?.profession_id ?? ""
  );
  const [city, setCity] = useState(worker?.city ?? "");
  const [education, setEducation] = useState(worker?.education ?? "");
  const [availability, setAvailability] = useState(
    worker?.availability ?? ""
  );
  const [military, setMilitary] = useState(worker?.military_status ?? "");
  const [salaryInfo, setSalaryInfo] = useState<SalaryRange | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    worker?.skills?.map((s) => s.skill_id) ?? []
  );
  const [languages, setLanguages] = useState<string[]>(
    worker?.languages ?? []
  );
  const [licenses, setLicenses] = useState<string[]>(
    worker?.driver_license ?? []
  );
  const [isVisible, setIsVisible] = useState(worker?.is_visible ?? true);
  const [currentlyWorking, setCurrentlyWorking] = useState(
    worker?.currently_working ?? false
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (!professionId) {
      setSalaryInfo(null);
      return;
    }
    startTransition(async () => {
      const data = await getSalaryForProfession(professionId);
      setSalaryInfo(data);
    });
  }, [professionId]);

  function toggleArr(
    arr: string[],
    setArr: (v: string[]) => void,
    value: string
  ) {
    setArr(
      arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
    );
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="is_visible" value={String(isVisible)} />
      <input
        type="hidden"
        name="currently_working"
        value={String(currentlyWorking)}
      />
      <input type="hidden" name="profession_id" value={professionId} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="education" value={education} />
      <input type="hidden" name="availability" value={availability} />
      <input type="hidden" name="military_status" value={military} />
      {selectedSkills.map((id) => (
        <input key={id} type="hidden" name="skill_ids" value={id} />
      ))}
      {languages.map((l) => (
        <input key={l} type="hidden" name="languages" value={l} />
      ))}
      {licenses.map((l) => (
        <input key={l} type="hidden" name="driver_license" value={l} />
      ))}

      <Section title="Temel bilgiler">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad" name="first_name" defaultValue={worker?.first_name} required />
          <Field label="Soyad" name="last_name" defaultValue={worker?.last_name} required />
          <Field label="Yaş" name="age" type="number" defaultValue={worker?.age ?? ""} />
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
          <Field label="İlçe" name="district" defaultValue={worker?.district ?? ""} />
        </div>
      </Section>

      <Section title="Meslek & deneyim">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Meslek</Label>
            <Select
              value={professionId}
              onValueChange={setProfessionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Meslek seç" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {salaryInfo && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Bu meslek için ortalama maaş:{" "}
                  <strong className="text-primary">
                    {formatSalary(salaryInfo.avg_salary)}
                  </strong>
                  <span className="text-muted-foreground">
                    {" "}
                    ({formatSalary(salaryInfo.min_salary)} –{" "}
                    {formatSalary(salaryInfo.max_salary)})
                  </span>
                </p>
              </div>
            )}
          </div>
          <Field
            label="Deneyim (yıl)"
            name="experience_years"
            type="number"
            defaultValue={worker?.experience_years ?? 0}
          />
          <Field
            label="Beklenen maaş (TL)"
            name="expected_salary"
            type="number"
            defaultValue={worker?.expected_salary ?? ""}
          />
          <div className="space-y-2">
            <Label>Eğitim</Label>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger>
                <SelectValue placeholder="Seviye seç" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EDUCATION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Müsaitlik</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABILITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Askerlik</Label>
            <Select value={military} onValueChange={setMilitary}>
              <SelectTrigger>
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MILITARY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="working">Şu an çalışıyor musun?</Label>
            <Switch
              id="working"
              checked={currentlyWorking}
              onCheckedChange={setCurrentlyWorking}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label>Uzmanlıklar (virgülle ayır)</Label>
          <Input
            name="specializations"
            placeholder="CNC, Montaj, Kalite kontrol"
            defaultValue={worker?.specializations?.join(", ") ?? ""}
          />
        </div>
      </Section>

      <Section title="Yetenekler">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const active = selectedSkills.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleArr(selectedSkills, setSelectedSkills, skill.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Diller & ehliyet">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Diller</Label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={languages.includes(lang)}
                    onCheckedChange={() =>
                      toggleArr(languages, setLanguages, lang)
                    }
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Ehliyet</Label>
            <div className="flex flex-wrap gap-3">
              {DRIVER_LICENSES.map((lic) => (
                <label key={lic} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={licenses.includes(lic)}
                    onCheckedChange={() =>
                      toggleArr(licenses, setLicenses, lic)
                    }
                  />
                  {lic}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Hakkımda">
        <Textarea
          name="about_me"
          rows={5}
          placeholder="Kendini kısaca tanıt..."
          defaultValue={worker?.about_me ?? ""}
          className="resize-none"
        />
      </Section>

      <Section title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon" name="phone" defaultValue={worker?.phone ?? ""} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={worker?.whatsapp ?? ""} />
          <Field
            label="E-posta"
            name="email"
            type="email"
            defaultValue={worker?.email ?? ""}
            className="sm:col-span-2"
          />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div>
            <p className="font-medium">Profil görünürlüğü</p>
            <p className="text-sm text-muted-foreground">
              Kapalıysa firmalar seni göremez
            </p>
          </div>
          <Switch checked={isVisible} onCheckedChange={setIsVisible} />
        </div>
      </Section>

      <Button type="submit" size="lg" className="h-12 w-full sm:w-auto" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Profili Kaydet
      </Button>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Camera, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MILITARY_LABELS,
  DRIVER_LICENSES,
  LANGUAGES,
} from "@/lib/constants";
import {
  cn,
  formatSalary,
  formatTrGrouped,
  digitsOnly,
  getInitials,
  normalizeTrPhoneInput,
} from "@/lib/utils";
import {
  upsertWorkerProfile,
  getSalaryForProfession,
  uploadAvatar,
} from "@/lib/actions/profiles";
import type { ActionResult } from "@/lib/actions/auth";
import type { Profession, Skill, Worker, SalaryRange } from "@/types/database";

const initial: ActionResult = {};

interface WorkerProfileFormProps {
  worker?: Worker | null;
  professions: Profession[];
  skills: Skill[];
  avatarUrl?: string | null;
}

export function WorkerProfileForm({
  worker,
  professions,
  skills,
  avatarUrl,
}: WorkerProfileFormProps) {
  const [state, action, pending] = useActionState(upsertWorkerProfile, initial);
  const [avatar, setAvatar] = useState(avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Controlled values so errors don't wipe the form
  const [firstName, setFirstName] = useState(worker?.first_name ?? "");
  const [lastName, setLastName] = useState(worker?.last_name ?? "");
  const [age, setAge] = useState(
    worker?.age != null ? String(worker.age) : ""
  );
  const [district, setDistrict] = useState(worker?.district ?? "");
  const [professionId, setProfessionId] = useState(worker?.profession_id ?? "");
  const [city, setCity] = useState(worker?.city ?? "");
  const [education, setEducation] = useState(worker?.education ?? "");
  const [availability, setAvailability] = useState(worker?.availability ?? "");
  const [military, setMilitary] = useState(worker?.military_status ?? "");
  const [experience, setExperience] = useState(
    String(Math.max(0, worker?.experience_years ?? 0))
  );
  const [salary, setSalary] = useState(
    worker?.expected_salary != null
      ? digitsOnly(String(worker.expected_salary))
      : ""
  );
  const [aboutMe, setAboutMe] = useState(worker?.about_me ?? "");
  const [specializations, setSpecializations] = useState(
    worker?.specializations?.join(", ") ?? ""
  );
  const [phone, setPhone] = useState(
    normalizeTrPhoneInput(worker?.phone ?? "")
  );
  const [email, setEmail] = useState(worker?.email ?? "");
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
  const [shiftWork, setShiftWork] = useState(
    Boolean((worker as Worker & { shift_work?: boolean })?.shift_work)
  );
  const [, startTransition] = useTransition();

  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  // Restore all fields after validation error (React form actions can wipe Select/checkbox state)
  useEffect(() => {
    const v = state.values;
    if (!v || !state.error) return;

    if (v.first_name != null) setFirstName(v.first_name);
    if (v.last_name != null) setLastName(v.last_name);
    if (v.age != null) setAge(digitsOnly(v.age));
    if (v.district != null) setDistrict(v.district);
    if (v.city != null) setCity(v.city);
    if (v.profession_id != null) setProfessionId(v.profession_id);
    if (v.education != null) setEducation(v.education);
    if (v.availability != null) setAvailability(v.availability);
    if (v.military_status != null) setMilitary(v.military_status);
    if (v.experience_years != null) setExperience(digitsOnly(v.experience_years));
    if (v.expected_salary != null) setSalary(digitsOnly(v.expected_salary));
    if (v.about_me != null) setAboutMe(v.about_me);
    if (v.specializations != null) setSpecializations(v.specializations);
    if (v.phone != null) setPhone(normalizeTrPhoneInput(v.phone));
    if (v.email != null) setEmail(v.email);
    if (v.currently_working != null) {
      setCurrentlyWorking(v.currently_working === "true");
    }
    if (v.shift_work != null) setShiftWork(v.shift_work === "true");
    if (v.is_visible != null) setIsVisible(v.is_visible !== "false");
    if (v.languages != null) {
      setLanguages(v.languages.split("|").filter(Boolean));
    }
    if (v.driver_license != null) {
      setLicenses(v.driver_license.split("|").filter(Boolean));
    }
    if (v.skill_ids != null) {
      setSelectedSkills(v.skill_ids.split("|").filter(Boolean));
    }
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

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("avatar", file);
    const res = await uploadAvatar(fd);
    setUploading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(res.success);
    setAvatar(URL.createObjectURL(file));
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="is_visible" value={String(isVisible)} />
      <input
        type="hidden"
        name="currently_working"
        value={String(currentlyWorking)}
      />
      <input type="hidden" name="shift_work" value={String(shiftWork)} />
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

      <Section title="Profil fotoğrafı">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarImage src={avatar ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(firstName || "P", lastName || "B")}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Fotoğraf yükle
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG veya PNG, en fazla 5MB
            </p>
          </div>
        </div>
      </Section>

      <Section title="Temel bilgiler">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ad"
            name="first_name"
            value={firstName}
            onChange={setFirstName}
            error={errors.first_name}
            required
          />
          <Field
            label="Soyad"
            name="last_name"
            value={lastName}
            onChange={setLastName}
            error={errors.last_name}
            required
          />
          <Field
            label="Yaş"
            name="age"
            inputMode="numeric"
            value={age}
            onChange={(v) => setAge(digitsOnly(v))}
            error={errors.age}
            min={16}
            max={80}
          />
          <div className="space-y-2">
            <Label className={errors.city ? "text-destructive" : undefined}>
              Şehir *
            </Label>
            <Select value={city || undefined} onValueChange={setCity}>
              <SelectTrigger className={errors.city ? "border-destructive" : ""}>
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
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city}</p>
            )}
          </div>
          <Field
            label="İlçe"
            name="district"
            value={district}
            onChange={setDistrict}
            error={errors.district}
          />
        </div>
      </Section>

      <Section title="Meslek & deneyim">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label
              className={errors.profession_id ? "text-destructive" : undefined}
            >
              Meslek *
            </Label>
            <Select
              value={professionId || undefined}
              onValueChange={setProfessionId}
            >
              <SelectTrigger
                className={errors.profession_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Meslek seç" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <ProfessionSelectOptions professions={professions} />
              </SelectContent>
            </Select>
            {errors.profession_id && (
              <p className="text-xs text-destructive">{errors.profession_id}</p>
            )}
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
            inputMode="numeric"
            value={experience}
            onChange={(v) => setExperience(digitsOnly(v))}
            error={errors.experience_years}
            min={0}
            max={50}
          />
          <div className="space-y-2">
            <Label
              htmlFor="expected_salary_display"
              className={errors.expected_salary ? "text-destructive" : undefined}
            >
              Beklenen maaş (TL)
            </Label>
            <input type="hidden" name="expected_salary" value={salary} />
            <Input
              id="expected_salary_display"
              inputMode="numeric"
              placeholder="örn. 35.000"
              value={formatTrGrouped(salary)}
              onChange={(e) => setSalary(digitsOnly(e.target.value))}
              className={errors.expected_salary ? "border-destructive" : undefined}
              aria-invalid={!!errors.expected_salary}
            />
            {errors.expected_salary && (
              <p className="text-xs text-destructive">{errors.expected_salary}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Eğitim</Label>
            <Select value={education || undefined} onValueChange={setEducation}>
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
            <Select
              value={availability || undefined}
              onValueChange={setAvailability}
            >
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
            <Select value={military || undefined} onValueChange={setMilitary}>
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
          <div className="flex items-center justify-between rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-3 sm:col-span-2">
            <div>
              <Label htmlFor="shift">Vardiyalı çalışmaya uygun musun?</Label>
              <p className="text-xs text-muted-foreground">
                Gece / dönüşümlü vardiya kabul ediyorsan aç
              </p>
            </div>
            <Switch
              id="shift"
              checked={shiftWork}
              onCheckedChange={setShiftWork}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label>Uzmanlıklar (virgülle ayır)</Label>
          <Input
            name="specializations"
            placeholder="CNC, Montaj, Kalite kontrol"
            value={specializations}
            onChange={(e) => setSpecializations(e.target.value)}
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
                onClick={() =>
                  toggleArr(selectedSkills, setSelectedSkills, skill.id)
                }
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
          placeholder="Kendini kısaca tanıt... (en az 20 karakter)"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          className={cn(
            "resize-none",
            errors.about_me && "border-destructive"
          )}
        />
        {errors.about_me && (
          <p className="mt-1 text-xs text-destructive">{errors.about_me}</p>
        )}
      </Section>

      <Section title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className={errors.phone ? "text-destructive" : undefined}
            >
              Telefon / WhatsApp *
            </Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                +90
              </span>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(normalizeTrPhoneInput(e.target.value))}
                required
                placeholder="5xx xxx xx xx"
                maxLength={10}
                className={
                  errors.phone
                    ? "rounded-l-none border-destructive"
                    : "rounded-l-none"
                }
                aria-invalid={!!errors.phone}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Başında 0 olmadan yazın. WhatsApp için +90 otomatik eklenir.
            </p>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
            {/* WhatsApp = telefon; ayrı alan yok */}
            <input type="hidden" name="whatsapp" value={phone} />
          </div>
          <Field
            label="E-posta"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
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

      {state.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full sm:w-auto"
        disabled={pending}
      >
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
  inputMode,
  value,
  onChange,
  error,
  required,
  className,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label
        htmlFor={name}
        className={error ? "text-destructive" : undefined}
      >
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className={error ? "border-destructive" : undefined}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

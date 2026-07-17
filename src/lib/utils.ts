import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatSalary(amount: number | null | undefined): string {
  if (amount == null) return "Belirtilmedi";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(n);
}

export function getInitials(first: string, last?: string): string {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

export function calculateProfileCompletion(worker: {
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  city?: string | null;
  profession_id?: string | null;
  experience_years?: number | null;
  about_me?: string | null;
  expected_salary?: number | null;
  phone?: string | null;
  education?: string | null;
  languages?: string[] | null;
  specializations?: string[] | null;
}): number {
  const fields = [
    worker.first_name,
    worker.last_name,
    worker.age,
    worker.city,
    worker.profession_id,
    worker.experience_years != null,
    worker.about_me,
    worker.expected_salary,
    worker.phone,
    worker.education,
    (worker.languages?.length ?? 0) > 0,
    (worker.specializations?.length ?? 0) > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

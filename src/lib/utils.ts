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

/** Keep only digits (blocks minus / decimals). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normalize a TR mobile for form storage: digits only, no leading 0, no +90.
 * e.g. "0537 826 86 35" → "5378268635"
 */
export function normalizeTrPhoneInput(value: string): string {
  let digits = digitsOnly(value);
  if (digits.startsWith("90") && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/**
 * WhatsApp / wa.me format with Turkey country code (no +).
 * e.g. "5378268635" → "905378268635"
 */
export function toWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null;
  let digits = digitsOnly(phone);
  if (!digits) return null;
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("90") && digits.length >= 12) return digits;
  return `90${digits}`;
}

/** Display format: "+90 537 826 86 35" */
export function formatTrPhoneDisplay(phone?: string | null): string {
  const local = normalizeTrPhoneInput(phone ?? "");
  if (local.length !== 10) {
    return local ? `+90 ${local}` : "";
  }
  return `+90 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
}

/** Format integer digits with Turkish thousand separators: 34997 → 34.997 */
export function formatTrGrouped(digits: string): string {
  const clean = digitsOnly(digits);
  if (!clean) return "";
  return new Intl.NumberFormat("tr-TR").format(Number(clean));
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

function isLocalHost(value: string) {
  return /localhost|127\.0\.0\.1/.test(value);
}

/** Hestia/NodeApps internal ports must never appear in auth emails */
function isInternalHost(value: string) {
  if (isLocalHost(value)) return true;
  // bare high ports behind reverse proxy (e.g. localhost:50000)
  if (/:\d{4,5}$/.test(value) && !/\./.test(value.split(":")[0] ?? "")) {
    return true;
  }
  if (/:(50000|50001|3000|3001)(\b|$)/.test(value) && isLocalHost(value)) {
    return true;
  }
  return false;
}

/**
 * Public site origin for auth redirects / emails.
 * Prefer NEXT_PUBLIC_APP_URL; never use internal NodeApps hosts.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured && !isLocalHost(configured)) {
    return configured;
  }

  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
      .split(",")[0]
      ?.trim();
    const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim();
    if (host && !isInternalHost(host)) {
      return `${proto || "https"}://${host}`;
    }
  } catch {
    // Called outside a request (build / scripts)
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /\/$/,
    ""
  );
  if (production) {
    return production.startsWith("http")
      ? production
      : `https://${production}`;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  // Public production fallback when env/host headers are wrong (shared hosting)
  if (process.env.NODE_ENV === "production") {
    return "https://patronbenikap.com";
  }

  return configured || "http://localhost:3000";
}

/** Client/server-safe absolute URL (no request headers). */
export function absoluteUrl(path: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  let base = configured || "http://localhost:3000";

  if (typeof window !== "undefined" && (!configured || isLocalHost(configured))) {
    base = window.location.origin;
  } else if (configured && isLocalHost(configured)) {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
      /\/$/,
      ""
    );
    if (production) {
      base = production.startsWith("http")
        ? production
        : `https://${production}`;
    }
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

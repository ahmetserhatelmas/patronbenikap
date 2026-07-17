import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Ad soyad gerekli"),
    role: z.enum(["worker", "company"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export const workerProfileSchema = z.object({
  first_name: z.string().min(2, "Ad gerekli"),
  last_name: z.string().min(2, "Soyad gerekli"),
  age: z.coerce.number().min(16, "Yaş en az 16 olmalı").max(80).optional().nullable(),
  city: z.string().min(1, "Şehir seçmelisin"),
  district: z.string().optional().nullable(),
  profession_id: z.string().uuid("Meslek seçmelisin"),
  experience_years: z.coerce.number().min(0).max(50).default(0),
  education: z
    .enum([
      "ilkokul",
      "ortaokul",
      "lise",
      "onlisans",
      "lisans",
      "yuksek_lisans",
      "doktora",
    ])
    .optional()
    .nullable(),
  languages: z.array(z.string()).default([]),
  driver_license: z.array(z.string()).default([]),
  military_status: z
    .enum(["yapildi", "tecilli", "muaf", "yapilmadi"])
    .optional()
    .nullable(),
  currently_working: z.boolean().default(false),
  shift_work: z.boolean().default(false),
  expected_salary: z.coerce.number().min(0).optional().nullable(),
  availability: z
    .enum(["hemen", "1_hafta", "2_hafta", "1_ay", "esnek"])
    .optional()
    .nullable(),
  about_me: z.string().min(20, "Hakkımda en az 20 karakter olmalı").max(2000),
  specializations: z.array(z.string()).default([]),
  whatsapp: z.string().optional().nullable(),
  phone: z.string().min(10, "Telefon gerekli"),
  email: z.string().email("Geçerli e-posta girin").optional().nullable().or(z.literal("")),
  is_visible: z.boolean().default(true),
  skill_ids: z.array(z.string()).default([]),
});

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Firma adı gerekli"),
  sector: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  website: z.string().url("Geçerli URL girin").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  employee_count: z.string().optional().nullable(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Mesaj boş olamaz").max(2000),
  conversation_id: z.string().uuid().optional(),
  worker_id: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

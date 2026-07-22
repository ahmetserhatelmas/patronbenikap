export type UserRole = "worker" | "company" | "admin";

export type MilitaryStatus = "yapildi" | "tecilli" | "muaf" | "yapilmadi";

export type AvailabilityStatus =
  | "hemen"
  | "1_hafta"
  | "2_hafta"
  | "1_ay"
  | "esnek";

export type EducationLevel =
  | "ilkokul"
  | "ortaokul"
  | "lise"
  | "onlisans"
  | "lisans"
  | "yuksek_lisans"
  | "doktora";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_onboarded: boolean;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Profession {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  icon: string | null;
  is_trending: boolean;
  sort_order: number;
}

export interface SalaryRange {
  id: string;
  profession_id: string;
  city: string | null;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  currency: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

export interface Worker {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  slug: string;
  age: number | null;
  city: string | null;
  district: string | null;
  profession_id: string | null;
  experience_years: number;
  education: EducationLevel | null;
  languages: string[];
  driver_license: string[];
  military_status: MilitaryStatus | null;
  currently_working: boolean;
  shift_work?: boolean;
  expected_salary: number | null;
  availability: AvailabilityStatus | null;
  about_me: string | null;
  specializations: string[];
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  cv_url: string | null;
  is_visible: boolean;
  profile_completion: number;
  view_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  profession?: Profession | null;
  skills?: (WorkerSkill & { skill: Skill })[];
  certificates?: Certificate[];
  portfolio_images?: PortfolioImage[];
  profile?: Profile;
}

export interface WorkerSkill {
  id: string;
  worker_id: string;
  skill_id: string;
  level: number;
  skill?: Skill;
}

export interface Certificate {
  id: string;
  worker_id: string;
  name: string;
  issuer: string | null;
  issued_at: string | null;
  file_url: string | null;
}

export interface PortfolioImage {
  id: string;
  worker_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface Company {
  id: string;
  profile_id: string;
  name: string;
  slug: string;
  sector: string | null;
  city: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  is_verified: boolean;
  mersis_no: string | null;
  employee_count: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Favorite {
  id: string;
  company_id: string;
  worker_id: string;
  created_at: string;
  worker?: Worker;
}

export interface Conversation {
  id: string;
  company_id: string;
  worker_id: string;
  last_message_at: string | null;
  created_at: string;
  company?: Company;
  worker?: Worker;
  messages?: Message[];
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface SiteStats {
  active_workers: number;
  active_companies: number;
  total_views: number;
}

export interface WorkerSearchParams {
  city?: string;
  district?: string;
  profession?: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  availability?: AvailabilityStatus;
  languages?: string[];
  education?: EducationLevel;
  shift_work?: boolean;
  q?: string;
  sort?: "newest" | "experience" | "salary_asc" | "salary_desc";
  page?: number;
  limit?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      workers: { Row: Worker; Insert: Partial<Worker>; Update: Partial<Worker> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      profession_categories: {
        Row: ProfessionCategory;
        Insert: Partial<ProfessionCategory>;
        Update: Partial<ProfessionCategory>;
      };
      professions: { Row: Profession; Insert: Partial<Profession>; Update: Partial<Profession> };
      salary_ranges: { Row: SalaryRange; Insert: Partial<SalaryRange>; Update: Partial<SalaryRange> };
      skills: { Row: Skill; Insert: Partial<Skill>; Update: Partial<Skill> };
      worker_skills: { Row: WorkerSkill; Insert: Partial<WorkerSkill>; Update: Partial<WorkerSkill> };
      certificates: { Row: Certificate; Insert: Partial<Certificate>; Update: Partial<Certificate> };
      portfolio_images: {
        Row: PortfolioImage;
        Insert: Partial<PortfolioImage>;
        Update: Partial<PortfolioImage>;
      };
      favorites: { Row: Favorite; Insert: Partial<Favorite>; Update: Partial<Favorite> };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation>;
        Update: Partial<Conversation>;
      };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
      site_stats: { Row: SiteStats; Insert: Partial<SiteStats>; Update: Partial<SiteStats> };
    };
  };
}

-- Expand professions, shift work, blog, notification insert policy
-- Run in Supabase SQL Editor

-- Shift work on workers
alter table public.workers
  add column if not exists shift_work boolean not null default false;

-- Allow authenticated users to create notifications (for messaging / favorites / views)
drop policy if exists "Authenticated can insert notifications" on public.notifications;
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

-- Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_url text,
  profession_slug text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
drop policy if exists "Blog posts public" on public.blog_posts;
create policy "Blog posts public" on public.blog_posts
  for select using (is_published = true);

-- Extra professions
insert into public.professions (name, slug, category, is_trending, sort_order) values
  ('Frontend Geliştirici', 'frontend-gelistirici', 'Teknoloji', true, 16),
  ('Backend Geliştirici', 'backend-gelistirici', 'Teknoloji', true, 17),
  ('Mobil Geliştirici', 'mobil-gelistirici', 'Teknoloji', false, 18),
  ('Veri Analisti', 'veri-analisti', 'Teknoloji', true, 19),
  ('İnsan Kaynakları Uzmanı', 'insan-kaynaklari', 'Yönetim', false, 20),
  ('Pazarlama Uzmanı', 'pazarlama-uzmani', 'Satış', true, 21),
  ('Dijital Pazarlama', 'dijital-pazarlama', 'Satış', true, 22),
  ('Müşteri Hizmetleri', 'musteri-hizmetleri', 'Hizmet', false, 23),
  ('Kasiyer', 'kasiyer', 'Perakende', false, 24),
  ('Temizlik Görevlisi', 'temizlik-gorevlisi', 'Hizmet', false, 25),
  ('Güvenlik Görevlisi', 'guvenlik-gorevlisi', 'Hizmet', false, 26),
  ('Kuaför', 'kuafor', 'Hizmet', false, 27),
  ('Eczacı', 'eczaci', 'Sağlık', false, 28),
  ('Fizyoterapist', 'fizyoterapist', 'Sağlık', false, 29),
  ('İnşaat Mühendisi', 'insaat-muhendisi', 'Mühendislik', true, 30),
  ('Elektrik Mühendisi', 'elektrik-muhendisi', 'Mühendislik', false, 31),
  ('Endüstri Mühendisi', 'endustri-muhendisi', 'Mühendislik', false, 32),
  ('CNC Operatörü', 'cnc-operatoru', 'Teknik', false, 33),
  ('Teknisyen', 'teknisyen', 'Teknik', false, 34),
  ('Forklift Operatörü', 'forklift-operatoru', 'Lojistik', false, 35),
  ('Kargo Görevlisi', 'kargo-gorevlisi', 'Lojistik', false, 36),
  ('Hostes / Host', 'hostes-host', 'Turizm', false, 37),
  ('Resepsiyonist', 'resepsiyonist', 'Turizm', false, 38),
  ('Barista', 'barista', 'Hizmet', true, 39),
  ('Pastacı', 'pastaci', 'Hizmet', false, 40)
on conflict (slug) do nothing;

-- Sample salary ranges for new professions
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 40000, 80000, 55000 from public.professions where slug = 'frontend-gelistirici'
on conflict do nothing;
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 45000, 90000, 60000 from public.professions where slug = 'backend-gelistirici'
on conflict do nothing;
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 22000, 35000, 28000 from public.professions where slug = 'kasiyer'
on conflict do nothing;
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 22000, 32000, 26000 from public.professions where slug = 'barista'
on conflict do nothing;
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 35000, 60000, 45000 from public.professions where slug = 'insaat-muhendisi'
on conflict do nothing;
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 28000, 50000, 36000 from public.professions where slug = 'pazarlama-uzmani'
on conflict do nothing;

-- Seed blog posts
insert into public.blog_posts (title, slug, excerpt, content, profession_slug) values
(
  'Yazılım Geliştirici Olmak: Nereden Başlamalı?',
  'yazilim-gelistirici-nereden-baslamali',
  'Yazılım dünyasına adım atmak isteyenler için pratik bir yol haritası.',
  E'## Yazılım geliştirici olmak\n\nYazılım sektörü Türkiye''de hızla büyüyor. Başlamak için:\n\n1. Temel programlama (JavaScript veya Python)\n2. Küçük projeler üretmek\n3. GitHub profili oluşturmak\n4. Patron Beni Kap üzerinde görünür bir profil\n\nFirmalar CV''den çok somut iş örneklerine bakıyor. Portföyünü güçlü tut.',
  'yazilim-gelistirici'
),
(
  'Elektrikçi Mesleğinde Sertifikalar Neden Önemli?',
  'elektrikci-sertifikalar',
  'Güvenlik ve istihdam için elektrikçilikte sertifika rehberi.',
  E'## Elektrikçi sertifikaları\n\nMeslekte güven ve yasal uygunluk kritik. MYK belgesi, iş güvenliği eğitimleri ve usta öğreticilik sertifikaları öne çıkıyor.\n\nProfiline sertifikalarını ekleyerek firmaların seni daha hızlı seçmesini sağla.',
  'elektrikci'
),
(
  'Garson ve Servis Personeli: İpuçları',
  'garson-ipuclari',
  'Hizmet sektöründe öne çıkmak için pratik öneriler.',
  E'## Servis personeli nasıl öne çıkar?\n\nİletişim, hız ve müşteri memnuniyeti belirleyici. Dil bilmek, vardiyalı çalışmaya açıklık ve hijyen bilinci avantaj sağlar.\n\nProfilinde müsaitlik ve vardiya tercihini net belirt.',
  'garson'
)
on conflict (slug) do nothing;

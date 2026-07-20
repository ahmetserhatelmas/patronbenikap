-- Manageable profession categories (admin selects from these when adding professions)

create table if not exists public.profession_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profession_categories enable row level security;

drop policy if exists "Profession categories public read" on public.profession_categories;
create policy "Profession categories public read"
  on public.profession_categories for select using (true);

-- Seed from existing profession.category values + known defaults
insert into public.profession_categories (name, slug, sort_order)
select distinct
  trim(p.category),
  lower(regexp_replace(
    translate(trim(p.category), 'çğıöşüÇĞİÖŞÜ', 'cgiosuCGIOSU'),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )),
  100
from public.professions p
where p.category is not null and trim(p.category) <> ''
on conflict (name) do nothing;

insert into public.profession_categories (name, slug, sort_order)
values
  ('Mühendislik', 'muhendislik', 10),
  ('Teknoloji', 'teknoloji', 20),
  ('Teknik', 'teknik', 30),
  ('İnşaat', 'insaat', 40),
  ('Sağlık', 'saglik', 50),
  ('Eğitim', 'egitim', 60),
  ('Finans', 'finans', 70),
  ('Satış', 'satis', 80),
  ('Tasarım', 'tasarim', 90),
  ('Lojistik', 'lojistik', 100),
  ('Hizmet', 'hizmet', 110),
  ('Perakende', 'perakende', 120),
  ('Turizm', 'turizm', 130),
  ('Yönetim', 'yonetim', 140),
  ('Diğer', 'diger', 999)
on conflict (name) do nothing;

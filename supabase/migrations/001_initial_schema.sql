-- Patron Beni Kap - Initial Schema
-- Run this in Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Enums
create type user_role as enum ('worker', 'company', 'admin');
create type military_status as enum ('yapildi', 'tecilli', 'muaf', 'yapilmadi');
create type availability_status as enum ('hemen', '1_hafta', '2_hafta', '1_ay', 'esnek');
create type education_level as enum (
  'ilkokul', 'ortaokul', 'lise', 'onlisans', 'lisans', 'yuksek_lisans', 'doktora'
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'worker',
  full_name text,
  avatar_url text,
  phone text,
  is_onboarded boolean not null default false,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Professions
create table public.professions (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  category text,
  icon text,
  is_trending boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Salary ranges (editable by admin)
create table public.salary_ranges (
  id uuid primary key default uuid_generate_v4(),
  profession_id uuid not null references public.professions(id) on delete cascade,
  city text,
  min_salary int not null,
  max_salary int not null,
  avg_salary int not null,
  currency text not null default 'TRY',
  updated_at timestamptz not null default now(),
  unique (profession_id, city)
);

-- Skills
create table public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  category text,
  created_at timestamptz not null default now()
);

-- Workers
create table public.workers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  slug text not null unique,
  age int,
  city text,
  district text,
  profession_id uuid references public.professions(id),
  experience_years int not null default 0,
  education education_level,
  languages text[] default '{}',
  driver_license text[] default '{}',
  military_status military_status,
  currently_working boolean not null default false,
  expected_salary int,
  availability availability_status default 'esnek',
  about_me text,
  specializations text[] default '{}',
  whatsapp text,
  phone text,
  email text,
  cv_url text,
  is_visible boolean not null default true,
  profile_completion int not null default 0,
  view_count int not null default 0,
  favorite_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workers_city_idx on public.workers(city);
create index workers_profession_idx on public.workers(profession_id);
create index workers_experience_idx on public.workers(experience_years);
create index workers_salary_idx on public.workers(expected_salary);
create index workers_visible_idx on public.workers(is_visible) where is_visible = true;
create index workers_search_idx on public.workers using gin (
  (first_name || ' ' || last_name || ' ' || coalesce(city, '') || ' ' || coalesce(district, '')) gin_trgm_ops
);

-- Worker skills
create table public.worker_skills (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int check (level between 1 and 5) default 3,
  unique (worker_id, skill_id)
);

-- Certificates
create table public.certificates (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  name text not null,
  issuer text,
  issued_at date,
  file_url text,
  created_at timestamptz not null default now()
);

-- Portfolio images
create table public.portfolio_images (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Companies
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  sector text,
  city text,
  description text,
  website text,
  logo_url text,
  is_verified boolean not null default false,
  employee_count text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Favorites (companies save workers)
create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (company_id, worker_id)
);

-- Recently viewed
create table public.recently_viewed (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (company_id, worker_id)
);

-- Conversations
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, worker_id)
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);

-- Typing indicators (ephemeral via realtime presence preferred, but table for fallback)
create table public.typing_indicators (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- Site stats (for landing / admin)
create table public.site_stats (
  id int primary key default 1 check (id = 1),
  active_workers int not null default 0,
  active_companies int not null default 0,
  total_views int not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, active_workers, active_companies, total_views)
values (1, 20000, 500, 100000);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger workers_updated_at before update on public.workers
  for each row execute function public.handle_updated_at();
create trigger companies_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role := 'worker';
  meta_role text;
begin
  meta_role := new.raw_user_meta_data->>'role';

  if meta_role in ('worker', 'company', 'admin') then
    selected_role := meta_role::public.user_role;
  end if;

  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    selected_role,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to supabase_auth_admin;
grant insert, update on public.profiles to supabase_auth_admin;
grant usage on type public.user_role to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
-- Favorite count sync
create or replace function public.sync_favorite_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.workers set favorite_count = favorite_count + 1 where id = new.worker_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.workers set favorite_count = greatest(favorite_count - 1, 0) where id = old.worker_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger favorites_count_trigger
  after insert or delete on public.favorites
  for each row execute function public.sync_favorite_count();

-- RLS
alter table public.profiles enable row level security;
alter table public.workers enable row level security;
alter table public.companies enable row level security;
alter table public.professions enable row level security;
alter table public.salary_ranges enable row level security;
alter table public.skills enable row level security;
alter table public.worker_skills enable row level security;
alter table public.certificates enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.site_stats enable row level security;
alter table public.typing_indicators enable row level security;

-- Profiles policies
create policy "Public profiles are viewable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Workers policies
create policy "Visible workers are public" on public.workers
  for select using (is_visible = true or profile_id = auth.uid());
create policy "Workers insert own" on public.workers
  for insert with check (profile_id = auth.uid());
create policy "Workers update own" on public.workers
  for update using (profile_id = auth.uid());

-- Companies policies
create policy "Companies are public" on public.companies for select using (true);
create policy "Companies insert own" on public.companies
  for insert with check (profile_id = auth.uid());
create policy "Companies update own" on public.companies
  for update using (profile_id = auth.uid());

-- Reference data (public read)
create policy "Professions public" on public.professions for select using (true);
create policy "Salary ranges public" on public.salary_ranges for select using (true);
create policy "Skills public" on public.skills for select using (true);
create policy "Site stats public" on public.site_stats for select using (true);

-- Worker related
create policy "Worker skills public" on public.worker_skills for select using (true);
create policy "Worker manage skills" on public.worker_skills
  for all using (
    exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
  );

create policy "Certificates public" on public.certificates for select using (true);
create policy "Worker manage certificates" on public.certificates
  for all using (
    exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
  );

create policy "Portfolio public" on public.portfolio_images for select using (true);
create policy "Worker manage portfolio" on public.portfolio_images
  for all using (
    exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
  );

-- Favorites
create policy "Company manage favorites" on public.favorites
  for all using (
    exists (select 1 from public.companies c where c.id = company_id and c.profile_id = auth.uid())
  );
create policy "Workers see favorite count via worker" on public.favorites
  for select using (
    exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
    or exists (select 1 from public.companies c where c.id = company_id and c.profile_id = auth.uid())
  );

-- Recently viewed
create policy "Company manage recently viewed" on public.recently_viewed
  for all using (
    exists (select 1 from public.companies c where c.id = company_id and c.profile_id = auth.uid())
  );

-- Conversations & messages
create policy "Participants see conversations" on public.conversations
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.profile_id = auth.uid())
    or exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
  );
create policy "Companies create conversations" on public.conversations
  for insert with check (
    exists (select 1 from public.companies c where c.id = company_id and c.profile_id = auth.uid())
  );

create policy "Participants see messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations conv
      where conv.id = conversation_id
      and (
        exists (select 1 from public.companies c where c.id = conv.company_id and c.profile_id = auth.uid())
        or exists (select 1 from public.workers w where w.id = conv.worker_id and w.profile_id = auth.uid())
      )
    )
  );
create policy "Participants send messages" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations conv
      where conv.id = conversation_id
      and (
        exists (select 1 from public.companies c where c.id = conv.company_id and c.profile_id = auth.uid())
        or exists (select 1 from public.workers w where w.id = conv.worker_id and w.profile_id = auth.uid())
      )
    )
  );
create policy "Participants update messages" on public.messages
  for update using (
    exists (
      select 1 from public.conversations conv
      where conv.id = conversation_id
      and (
        exists (select 1 from public.companies c where c.id = conv.company_id and c.profile_id = auth.uid())
        or exists (select 1 from public.workers w where w.id = conv.worker_id and w.profile_id = auth.uid())
      )
    )
  );

-- Notifications
create policy "Users see own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- Typing
create policy "Typing indicators for participants" on public.typing_indicators
  for all using (user_id = auth.uid());

-- Storage buckets (run in dashboard or via API)
-- avatars, portfolio, cvs, company-logos

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.typing_indicators;
alter publication supabase_realtime add table public.conversations;

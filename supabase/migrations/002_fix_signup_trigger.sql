-- FIX: "Database error saving new user"
-- Supabase Dashboard → SQL Editor → Run

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
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to supabase_auth_admin;
grant insert, update, select on public.profiles to supabase_auth_admin;
grant usage on type public.user_role to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

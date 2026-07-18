-- Storage buckets for avatars / portfolio / CVs / company logos
-- Run in Supabase SQL Editor (Storage → API ile de oluşturulabilir)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'portfolio',
    'portfolio',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'cvs',
    'cvs',
    false,
    10485760,
    array['application/pdf']
  ),
  (
    'company-logos',
    'company-logos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for public buckets
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Public read portfolio" on storage.objects;
create policy "Public read portfolio"
  on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "Public read company logos" on storage.objects;
create policy "Public read company logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');

-- Authenticated users manage their own folder: {user_id}/...
drop policy if exists "Users upload own avatars" on storage.objects;
create policy "Users upload own avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own avatars" on storage.objects;
create policy "Users delete own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload own portfolio" on storage.objects;
create policy "Users upload own portfolio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own portfolio" on storage.objects;
create policy "Users update own portfolio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own portfolio" on storage.objects;
create policy "Users delete own portfolio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload own cvs" on storage.objects;
create policy "Users upload own cvs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users read own cvs" on storage.objects;
create policy "Users read own cvs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own cvs" on storage.objects;
create policy "Users delete own cvs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload own company logos" on storage.objects;
create policy "Users upload own company logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own company logos" on storage.objects;
create policy "Users update own company logos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own company logos" on storage.objects;
create policy "Users delete own company logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

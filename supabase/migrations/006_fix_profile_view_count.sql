-- Fix profile view counting: companies couldn't update workers.view_count (RLS),
-- and workers couldn't read recently_viewed for their panel stats.

-- Workers can see who viewed their profile (for dashboard counts)
drop policy if exists "Workers see own recently viewed" on public.recently_viewed;
create policy "Workers see own recently viewed"
  on public.recently_viewed for select
  using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.profile_id = auth.uid()
    )
  );

-- Atomic, RLS-safe view recording (company only)
create or replace function public.record_worker_profile_view(p_worker_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_company_name text;
  v_viewer_id uuid := auth.uid();
  v_worker public.workers%rowtype;
  v_previous timestamptz;
  v_new_count int;
  v_should_notify boolean := false;
begin
  if v_viewer_id is null then
    return null;
  end if;

  select c.id, c.name into v_company_id, v_company_name
  from public.companies c
  where c.profile_id = v_viewer_id;

  if v_company_id is null then
    return null;
  end if;

  select * into v_worker
  from public.workers
  where id = p_worker_id;

  if not found then
    return null;
  end if;

  -- Don't count self-views (owner also company — rare) or invisible profiles for others
  if v_worker.profile_id = v_viewer_id then
    return v_worker.view_count;
  end if;

  update public.workers
  set view_count = view_count + 1
  where id = p_worker_id
  returning view_count into v_new_count;

  select rv.viewed_at into v_previous
  from public.recently_viewed rv
  where rv.company_id = v_company_id and rv.worker_id = p_worker_id;

  insert into public.recently_viewed (company_id, worker_id, viewed_at)
  values (v_company_id, p_worker_id, now())
  on conflict (company_id, worker_id)
  do update set viewed_at = excluded.viewed_at;

  v_should_notify :=
    v_previous is null
    or (extract(epoch from (now() - v_previous)) > 12 * 60 * 60);

  if v_should_notify then
    insert into public.notifications (user_id, type, title, body, link, metadata)
    values (
      v_worker.profile_id,
      'view',
      v_company_name || ' seni inceledi',
      v_company_name || ' profiline baktı. Belki patron seni kapmak üzeredir!',
      '/isci/bildirimler',
      jsonb_build_object(
        'company_id', v_company_id,
        'company_name', v_company_name
      )
    );
  end if;

  return v_new_count;
end;
$$;

revoke all on function public.record_worker_profile_view(uuid) from public;
grant execute on function public.record_worker_profile_view(uuid) to authenticated;

-- Backfill counts from existing view activity
update public.workers w
set view_count = greatest(
  w.view_count,
  coalesce((
    select count(*)::int
    from public.recently_viewed rv
    where rv.worker_id = w.id
  ), 0),
  coalesce((
    select count(*)::int
    from public.notifications n
    where n.user_id = w.profile_id and n.type = 'view'
  ), 0)
);

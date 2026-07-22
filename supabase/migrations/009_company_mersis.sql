-- Required MERSİS number for company profiles
alter table public.companies
  add column if not exists mersis_no text;

create unique index if not exists companies_mersis_no_unique
  on public.companies (mersis_no)
  where mersis_no is not null and mersis_no <> '';

comment on column public.companies.mersis_no is '16 haneli MERSİS numarası';

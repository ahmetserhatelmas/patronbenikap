-- Fix category sort_order (007 seeded used cats as 100, so defaults never applied)
update public.profession_categories set sort_order = 10 where name = 'Mühendislik';
update public.profession_categories set sort_order = 20 where name = 'Teknoloji';
update public.profession_categories set sort_order = 30 where name = 'Teknik';
update public.profession_categories set sort_order = 40 where name = 'İnşaat';
update public.profession_categories set sort_order = 50 where name = 'Sağlık';
update public.profession_categories set sort_order = 60 where name = 'Eğitim';
update public.profession_categories set sort_order = 70 where name = 'Finans';
update public.profession_categories set sort_order = 80 where name = 'Satış';
update public.profession_categories set sort_order = 90 where name = 'Tasarım';
update public.profession_categories set sort_order = 100 where name = 'Lojistik';
update public.profession_categories set sort_order = 110 where name = 'Hizmet';
update public.profession_categories set sort_order = 120 where name = 'Perakende';
update public.profession_categories set sort_order = 130 where name = 'Turizm';
update public.profession_categories set sort_order = 140 where name = 'Yönetim';
update public.profession_categories set sort_order = 999 where name = 'Diğer';

-- Pull any profession.category values still missing from the table
insert into public.profession_categories (name, slug, sort_order)
select distinct
  trim(p.category),
  lower(regexp_replace(
    translate(trim(p.category), 'çğıöşüÇĞİÖŞÜ', 'cgiosuCGIOSU'),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )),
  200
from public.professions p
where p.category is not null
  and trim(p.category) <> ''
  and not exists (
    select 1 from public.profession_categories c
    where c.name = trim(p.category)
  )
on conflict (name) do nothing;

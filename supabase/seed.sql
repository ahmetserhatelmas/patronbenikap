-- Seed professions, skills, and sample salary data

insert into public.professions (name, slug, category, is_trending, sort_order) values
  ('Makine Mühendisi', 'makine-muhendisi', 'Mühendislik', true, 1),
  ('Yazılım Geliştirici', 'yazilim-gelistirici', 'Teknoloji', true, 2),
  ('Elektrikçi', 'elektrikci', 'Teknik', true, 3),
  ('Kaynakçı', 'kaynakci', 'Teknik', false, 4),
  ('Muhasebeci', 'muhasebeci', 'Finans', false, 5),
  ('Satış Temsilcisi', 'satis-temsilcisi', 'Satış', true, 6),
  ('Grafik Tasarımcı', 'grafik-tasarimci', 'Tasarım', true, 7),
  ('Aşçı', 'asci', 'Hizmet', false, 8),
  ('Şoför', 'sofor', 'Lojistik', false, 9),
  ('İnşaat İşçisi', 'insaat-iscisi', 'İnşaat', false, 10),
  ('Hemşire', 'hemsire', 'Sağlık', true, 11),
  ('Öğretmen', 'ogretmen', 'Eğitim', false, 12),
  ('Garson', 'garson', 'Hizmet', false, 13),
  ('Depo Görevlisi', 'depo-gorevlisi', 'Lojistik', false, 14),
  ('Mimar', 'mimar', 'Tasarım', false, 15)
on conflict (slug) do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 35000, 55000, 40000 from public.professions where slug = 'makine-muhendisi'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 45000, 90000, 65000 from public.professions where slug = 'yazilim-gelistirici'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 25000, 40000, 32000 from public.professions where slug = 'elektrikci'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 28000, 45000, 35000 from public.professions where slug = 'kaynakci'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 30000, 50000, 38000 from public.professions where slug = 'muhasebeci'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 25000, 45000, 33000 from public.professions where slug = 'satis-temsilcisi'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 28000, 55000, 40000 from public.professions where slug = 'grafik-tasarimci'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 22000, 40000, 30000 from public.professions where slug = 'asci'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 25000, 40000, 32000 from public.professions where slug = 'sofor'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 22000, 35000, 28000 from public.professions where slug = 'insaat-iscisi'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 35000, 55000, 42000 from public.professions where slug = 'hemsire'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 30000, 50000, 38000 from public.professions where slug = 'ogretmen'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 20000, 32000, 25000 from public.professions where slug = 'garson'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 22000, 35000, 28000 from public.professions where slug = 'depo-gorevlisi'
on conflict do nothing;

insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select id, null, 35000, 70000, 50000 from public.professions where slug = 'mimar'
on conflict do nothing;

insert into public.skills (name, slug, category) values
  ('AutoCAD', 'autocad', 'Teknik'),
  ('SolidWorks', 'solidworks', 'Teknik'),
  ('React', 'react', 'Yazılım'),
  ('TypeScript', 'typescript', 'Yazılım'),
  ('Python', 'python', 'Yazılım'),
  ('Excel', 'excel', 'Ofis'),
  ('SAP', 'sap', 'Ofis'),
  ('Photoshop', 'photoshop', 'Tasarım'),
  ('Figma', 'figma', 'Tasarım'),
  ('Kaynak', 'kaynak', 'Teknik'),
  ('Forklift', 'forklift', 'Lojistik'),
  ('İletişim', 'iletisim', 'Yumuşak'),
  ('Takım Çalışması', 'takim-calismasi', 'Yumuşak'),
  ('Proje Yönetimi', 'proje-yonetimi', 'Yönetim'),
  ('İngilizce', 'ingilizce', 'Dil')
on conflict (slug) do nothing;

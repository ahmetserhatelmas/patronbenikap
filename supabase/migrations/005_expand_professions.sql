-- Expand the profession catalog to 100 entries.
-- Existing seed + 003 migration contain 40 professions; this adds 60.
-- Run in Supabase SQL Editor after 003_feedback_updates.sql.

insert into public.professions
  (name, slug, category, is_trending, sort_order)
values
  -- Mühendislik
  ('Bilgisayar Mühendisi', 'bilgisayar-muhendisi', 'Mühendislik', true, 41),
  ('Mekatronik Mühendisi', 'mekatronik-muhendisi', 'Mühendislik', false, 42),
  ('Kimya Mühendisi', 'kimya-muhendisi', 'Mühendislik', false, 43),
  ('Çevre Mühendisi', 'cevre-muhendisi', 'Mühendislik', false, 44),
  ('Gıda Mühendisi', 'gida-muhendisi', 'Mühendislik', false, 45),
  ('Harita Mühendisi', 'harita-muhendisi', 'Mühendislik', false, 46),
  ('Biyomedikal Mühendisi', 'biyomedikal-muhendisi', 'Mühendislik', false, 47),

  -- Teknoloji
  ('DevOps Uzmanı', 'devops-uzmani', 'Teknoloji', true, 48),
  ('Sistem Uzmanı', 'sistem-uzmani', 'Teknoloji', false, 49),
  ('Ağ Uzmanı', 'ag-uzmani', 'Teknoloji', false, 50),
  ('Siber Güvenlik Uzmanı', 'siber-guvenlik-uzmani', 'Teknoloji', true, 51),
  ('Veritabanı Yöneticisi', 'veritabani-yoneticisi', 'Teknoloji', false, 52),
  ('Yazılım Test Uzmanı', 'yazilim-test-uzmani', 'Teknoloji', false, 53),
  ('Yapay Zeka Uzmanı', 'yapay-zeka-uzmani', 'Teknoloji', true, 54),

  -- Teknik
  ('Oto Tamircisi', 'oto-tamircisi', 'Teknik', true, 55),
  ('Klima Teknisyeni', 'klima-teknisyeni', 'Teknik', false, 56),
  ('Tesisatçı', 'tesisatci', 'Teknik', true, 57),
  ('Torna Ustası', 'torna-ustasi', 'Teknik', false, 58),
  ('Bakım Teknisyeni', 'bakim-teknisyeni', 'Teknik', false, 59),
  ('Elektronik Teknisyeni', 'elektronik-teknisyeni', 'Teknik', false, 60),
  ('Asansör Teknisyeni', 'asansor-teknisyeni', 'Teknik', false, 61),

  -- Finans
  ('Finans Uzmanı', 'finans-uzmani', 'Finans', false, 62),
  ('Banka Personeli', 'banka-personeli', 'Finans', false, 63),
  ('Sigorta Uzmanı', 'sigorta-uzmani', 'Finans', false, 64),
  ('Denetçi', 'denetci', 'Finans', false, 65),

  -- Satış
  ('Satış Danışmanı', 'satis-danismani', 'Satış', true, 66),
  ('Saha Satış Uzmanı', 'saha-satis-uzmani', 'Satış', false, 67),
  ('E-ticaret Uzmanı', 'e-ticaret-uzmani', 'Satış', true, 68),
  ('İhracat Uzmanı', 'ihracat-uzmani', 'Satış', false, 69),

  -- Tasarım
  ('İç Mimar', 'ic-mimar', 'Tasarım', true, 70),
  ('Endüstriyel Tasarımcı', 'endustriyel-tasarimci', 'Tasarım', false, 71),
  ('Moda Tasarımcısı', 'moda-tasarimcisi', 'Tasarım', false, 72),
  ('Fotoğrafçı', 'fotografci', 'Tasarım', false, 73),

  -- Hizmet
  ('Fırıncı', 'firinci', 'Hizmet', false, 74),
  ('Kasap', 'kasap', 'Hizmet', false, 75),
  ('Bulaşıkçı', 'bulasikci', 'Hizmet', false, 76),
  ('Bahçıvan', 'bahcivan', 'Hizmet', false, 77),
  ('Çocuk Bakıcısı', 'cocuk-bakicisi', 'Hizmet', true, 78),

  -- Lojistik
  ('Lojistik Uzmanı', 'lojistik-uzmani', 'Lojistik', false, 79),
  ('Kurye', 'kurye', 'Lojistik', true, 80),
  ('Sevkiyat Sorumlusu', 'sevkiyat-sorumlusu', 'Lojistik', false, 81),
  ('Gümrük Müşaviri', 'gumruk-musaviri', 'Lojistik', false, 82),

  -- İnşaat
  ('Duvar Ustası', 'duvar-ustasi', 'İnşaat', false, 83),
  ('Boyacı', 'boyaci', 'İnşaat', true, 84),
  ('Sıva Ustası', 'siva-ustasi', 'İnşaat', false, 85),
  ('Marangoz', 'marangoz', 'İnşaat', true, 86),

  -- Sağlık
  ('Doktor', 'doktor', 'Sağlık', true, 87),
  ('Diş Hekimi', 'dis-hekimi', 'Sağlık', false, 88),
  ('Paramedik', 'paramedik', 'Sağlık', false, 89),
  ('Diyetisyen', 'diyetisyen', 'Sağlık', true, 90),

  -- Eğitim
  ('Okul Öncesi Öğretmeni', 'okul-oncesi-ogretmeni', 'Eğitim', false, 91),
  ('İngilizce Öğretmeni', 'ingilizce-ogretmeni', 'Eğitim', true, 92),
  ('Özel Eğitim Öğretmeni', 'ozel-egitim-ogretmeni', 'Eğitim', false, 93),

  -- Yönetim
  ('Operasyon Yöneticisi', 'operasyon-yoneticisi', 'Yönetim', false, 94),
  ('Ofis Yöneticisi', 'ofis-yoneticisi', 'Yönetim', false, 95),
  ('Proje Yöneticisi', 'proje-yoneticisi', 'Yönetim', true, 96),

  -- Perakende
  ('Mağaza Müdürü', 'magaza-muduru', 'Perakende', false, 97),
  ('Reyon Görevlisi', 'reyon-gorevlisi', 'Perakende', false, 98),

  -- Turizm
  ('Turist Rehberi', 'turist-rehberi', 'Turizm', false, 99),
  ('Kat Hizmetleri Görevlisi', 'kat-hizmetleri-gorevlisi', 'Turizm', false, 100)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  is_trending = excluded.is_trending,
  sort_order = excluded.sort_order;

-- Estimated salaries for every profession (city = null = nationwide average)
-- Skips professions that already have a nationwide range.
with salary_seed (slug, min_salary, max_salary, avg_salary) as (
  values
    -- Seed
    ('makine-muhendisi', 35000, 55000, 40000),
    ('yazilim-gelistirici', 45000, 90000, 65000),
    ('elektrikci', 25000, 40000, 32000),
    ('kaynakci', 28000, 45000, 35000),
    ('muhasebeci', 30000, 50000, 38000),
    ('satis-temsilcisi', 25000, 45000, 33000),
    ('grafik-tasarimci', 28000, 55000, 40000),
    ('asci', 22000, 40000, 30000),
    ('sofor', 25000, 40000, 32000),
    ('insaat-iscisi', 22000, 35000, 28000),
    ('hemsire', 35000, 55000, 42000),
    ('ogretmen', 30000, 50000, 38000),
    ('garson', 20000, 32000, 25000),
    ('depo-gorevlisi', 22000, 35000, 28000),
    ('mimar', 35000, 70000, 50000),
    -- 003
    ('frontend-gelistirici', 40000, 80000, 55000),
    ('backend-gelistirici', 45000, 90000, 60000),
    ('mobil-gelistirici', 40000, 85000, 58000),
    ('veri-analisti', 38000, 75000, 52000),
    ('insan-kaynaklari', 32000, 55000, 42000),
    ('pazarlama-uzmani', 28000, 50000, 36000),
    ('dijital-pazarlama', 28000, 52000, 38000),
    ('musteri-hizmetleri', 22000, 35000, 28000),
    ('kasiyer', 22000, 35000, 28000),
    ('temizlik-gorevlisi', 20000, 30000, 24000),
    ('guvenlik-gorevlisi', 22000, 32000, 26000),
    ('kuafor', 22000, 40000, 30000),
    ('eczaci', 40000, 70000, 52000),
    ('fizyoterapist', 35000, 60000, 45000),
    ('insaat-muhendisi', 35000, 60000, 45000),
    ('elektrik-muhendisi', 35000, 60000, 45000),
    ('endustri-muhendisi', 35000, 60000, 44000),
    ('cnc-operatoru', 28000, 45000, 35000),
    ('teknisyen', 25000, 40000, 32000),
    ('forklift-operatoru', 24000, 38000, 30000),
    ('kargo-gorevlisi', 22000, 34000, 27000),
    ('hostes-host', 25000, 42000, 32000),
    ('resepsiyonist', 23000, 38000, 30000),
    ('barista', 22000, 32000, 26000),
    ('pastaci', 23000, 38000, 30000),
    -- 005 Mühendislik
    ('bilgisayar-muhendisi', 45000, 90000, 62000),
    ('mekatronik-muhendisi', 38000, 65000, 48000),
    ('kimya-muhendisi', 36000, 62000, 46000),
    ('cevre-muhendisi', 34000, 58000, 44000),
    ('gida-muhendisi', 34000, 58000, 44000),
    ('harita-muhendisi', 34000, 58000, 43000),
    ('biyomedikal-muhendisi', 38000, 70000, 50000),
    -- 005 Teknoloji
    ('devops-uzmani', 50000, 100000, 70000),
    ('sistem-uzmani', 38000, 70000, 50000),
    ('ag-uzmani', 36000, 65000, 48000),
    ('siber-guvenlik-uzmani', 50000, 110000, 75000),
    ('veritabani-yoneticisi', 45000, 90000, 65000),
    ('yazilim-test-uzmani', 35000, 65000, 48000),
    ('yapay-zeka-uzmani', 55000, 120000, 80000),
    -- 005 Teknik
    ('oto-tamircisi', 25000, 45000, 34000),
    ('klima-teknisyeni', 25000, 42000, 33000),
    ('tesisatci', 25000, 45000, 34000),
    ('torna-ustasi', 28000, 48000, 36000),
    ('bakim-teknisyeni', 26000, 42000, 33000),
    ('elektronik-teknisyeni', 27000, 45000, 35000),
    ('asansor-teknisyeni', 28000, 48000, 36000),
    -- 005 Finans
    ('finans-uzmani', 35000, 65000, 48000),
    ('banka-personeli', 30000, 50000, 38000),
    ('sigorta-uzmani', 28000, 50000, 36000),
    ('denetci', 40000, 75000, 55000),
    -- 005 Satış
    ('satis-danismani', 25000, 45000, 33000),
    ('saha-satis-uzmani', 26000, 48000, 35000),
    ('e-ticaret-uzmani', 30000, 55000, 40000),
    ('ihracat-uzmani', 35000, 65000, 48000),
    -- 005 Tasarım
    ('ic-mimar', 35000, 70000, 50000),
    ('endustriyel-tasarimci', 32000, 60000, 45000),
    ('moda-tasarimcisi', 28000, 55000, 40000),
    ('fotografci', 25000, 50000, 35000),
    -- 005 Hizmet
    ('firinci', 22000, 36000, 28000),
    ('kasap', 23000, 38000, 30000),
    ('bulasikci', 20000, 28000, 23000),
    ('bahcivan', 22000, 35000, 27000),
    ('cocuk-bakicisi', 22000, 38000, 28000),
    -- 005 Lojistik
    ('lojistik-uzmani', 30000, 55000, 40000),
    ('kurye', 22000, 35000, 27000),
    ('sevkiyat-sorumlusu', 28000, 48000, 36000),
    ('gumruk-musaviri', 40000, 75000, 55000),
    -- 005 İnşaat
    ('duvar-ustasi', 25000, 42000, 32000),
    ('boyaci', 24000, 40000, 30000),
    ('siva-ustasi', 24000, 40000, 30000),
    ('marangoz', 25000, 45000, 34000),
    -- 005 Sağlık
    ('doktor', 60000, 150000, 90000),
    ('dis-hekimi', 50000, 120000, 80000),
    ('paramedik', 30000, 50000, 38000),
    ('diyetisyen', 30000, 55000, 40000),
    -- 005 Eğitim
    ('okul-oncesi-ogretmeni', 28000, 45000, 35000),
    ('ingilizce-ogretmeni', 30000, 55000, 40000),
    ('ozel-egitim-ogretmeni', 30000, 52000, 38000),
    -- 005 Yönetim
    ('operasyon-yoneticisi', 40000, 80000, 55000),
    ('ofis-yoneticisi', 30000, 55000, 40000),
    ('proje-yoneticisi', 45000, 90000, 65000),
    -- 005 Perakende
    ('magaza-muduru', 32000, 60000, 45000),
    ('reyon-gorevlisi', 22000, 34000, 27000),
    -- 005 Turizm
    ('turist-rehberi', 25000, 45000, 34000),
    ('kat-hizmetleri-gorevlisi', 22000, 34000, 27000)
)
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select p.id, null, s.min_salary, s.max_salary, s.avg_salary
from salary_seed s
join public.professions p on p.slug = s.slug
where not exists (
  select 1
  from public.salary_ranges sr
  where sr.profession_id = p.id
    and sr.city is null
);

-- Fallback: any profession still missing a salary range gets a category default
insert into public.salary_ranges (profession_id, city, min_salary, max_salary, avg_salary)
select
  p.id,
  null,
  case coalesce(p.category, 'Diğer')
    when 'Mühendislik' then 35000
    when 'Teknoloji' then 40000
    when 'Teknik' then 25000
    when 'Finans' then 30000
    when 'Satış' then 25000
    when 'Tasarım' then 28000
    when 'Hizmet' then 22000
    when 'Lojistik' then 23000
    when 'İnşaat' then 24000
    when 'Sağlık' then 35000
    when 'Eğitim' then 30000
    when 'Yönetim' then 35000
    when 'Perakende' then 22000
    when 'Turizm' then 23000
    else 22000
  end,
  case coalesce(p.category, 'Diğer')
    when 'Mühendislik' then 60000
    when 'Teknoloji' then 85000
    when 'Teknik' then 42000
    when 'Finans' then 55000
    when 'Satış' then 48000
    when 'Tasarım' then 55000
    when 'Hizmet' then 36000
    when 'Lojistik' then 40000
    when 'İnşaat' then 40000
    when 'Sağlık' then 70000
    when 'Eğitim' then 50000
    when 'Yönetim' then 70000
    when 'Perakende' then 40000
    when 'Turizm' then 40000
    else 35000
  end,
  case coalesce(p.category, 'Diğer')
    when 'Mühendislik' then 45000
    when 'Teknoloji' then 58000
    when 'Teknik' then 33000
    when 'Finans' then 40000
    when 'Satış' then 34000
    when 'Tasarım' then 40000
    when 'Hizmet' then 28000
    when 'Lojistik' then 30000
    when 'İnşaat' then 30000
    when 'Sağlık' then 48000
    when 'Eğitim' then 38000
    when 'Yönetim' then 50000
    when 'Perakende' then 28000
    when 'Turizm' then 30000
    else 28000
  end
from public.professions p
where not exists (
  select 1
  from public.salary_ranges sr
  where sr.profession_id = p.id
    and sr.city is null
);

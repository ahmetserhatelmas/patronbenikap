-- Blog SEO: categories + diversified seed posts
-- Run in Supabase SQL Editor

alter table public.blog_posts
  add column if not exists category text not null default 'meslek-rehberi';

alter table public.blog_posts
  add column if not exists meta_title text;

alter table public.blog_posts
  add column if not exists meta_description text;

create index if not exists blog_posts_category_idx
  on public.blog_posts (category)
  where is_published = true;

-- Backfill existing profession posts
update public.blog_posts
set category = 'meslek-rehberi'
where category is null or category = '';

-- Diversified SEO posts (long-tail TR keywords)
insert into public.blog_posts (
  title, slug, excerpt, content, category, profession_slug, meta_title, meta_description
) values
(
  'Türkiye’de Meslek Maaşları: 2026 Rehberi',
  'turkiyede-meslek-maaslari-2026',
  'Popüler mesleklerde ortalama maaş aralıkları, şehir farkları ve beklenti nasıl belirlenir?',
  E'## Türkiye’de meslek maaşları (2026)\n\nMaaş beklentisi, işe alımda en kritik konulardan biri. Hem işçiler hem firmalar için net bir aralık bilmek süreci hızlandırır.\n\n### Maaşı etkileyen faktörler\n\n1. **Şehir** — İstanbul, Ankara, İzmir genelde daha yüksek; Anadolu’da yaşam maliyeti farkı vardır.\n2. **Deneyim** — 0–2 yıl, 3–5 yıl ve 5+ yıl dilimleri belirgin şekilde ayrılır.\n3. **Vardiya / gece** — Vardiyalı ve ağır işlerde ek ödeme yaygın.\n4. **Sertifika** — MYK, SRC, kaynak, CNC gibi belgeler teklifi yükseltir.\n\n### Profilinde maaş nasıl yazılmalı?\n\n- Gerçekçi bir aralık seç (aşırı yüksek filtre dışı bırakabilir).\n- Mesleğine göre ortalama bandı bil; Patron Beni Kap profilinde meslek seçince ortalama ipucu görürsün.\n- Net / brüt karışıklığını netleştir; telefon görüşmesinde sorulacak ilk konulardan biridir.\n\n### Sonraki adım\n\nProfilini güncelle, beklenen maaşı yaz ve görünür tut. Doğru aralık + doğru meslek = daha nitelikli firma mesajı.',
  'maas-rehberi',
  null,
  'Türkiye’de Meslek Maaşları 2026 | Patron Beni Kap',
  '2026 meslek maaş rehberi: şehir, deneyim ve vardiyaya göre maaş nasıl belirlenir? İşçi ve firmalar için pratik ipuçları.'
),
(
  'CNC Operatörü Maaşı ve İş İmkanları',
  'cnc-operatoru-maasi-ve-is-imkanlari',
  'CNC operatörü ne iş yapar, hangi beceriler istenir, maaş aralığı nasıl şekillenir?',
  E'## CNC operatörü kariyer rehberi\n\nCNC operatörlüğü, üretim ve metal işleme sektöründe sürekli aranan mesleklerden. Ölçüm, program okuma ve makine güvenliği temel becerilerdir.\n\n### Öne çıkan yetenekler\n\n- Teknik resim okuma\n- Kalite kontrol bilinci\n- Fanuc / Siemens panel deneyimi\n- Vardiyalı çalışmaya açıklık\n\n### İş bulmayı hızlandıran profil ipuçları\n\nProfilinde uzmanlıkları (torna, freze, 3 eksen vb.) virgülle yaz. Sertifikalarını ekle. Şehir ve müsaitlik alanını doldur.\n\nFirmalar CV yığını yerine net profil arıyor — görünür bir CNC profili doğrudan mesaj getirir.',
  'maas-rehberi',
  'cnc-operatoru',
  'CNC Operatörü Maaşı ve İş İmkanları 2026',
  'CNC operatörü maaşı, gerekli beceriler ve iş imkanları. Profilini güçlendirip firmaların seni bulmasını sağla.'
),
(
  'Kaynakçı Olmak: Belge, Deneyim ve İş Bulma',
  'kaynakci-olmak-belge-deneyim',
  'Kaynakçılıkta hangi belgeler işe yarar, firmalar neye bakar, profil nasıl hazırlanır?',
  E'## Kaynakçı mesleğine giriş\n\nİnşaat, gemi, otomotiv ve imalatta kaynakçı talebi yüksektir. Doğru belge + güvenli çalışma bilgisi fark yaratır.\n\n### Sık aranan belgeler\n\n- MYK kaynakçılık yeterlilikleri\n- İSG eğitimleri\n- Argon / elektrik / gazaltı deneyimi\n\n### Firma gözüyle iyi aday\n\nFirmalar “yapabilirim” demekten çok somut makine/ süreç deneyimi ister. Profilinde kaynak türlerini, sektörlerini ve şehirini net yaz.\n\nPatron Beni Kap’ta profilini tamamlayıp görünür bırak; şantiye ve atölye ekipleri seni doğrudan bulsun.',
  'meslek-rehberi',
  'kaynakci',
  'Kaynakçı Olmak: Belge ve İş Bulma Rehberi',
  'Kaynakçı olmak için belgeler, deneyim ve iş bulma ipuçları. Firmaların aradığı profil nasıl hazırlanır?'
),
(
  'CV Yerine Dijital İşçi Profili: Neden Daha Etkili?',
  'cv-yerine-dijital-isci-profili',
  'Klasik CV yerine güncel, aranabilir profil ile firmalar seni daha hızlı bulur.',
  E'## CV yetmiyor: görünür profil dönemi\n\nKlasik PDF CV’ler güncellenmez, arama motoruna girmez ve firmada kaybolur. Dijital profil ise filtrelenebilir ve her zaman güncel kalır.\n\n### İyi bir işçi profilinde olmalı\n\n1. Net meslek ve uzmanlıklar\n2. Şehir / ilçe\n3. Deneyim yılı ve beklenen maaş\n4. Telefon / WhatsApp\n5. Vardiya ve müsaitlik\n6. Kısa “hakkımda” metni (en az 20 karakter, mümkünse 3–4 cümle)\n\n### SEO açısından da avantaj\n\nHerkese açık profil sayfan meslek + şehir aramalarında görünürlük sağlar. Yani sadece platform içi değil, Google tarafında da fırsat yaratır.\n\nHemen profilini tamamla: birkaç dakika, uzun vadeli görünürlük.',
  'kariyer-ipuclari',
  null,
  'CV Yerine Dijital İşçi Profili | Kariyer İpuçları',
  'CV yerine dijital işçi profili neden daha etkili? Firmaların seni bulması için profilini nasıl güçlendirirsin?'
),
(
  'İş Görüşmesine Gitmeden Önce: 10 Pratik Kontrol',
  'is-gorusmesi-oncesi-kontrol-listesi',
  'Görüşme öncesi hazırlık checklist’i: iletişim, maaş, deneyim örnekleri ve sorulacak sorular.',
  E'## İş görüşmesi öncesi kontrol listesi\n\n1. Telefonunun açık ve WhatsApp’ın aktif olduğundan emin ol.\n2. Meslek ve deneyim cümleni 30 saniyede anlatabilecek şekilde hazırla.\n3. Son işindeki somut bir başarıyı örnekle.\n4. Maaş aralığını önceden belirle.\n5. Vardiya / ulaşım kısıtlarını netleştir.\n6. Sertifika ve belgeleri yanına al veya fotoğrafla.\n7. Firma adını ve sektörünü hızlıca araştır.\n8. Soracağın 2 soruyu hazırla (çalışma saatleri, ekip).\n9. Görünüm ve zamanında olma — hâlâ ilk izlenimdir.\n10. Görüşme sonrası kısa teşekkür / dönüş mesajı at.\n\nProfilin güncelse firma zaten seni seçmiş demektir; görüşmede sadece teyit edilir.',
  'kariyer-ipuclari',
  null,
  'İş Görüşmesi Öncesi 10 Pratik Kontrol',
  'İş görüşmesine gitmeden önce yapılacaklar. Maaş, deneyim ve iletişim için pratik checklist.'
),
(
  'Vardiyalı İş Nedir? Avantajları ve Dikkat Edilecekler',
  'vardiyali-is-nedir-avantajlari',
  'Vardiyalı çalışmaya uygun musun? Gece / dönüşümlü vardiya arayan firmalar seni nasıl bulur?',
  E'## Vardiyalı iş rehberi\n\nÜretim, lojistik, sağlık, güvenlik ve hizmet sektöründe vardiya yaygındır. Firmalar “vardiyaya uygun” adayları özellikle arar.\n\n### Avantajlar\n\n- Daha fazla açık pozisyon\n- Gece / hafta sonu ek ödemeleri\n- Hızlı işe başlangıç şansı\n\n### Dikkat\n\nUyku düzeni, ulaşım ve aile planı gerçekçi olmalı. Profilinde “vardiyalı çalışmaya uygun” seçeneğini açarsan doğru firmalar seni filtreler.\n\nPatron Beni Kap’ta bu alanı işaretlemek, gereksiz mesajları azaltır; nitelikli eşleşmeyi artırır.',
  'is-arama',
  null,
  'Vardiyalı İş Nedir? Avantajları ve İpuçları',
  'Vardiyalı iş nedir, kimlere uyar, firmalar nasıl arar? Profilinde vardiya bilgisini neden belirtmelisin?'
),
(
  'İstanbul, Ankara, İzmir: Şehre Göre İş Bulma Stratejisi',
  'istanbul-ankara-izmir-is-bulma',
  'Büyük şehirlerde iş ararken meslek + ilçe + ulaşım üçlüsü neden kritik?',
  E'## Şehre göre iş arama\n\nTürkiye’de iş piyasası şehre göre değişir. Aynı meslek İstanbul’da farklı, Anadolu’da farklı tempo ve maaş bandı taşır.\n\n### İstanbul\n\nYoğun rekabet + çok ilan. İlçe ve ulaşım (metro, metrobüs) belirtmek fark yaratır.\n\n### Ankara\n\nKamu çevresi, üretim ve hizmet dengeli. Net deneyim ve askerlik durumu sık sorulur.\n\n### İzmir\n\nTurizm, üretim ve lojistik güçlü. Sezonluk / vardiyalı roller için müsaitlik önemli.\n\n### Pratik öneri\n\nProfilinde şehri ve mümkünse ilçeyi doldur. Firmalar önce lokasyona göre ezer; sonra mesleğe bakar.\n\nDoğru şehir bilgisi = daha az boş mesaj, daha çok gerçek görüşme.',
  'is-arama',
  null,
  'İstanbul Ankara İzmir İş Bulma Stratejisi',
  'İstanbul, Ankara ve İzmir’de iş bulma stratejisi. Şehir, ilçe ve meslek bilgisini profilde nasıl kullanırsın?'
),
(
  'Firmalar İçin: Doğru İşçiyi Dakikalar İçinde Bulmak',
  'firmalar-icin-dogru-isciyi-bulmak',
  'İlan sitesi karmaşası yerine filtreli işçi arama: meslek, şehir, maaş ve vardiya ile nasıl daraltırsın?',
  E'## Firma tarafı: hızlı ve doğru eşleşme\n\nGeleneksel ilan modelinde yüzlerce alakasız başvuru gelir. Patron Beni Kap’ta tersine işler: işçiler profilini yayınlar, sen filtreleyip ulaşırsın.\n\n### Etkili arama sırası\n\n1. Meslek seç\n2. Şehir / ilçe daralt\n3. Deneyim ve maaş aralığı koy\n4. Vardiya ihtiyacını işaretle\n5. Uygun adayları favorile, mesaj at\n\n### Doğrulama\n\nMERSİS ile doğrulanmış firmalar arama özelliğini kullanır. Bu hem güven hem kalite içindir.\n\nİşe alım süreni kısaltmak için önce net kriter, sonra kısa mesaj — uzun e-posta zinciri gerekmez.',
  'firma-rehberi',
  null,
  'Firmalar İçin Doğru İşçi Bulma Rehberi',
  'Firmalar için doğru işçiyi bulma: meslek, şehir, maaş ve vardiya filtreleriyle hızlı işe alım.'
),
(
  'WhatsApp ile İş İletişimi: Profesyonel Kalmanın Yolları',
  'whatsapp-ile-is-iletisimi',
  'İş için WhatsApp kullanırken ilk mesaj, saat aralığı ve netlik nasıl olmalı?',
  E'## WhatsApp iş görüşmelerinde\n\nTürkiye’de iş iletişiminin büyük kısmı WhatsApp’tan yürür. Hızlıdır ama yanlış kullanılırsa amatör durur.\n\n### İşçiysen\n\n- Profilinde güncel numara olsun\n- İlk cevapta meslek + müsaitlik yaz\n- Gece geç saatlerde “şimdi arayın” deme; randevu öner\n\n### Firmaysan\n\n- Kim olduğunu ve hangi pozisyon için yazdığını ilk mesajda belirt\n- Tek mesajda konum / vardiya / maaş bandını özetle\n- Platform içi mesajlaşmayı da kullan; kayıtlı kalsın\n\nKısa, net, saygılı iletişim her iki tarafı da kazandırır.',
  'kariyer-ipuclari',
  null,
  'WhatsApp ile İş İletişimi Rehberi',
  'WhatsApp ile iş iletişiminde profesyonel kalma ipuçları. İşçi ve firmalar için ilk mesaj örnekleri.'
),
(
  'Garson ve Cafe Personeli Maaş / Bahşiş Gerçeği',
  'garson-cafe-personeli-maas-bahsis',
  'Hizmet sektöründe maaş + bahşiş dengesi, sezon etkisi ve profilde öne çıkma yolları.',
  E'## Garson ve cafe personeli kazancı\n\nHizmette gelir çoğu zaman maaş + bahşiş kombinasyonudur. Turizm bölgelerinde sezon farkı büyüktür.\n\n### Firmaların baktığı özellikler\n\n- Güler yüz ve tempo\n- Dil (özellikle turizm)\n- Vardiya / hafta sonu uygunluğu\n- Hijyen ve ekip uyumu\n\n### Profil ipucu\n\n“Hakkımda” kısmında hangi ortamda çalıştığını yaz (cafe, otel, fine dining). Vardiya seçeneğini aç.\n\nDoğru şehir + müsaitlik ile cafe ve restoranlar seni hızlıca bulur.',
  'maas-rehberi',
  'garson',
  'Garson ve Cafe Personeli Maaş Rehberi',
  'Garson maaşı, bahşiş ve sezon etkisi. Cafe personeli olarak profilini nasıl güçlendirirsin?'
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  category = excluded.category,
  profession_slug = excluded.profession_slug,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = now();

-- Tag existing seed posts with categories + better meta
update public.blog_posts set
  category = 'meslek-rehberi',
  meta_title = 'Yazılım Geliştirici Olmak: Nereden Başlamalı?',
  meta_description = 'Yazılım geliştirici olmak isteyenler için yol haritası: dil seçimi, portföy ve görünür profil.'
where slug = 'yazilim-gelistirici-nereden-baslamali';

update public.blog_posts set
  category = 'meslek-rehberi',
  meta_title = 'Elektrikçi Sertifikaları Neden Önemli?',
  meta_description = 'Elektrikçilikte MYK ve İSG sertifikaları neden kritik? İş bulmayı kolaylaştıran belgeler.'
where slug = 'elektrikci-sertifikalar';

update public.blog_posts set
  category = 'meslek-rehberi',
  meta_title = 'Garson ve Servis Personeli İpuçları',
  meta_description = 'Garson ve servis personeli olarak öne çıkma ipuçları: iletişim, vardiya ve dil.'
where slug = 'garson-ipuclari';

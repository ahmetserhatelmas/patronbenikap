# Patron Beni Kap

> **İşi değil, iş seni bulsun.**

Modern, sade bir işçi–firma buluşma platformu. Next.js 15, TypeScript, TailwindCSS, shadcn/ui ve Supabase ile geliştirilmiştir.

## Özellikler

- **İşçi profilleri** — Dakikalar içinde tamamlanan sade profil
- **Firma paneli** — Arama, filtreleme, favoriler
- **Akıllı maaş bilgisi** — Mesleğe göre ortalama maaş
- **Gerçek zamanlı mesajlaşma** — Supabase Realtime
- **Bildirimler** — Profil görüntüleme, mesaj, favori
- **Admin paneli** — Kullanıcı, firma, meslek, maaş yönetimi
- **SEO** — Metadata, Open Graph, sitemap, robots.txt
- **Dark mode** — Tema desteği
- **QR kod & paylaşım** — Profil paylaşımı

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase

1. [supabase.com](https://supabase.com) üzerinde proje oluştur
2. SQL Editor'de sırasıyla çalıştır:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/seed.sql`
3. Authentication → Providers: Email + Google'ı aç
4. Storage bucket'ları oluştur: `avatars`, `portfolio`, `cvs`, `company-logos` (public)

### 3. Ortam değişkenleri

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Çalıştır

```bash
npm run dev
```

## Klasör yapısı

```
src/
├── app/                  # App Router sayfaları
│   ├── (auth)/           # Giriş, kayıt, şifre
│   ├── (dashboard)/      # İşçi, firma, admin panelleri
│   └── isci/[slug]/      # Genel profil sayfası
├── components/
│   ├── landing/          # Ana sayfa bölümleri
│   ├── auth/             # Auth formları
│   ├── worker/           # İşçi UI
│   ├── company/          # Firma UI
│   ├── messaging/        # Sohbet
│   └── ui/               # shadcn bileşenleri
├── lib/
│   ├── actions/          # Server Actions
│   ├── supabase/         # Client / server / middleware
│   └── validations/      # Zod şemaları
└── types/                # TypeScript tipleri
```

## Admin yapmak

Supabase SQL:

```sql
update public.profiles set role = 'admin' where email = 'sen@email.com';
```

## Renkler

| Rol | Hex |
|-----|-----|
| Primary (yeşil) | `#3CB371` |
| Secondary (turuncu) | `#F97316` |
| Background | Beyaz |

## Lisans

Private — tüm hakları saklıdır.

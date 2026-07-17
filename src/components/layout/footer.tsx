import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              PB
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Patron Beni Kap
            </span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            İşi değil, iş seni bulsun. Profesyonel profilini dakikalar içinde
            oluştur, firmalar seni keşfetsin.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/kayit" className="hover:text-primary transition-colors">
                Profil Oluştur
              </Link>
            </li>
            <li>
              <Link href="/kayit?role=company" className="hover:text-primary transition-colors">
                İşçi Ara
              </Link>
            </li>
            <li>
              <Link href="/#nasil-calisir" className="hover:text-primary transition-colors">
                Nasıl Çalışır
              </Link>
            </li>
            <li>
              <Link href="/#sss" className="hover:text-primary transition-colors">
                SSS
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Yasal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/gizlilik" className="hover:text-primary transition-colors">
                Gizlilik
              </Link>
            </li>
            <li>
              <Link href="/kullanim-kosullari" className="hover:text-primary transition-colors">
                Kullanım Koşulları
              </Link>
            </li>
            <li>
              <a href="mailto:merhaba@patronbenikap.com" className="hover:text-primary transition-colors">
                İletişim
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Patron Beni Kap. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Patron Beni Kap gizlilik politikası — işçi ve firma verilerinin korunması.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Gizlilik Politikası" updated="20 Temmuz 2026">
      <LegalSection title="1. Kapsam">
        <p>
          Bu Gizlilik Politikası, Patron Beni Kap (“Platform”, “biz”)
          üzerinden sunulan hizmetlerde kişisel verilerinizin nasıl
          toplandığını, kullanıldığını, saklandığını ve paylaşıldığını
          açıklar. Platform; işçilerin profesyonel profil oluşturduğu ve
          firmaların bu profilleri inceleyerek iletişim kurduğu bir
          buluşma hizmetidir.
        </p>
        <p>
          KVKK kapsamında aydınlatma metnine ayrıca{" "}
          <a href="/aydinlatma-metni" className="font-medium text-primary hover:underline">
            Aydınlatma Metni
          </a>{" "}
          sayfasından ulaşabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="2. İşçi hesaplarında işlenen veriler">
        <p>
          İşçi olarak kayıt olduğunuzda ve profilinizi oluşturduğunuzda
          özellikle şu veriler işlenebilir:
        </p>
        <ul>
          <li>Kimlik ve iletişim: ad, soyad, e-posta, telefon, WhatsApp</li>
          <li>
            Mesleki bilgiler: meslek, deneyim, eğitim, diller, ehliyet,
            askerlik durumu, beklenen maaş, müsaitlik, hakkımda metni,
            yetenekler, sertifikalar, portfolyo görselleri, CV
          </li>
          <li>Konum: şehir, ilçe</li>
          <li>
            Platform kullanımı: profil görünürlüğü tercihi, görüntülenme ve
            favori sayıları, mesajlar, bildirimler
          </li>
          <li>Hesap teknik verileri: oturum, güvenlik ve log kayıtları</li>
        </ul>
        <p>
          <strong>Önemli:</strong> Profilinizi görünür yaptığınızda ad,
          meslek, deneyim, iletişim (telefon/WhatsApp) ve paylaştığınız
          diğer profil alanları kayıtlı firmalar tarafından görülebilir.
          Görünürlüğü istediğiniz zaman kapatabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="3. Firma hesaplarında işlenen veriler">
        <p>Firma hesaplarında özellikle şu veriler işlenebilir:</p>
        <ul>
          <li>
            Yetkili ve hesap: yetkili adı, e-posta, telefon, şifre (şifreli)
          </li>
          <li>
            Firma bilgileri: unvan, sektör, şehir, açıklama, web sitesi,
            logo, çalışan sayısı
          </li>
          <li>
            Platform kullanımı: işçi arama, favoriler, mesajlaşma,
            profil görüntüleme kayıtları
          </li>
        </ul>
        <p>
          Firmalar, işçilerden elde ettikleri iletişim bilgilerini yalnızca
          işe alım / iş teklifi amacıyla kullanmayı kabul eder; bu verileri
          üçüncü kişilere satamaz veya pazarlama listelerinde kullanamaz.
        </p>
      </LegalSection>

      <LegalSection title="4. Verilerin kullanılma amaçları">
        <ul>
          <li>Üyelik oluşturma, kimlik doğrulama ve hesabı yönetme</li>
          <li>İşçi–firma eşleşmesi ve profil keşfi</li>
          <li>Mesajlaşma, bildirim ve iletişim kolaylığı</li>
          <li>Güvenlik, kötüye kullanımın önlenmesi ve destek</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Hizmetin iyileştirilmesi (anonim/istatistiksel analizler)</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Paylaşım">
        <p>Verileriniz şu durumlarda paylaşılabilir:</p>
        <ul>
          <li>
            <strong>İşçi profili:</strong> Görünür profiller, kayıtlı
            firmalara sunulur
          </li>
          <li>
            <strong>Mesajlaşma:</strong> Konuşma tarafı olan işçi ve firma
            arasında
          </li>
          <li>
            <strong>Altyapı sağlayıcıları:</strong> Barındırma, veritabanı,
            e-posta gibi hizmetler için (ör. Supabase/Vercel) gerekli ölçüde
          </li>
          <li>
            <strong>Yasal zorunluluk:</strong> Yetkili mercilerin talebi
          </li>
        </ul>
        <p>Verilerinizi reklam ağlarına satmayız.</p>
      </LegalSection>

      <LegalSection title="6. Çerezler ve benzeri teknolojiler">
        <p>
          Oturum yönetimi, güvenlik ve temel site işlevleri için zorunlu
          çerezler kullanırız. Tercihleriniz (ör. yasal bilgilendirme
          bandını kapattığınız bilgisi) tarayıcınızda saklanabilir.
        </p>
      </LegalSection>

      <LegalSection title="7. Saklama ve güvenlik">
        <p>
          Veriler, hesabınız aktif olduğu sürece ve yasal saklama
          sürelerince tutulur. Hesabınızı sildiğinizde, yasal zorunluluklar
          saklı kalmak kaydıyla verileriniz silinir veya anonimleştirilir.
          Makul teknik ve idari güvenlik önlemleri uygulanır; internet
          üzerinden %100 güvenlik garanti edilemez.
        </p>
      </LegalSection>

      <LegalSection title="8. Haklarınız">
        <p>
          KVKK md. 11 kapsamında erişim, düzeltme, silme, işlemenin
          kısıtlanması, itiraz ve şikâyet haklarına sahipsiniz. Talepleriniz
          için{" "}
          <a
            href="mailto:merhaba@patronbenikap.com"
            className="font-medium text-primary hover:underline"
          >
            merhaba@patronbenikap.com
          </a>{" "}
          adresine yazabilirsiniz. Ayrıntılar için Aydınlatma Metni’ne
          bakınız.
        </p>
      </LegalSection>

      <LegalSection title="9. Değişiklikler">
        <p>
          Bu politika güncellenebilir. Önemli değişikliklerde Platform
          üzerinden bilgilendirme yapılır. Güncel metin bu sayfada yayınlanır.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Aydınlatma Metni (KVKK)",
  description:
    "6698 sayılı KVKK kapsamında Patron Beni Kap kişisel veri aydınlatma metni.",
};

export default function ClarificationPage() {
  return (
    <LegalDoc title="Aydınlatma Metni (KVKK)" updated="20 Temmuz 2026">
      <LegalSection title="1. Veri sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca
          kişisel verileriniz; Patron Beni Kap platformunu işleten veri
          sorumlusu sıfatıyla işlenmektedir. İletişim:{" "}
          <a
            href="mailto:merhaba@patronbenikap.com"
            className="font-medium text-primary hover:underline"
          >
            merhaba@patronbenikap.com
          </a>
          .
        </p>
        <p className="text-sm">
          Not: Ticari unvan, MERSİS ve açık adres bilgileri resmi işletme
          kayıtlarına göre güncellenecek olup talep halinde ayrıca
          paylaşılır.
        </p>
      </LegalSection>

      <LegalSection title="2. İşlenen kişisel veri kategorileri">
        <p>
          <strong>İşçi üyeler:</strong> kimlik (ad soyad), iletişim
          (e-posta, telefon, WhatsApp), mesleki deneyim ve özgeçmiş
          bilgileri, konum (şehir/ilçe), görsel/CV içerikleri, mesaj
          içerikleri, işlem güvenliği verileri.
        </p>
        <p>
          <strong>Firma üyeler:</strong> yetkili kimlik/iletişim bilgileri,
          firma tanıtım bilgileri, arama ve favori işlemleri, mesaj
          içerikleri, işlem güvenliği verileri.
        </p>
      </LegalSection>

      <LegalSection title="3. İşleme amaçları">
        <ul>
          <li>Üyelik sözleşmesinin kurulması ve ifası</li>
          <li>İşçi profilinin firmalara sunulması (görünürlük açıksa)</li>
          <li>Firma–işçi iletişiminin sağlanması</li>
          <li>Bildirim, destek ve güvenlik süreçleri</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Hukuki sebepler">
        <p>KVKK md. 5 kapsamında verileriniz özellikle şu hukuki sebeplere
          dayanılarak işlenir:</p>
        <ul>
          <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
          <li>Veri sorumlusunun hukuki yükümlülüğü</li>
          <li>
            Meşru menfaat (güvenlik, hizmet iyileştirme — temel haklara zarar
            vermemek kaydıyla)
          </li>
          <li>
            Açık rıza (ör. profilin görünür yapılıp iletişim bilgilerinin
            firmalarla paylaşılması gibi hallerde gerektiğinde)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Aktarım">
        <p>
          Verileriniz; hizmetin sunulması için yurt içi/yurt dışı bulut ve
          altyapı sağlayıcılarına (barındırma, veritabanı, e-posta) KVKK’ya
          uygun şekilde aktarılabilir. Görünür işçi profilleri kayıtlı
          firmalarla paylaşılır. Yasal mercilere zorunlu hallerde bilgi
          verilebilir.
        </p>
      </LegalSection>

      <LegalSection title="6. Toplama yöntemi">
        <p>
          Veriler; kayıt formu, profil düzenleme formları, mesajlaşma,
          site/uygulama kullanımı ve çerezler yoluyla elektronik ortamda
          otomatik veya kısmen otomatik yollarla toplanır.
        </p>
      </LegalSection>

      <LegalSection title="7. Saklama süresi">
        <p>
          Veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta
          öngörülen zamanaşımı / saklama süreleri boyunca tutulur; süre
          sonunda silinir, yok edilir veya anonim hale getirilir.
        </p>
      </LegalSection>

      <LegalSection title="8. İlgili kişinin hakları">
        <p>KVKK md. 11 uyarınca:</p>
        <ul>
          <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>KVKK md. 7 kapsamında silinmesini/yok edilmesini isteme</li>
          <li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>Otomatik sistemler sonucu aleyhe bir sonucun çıkmasına itiraz</li>
          <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
        </ul>
        <p>
          Başvurularınızı{" "}
          <a
            href="mailto:merhaba@patronbenikap.com"
            className="font-medium text-primary hover:underline"
          >
            merhaba@patronbenikap.com
          </a>{" "}
          adresine iletebilirsiniz. Talepler KVKK ve ilgili yönetmelik
          süreleri içinde yanıtlanır. Sonuçtan memnun kalmazsanız Kişisel
          Verileri Koruma Kurulu’na şikâyette bulunabilirsiniz.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

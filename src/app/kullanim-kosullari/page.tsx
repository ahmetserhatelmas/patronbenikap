import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "Patron Beni Kap üyelik ve kullanım koşulları — işçi ve firma hesapları.",
};

export default function TermsPage() {
  return (
    <LegalDoc title="Kullanım Koşulları" updated="20 Temmuz 2026">
      <LegalSection title="1. Taraflar ve kabul">
        <p>
          Bu Kullanım Koşulları, Patron Beni Kap platformunu kullanan tüm
          ziyaretçi ve üyeler (“Kullanıcı”) ile Platform işletmecisi
          arasındadır. Kayıt olarak veya Platformu kullanarak bu koşulları
          okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.
        </p>
      </LegalSection>

      <LegalSection title="2. Hizmetin niteliği">
        <p>
          Platform; işçilerin profesyonel profil oluşturmasına, firmaların
          bu profilleri incelemesine ve tarafların mesaj / telefon /
          WhatsApp yoluyla iletişim kurmasına imkân tanıyan bir aracı
          hizmettir. Platform bir işveren, işe yerleştirme kurumu veya
          iş garantisi sunan bir taraf değildir; iş ilişkisi doğrudan
          işçi ile firma arasında kurulur.
        </p>
      </LegalSection>

      <LegalSection title="3. Hesap türleri">
        <p>
          <strong>İşçi hesabı:</strong> Mesleki profil oluşturur; görünürlük
          açıkken firmalar profili ve iletişim bilgilerini görebilir.
          Profilin doğruluğundan işçi sorumludur.
        </p>
        <p>
          <strong>Firma hesabı:</strong> İşçi arayabilir, favorilere
          ekleyebilir ve iletişim kurabilir. Elde ettiği işçi verilerini
          yalnızca meşru işe alım amacıyla kullanır; spam, taciz veya
          ticari listeleme yasaktır.
        </p>
      </LegalSection>

      <LegalSection title="4. Üyelik ve güvenlik">
        <ul>
          <li>Doğru, güncel ve size ait bilgilerle kayıt olmalısınız</li>
          <li>Hesap güvenliğinden (şifre dahil) siz sorumlusunuz</li>
          <li>18 yaşından küçükseniz Platformu kullanamazsınız</li>
          <li>
            Bir kişi/kurum için tek hesap ilkesi geçerlidir; kötüye kullanım
            durumunda hesap askıya alınabilir
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. İçerik ve iletişim kuralları">
        <ul>
          <li>Yanıltıcı, hukuka aykırı veya başkasına ait içerik yasaktır</li>
          <li>Hakaret, tehdit, ayrımcılık ve taciz yasaktır</li>
          <li>
            İşçi iletişim bilgileri izinsiz üçüncü kişilere verilemez
          </li>
          <li>
            Platform üzerinden dolandırıcılık, sahte ilan veya zararlı yazılım
            yayımı yasaktır
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Fikri mülkiyet">
        <p>
          Platformun yazılımı, tasarımı, markası ve içeriği (kullanıcı
          içerikleri hariç) bize aittir. Kullanıcılar, yükledikleri profil
          içeriklerinin haklarına sahip olduklarını veya lisans aldıklarını
          beyan eder; Platforma hizmetin sunulması için gerekli kullanım
          lisansını verir.
        </p>
      </LegalSection>

      <LegalSection title="7. Sorumluluğun sınırları">
        <p>
          Platform “olduğu gibi” sunulur. İşçi ile firma arasındaki görüşme,
          teklif, iş sözleşmesi veya uyuşmazlıklardan Platform sorumlu
          tutulamaz. Kesintisiz ve hatasız hizmet taahhüt edilmez. Zorunlu
          kanuni sorumluluk halleri saklıdır.
        </p>
      </LegalSection>

      <LegalSection title="8. Askıya alma ve fesih">
        <p>
          Koşullara aykırılık, güvenlik riski veya yasal zorunluluk halinde
          hesabınız kısıtlanabilir veya sonlandırılabilir. İstediğiniz zaman
          hesabınızı kapatmayı talep edebilirsiniz; kişisel veriler Gizlilik
          Politikası ve Aydınlatma Metni’ne göre silinir veya anonimleştirilir.
        </p>
      </LegalSection>

      <LegalSection title="9. Değişiklikler ve uygulanacak hukuk">
        <p>
          Koşullar güncellenebilir; güncel sürüm bu sayfada yayınlanır.
          Önemli değişikliklerde makul bilgilendirme yapılır. Bu koşullara
          Türkiye Cumhuriyeti hukuku uygulanır; uyuşmazlıklarda İstanbul
          mahkemeleri ve icra daireleri yetkilidir (tüketici hakları saklıdır).
        </p>
      </LegalSection>
    </LegalDoc>
  );
}

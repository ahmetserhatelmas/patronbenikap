/**
 * Seed 25 fake workers into Supabase.
 * Run: node scripts/seed-workers.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import ws from "ws";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envText = readFileSync(envPath, "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

const FIRST = [
  "Ahmet", "Mehmet", "Ayşe", "Fatma", "Can", "Elif", "Burak", "Zeynep",
  "Emre", "Deniz", "Cem", "Selin", "Onur", "İrem", "Kerem", "Merve",
  "Yusuf", "Seda", "Barış", "Gizem", "Okan", "Pınar", "Tolga", "Nur",
  "Hakan", "Ece", "Serkan", "Derya", "Murat", "Aslı",
];
const LAST = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Polat",
];
const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep",
];
const DISTRICTS = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Bakırköy"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle"],
  İzmir: ["Konak", "Karşıyaka", "Bornova"],
  Bursa: ["Nilüfer", "Osmangazi"],
  Antalya: ["Muratpaşa", "Kepez"],
  Adana: ["Seyhan", "Çukurova"],
  Konya: ["Selçuklu", "Meram"],
  Gaziantep: ["Şahinbey", "Şehitkamil"],
};
const EDUCATION = ["lise", "onlisans", "lisans", "yuksek_lisans"];
const AVAILABILITY = ["hemen", "1_hafta", "2_hafta", "1_ay", "esnek"];
const MILITARY = ["yapildi", "tecilli", "muaf", "yapilmadi"];
const ABOUTS = [
  "İşini titizlikle yapan, ekip çalışmasına yatkın biriyim. Yeni fırsatlara açığım.",
  "Alanımda deneyimliyim. Hızlı öğrenir, sorumluluk almaktan çekinmem.",
  "Disiplinli ve güvenilir çalışırım. Referanslarım mevcuttur.",
  "Kendimi sürekli geliştirmeyi severim. Esnek çalışma saatlerine uyum sağlarım.",
  "Pratik çözümler üretirim. Müşteri odaklı ve iletişim güçlüyüm.",
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Ensure professions exist
  const { data: existingProf } = await supabase.from("professions").select("id");
  if (!existingProf?.length) {
    console.log("Meslekler yok — seed.sql çalıştırılıyor (professions)...");
    console.error("Önce supabase/seed.sql dosyasını SQL Editor'de çalıştır.");
    process.exit(1);
  }

  const { data: professions, error: pErr } = await supabase
    .from("professions")
    .select("id, name, slug");
  if (pErr || !professions?.length) {
    console.error("Professions alınamadı:", pErr?.message);
    process.exit(1);
  }

  const { data: skills } = await supabase.from("skills").select("id").limit(20);

  console.log(`${professions.length} meslek bulundu. 28 işçi oluşturuluyor...\n`);

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < 28; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 3) % LAST.length];
    const email = `demo.isci.${i + 1}@patronbenikap.dev`;
    const city = pick(CITIES);
    const district = pick(DISTRICTS[city] || ["Merkez"]);
    const profession = professions[i % professions.length];
    const experience = rand(0, 18);
    const age = rand(22, 48);
    const salary = rand(22, 75) * 1000;

    // Create auth user (triggers profile)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: "Demo123456!",
      email_confirm: true,
      user_metadata: {
        full_name: `${first} ${last}`,
        role: "worker",
      },
    });

    let userId = authData?.user?.id;

    if (authErr) {
      if (authErr.message?.includes("already") || authErr.message?.includes("exists")) {
        // Fetch existing user by email
        const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const existing = list?.users?.find((u) => u.email === email);
        if (!existing) {
          console.log(`⏭  ${email} — atlandı (${authErr.message})`);
          skipped++;
          continue;
        }
        userId = existing.id;
      } else {
        console.log(`❌ ${email} — ${authErr.message}`);
        skipped++;
        continue;
      }
    }

    // Ensure profile exists & is onboarded
    await supabase.from("profiles").upsert({
      id: userId,
      email,
      role: "worker",
      full_name: `${first} ${last}`,
      is_onboarded: true,
      is_active: true,
    });

    const slug = `${slugify(`${first}-${last}`)}-demo${i + 1}`;

    const workerPayload = {
      profile_id: userId,
      first_name: first,
      last_name: last,
      slug,
      age,
      city,
      district,
      profession_id: profession.id,
      experience_years: experience,
      education: pick(EDUCATION),
      languages: i % 3 === 0 ? ["Türkçe", "İngilizce"] : ["Türkçe"],
      driver_license: i % 4 === 0 ? ["B"] : [],
      military_status: pick(MILITARY),
      currently_working: i % 3 === 0,
      expected_salary: salary,
      availability: pick(AVAILABILITY),
      about_me: pick(ABOUTS),
      specializations: [profession.name],
      whatsapp: `9053${String(10000000 + i).slice(0, 8)}`,
      phone: `0532 ${String(1000000 + i * 111).slice(0, 7)}`,
      email,
      is_visible: true,
      profile_completion: rand(70, 100),
      view_count: rand(5, 240),
      favorite_count: rand(0, 12),
    };

    const { data: existingWorker } = await supabase
      .from("workers")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    let workerId;
    if (existingWorker) {
      const { data: updated, error: uErr } = await supabase
        .from("workers")
        .update(workerPayload)
        .eq("id", existingWorker.id)
        .select("id")
        .single();
      if (uErr) {
        console.log(`❌ worker update ${first} ${last}: ${uErr.message}`);
        skipped++;
        continue;
      }
      workerId = updated.id;
    } else {
      const { data: inserted, error: wErr } = await supabase
        .from("workers")
        .insert(workerPayload)
        .select("id")
        .single();
      if (wErr) {
        console.log(`❌ worker ${first} ${last}: ${wErr.message}`);
        skipped++;
        continue;
      }
      workerId = inserted.id;
    }

    // Attach 2–4 random skills
    if (skills?.length && workerId) {
      await supabase.from("worker_skills").delete().eq("worker_id", workerId);
      const shuffled = [...skills].sort(() => Math.random() - 0.5).slice(0, rand(2, 4));
      await supabase.from("worker_skills").insert(
        shuffled.map((s) => ({
          worker_id: workerId,
          skill_id: s.id,
          level: rand(2, 5),
        }))
      );
    }

    created++;
    console.log(
      `✓ ${first} ${last} — ${profession.name} · ${city} · ${salary.toLocaleString("tr-TR")} TL`
    );
  }

  // Bump site stats
  await supabase
    .from("site_stats")
    .update({
      active_workers: 20000 + created,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  console.log(`\nTamamlandı: ${created} işçi eklendi/güncellendi, ${skipped} atlandı.`);
  console.log("Sayfayı yenile: /firma/ara");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

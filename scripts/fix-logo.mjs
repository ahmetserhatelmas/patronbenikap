/**
 * public/logo.png içindeki beyaz arka planı şeffaflaştırır.
 * - Kenarlardan flood-fill ile sadece dışta kalan beyaz alanı siler
 *   (logonun içindeki açık pikseller korunur)
 * - İçeriğe göre kırpar ve kare tuvale ortalar
 * Çıktılar: public/logo.png (ikon, kare) ve public/logo-full.png (yazılı tam logo)
 */
import sharp from "sharp";

const SRC = "public/logo-original.png";

// Beyaz zemin + nötr gri gölgeler arka plan sayılır; lacivert kontur (koyu, mavi baskın) korunur
function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min > 42 && max - min < 26;
}

// Şeklin içinde kalan (flood-fill'in ulaşamadığı) parlak beyaz boşluklar
function isEnclosedWhite(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min > 150 && max - min < 25;
}

async function makeTransparent(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * channels;
    if (!isBackground(data[p], data[p + 1], data[p + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    if (visited[i] || isEnclosedWhite(data[p], data[p + 1], data[p + 2])) {
      visited[i] = 1;
      data[p + 3] = 0;
    }
  }

  // Kenar yumuşatma: şeffaflığa komşu nötr (gri) pikselleri de sil,
  // 2 piksellik halkada alfayı kademeli düşür — gölge halkası kalmasın
  for (let pass = 0; pass < 60; pass++) {
    const toClear = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (visited[idx]) continue;
        const p = idx * channels;
        const max = Math.max(data[p], data[p + 1], data[p + 2]);
        const min = Math.min(data[p], data[p + 1], data[p + 2]);
        // Turuncu (renk farkı yüksek) ve lacivert (mavi baskın) pikseller kalsın;
        // nötr gri gölge — koyu bile olsa — aşındırılır
        const isNavy =
          data[p + 2] - Math.min(data[p], data[p + 1]) > 13 && max < 130;
        if (max - min > 52 || isNavy) continue;
        const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
        if (neighbors.some((n) => n >= 0 && n < width * height && visited[n])) {
          toClear.push(idx);
        }
      }
    }
    for (const idx of toClear) {
      visited[idx] = 1;
      data[idx * channels + 3] = 0;
    }
    if (toClear.length === 0) break;
  }

  return sharp(data, { raw: { width, height, channels } }).png();
}

const original = await sharp(SRC).toBuffer();

// Tam logo (yazılı) — şeffaf ve kırpılmış
const fullTransparent = await (await makeTransparent(original)).toBuffer();
await sharp(fullTransparent).trim().png().toFile("public/logo-full.png");

// Sadece ikon — alttaki yazıyı at (yazı ~y>345), kırp, kare tuvale ortala
const meta = await sharp(SRC).metadata();
const iconRegion = await sharp(SRC)
  .extract({ left: 0, top: 0, width: meta.width, height: 335 })
  .toBuffer();
const iconTransparent = await (await makeTransparent(iconRegion)).toBuffer();
const trimmed = await sharp(iconTransparent).trim().toBuffer();
const tMeta = await sharp(trimmed).metadata();
const side = Math.max(tMeta.width, tMeta.height) + 16;
await sharp({
  create: {
    width: side,
    height: side,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: trimmed, gravity: "center" }])
  .png()
  .toFile("public/logo.png");

console.log("done: public/logo.png (ikon) ve public/logo-full.png");

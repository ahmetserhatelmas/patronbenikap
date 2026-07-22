/**
 * Hestia NodeApps entry.
 * - If Next is built: run `next start`
 * - Else: stay alive with a simple status page (so the panel doesn't delete the app)
 */
const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));
loadEnvFile(path.join(__dirname, ".env.production"));

// Never let auth emails use the internal NodeApps port
if (
  !process.env.NEXT_PUBLIC_APP_URL ||
  /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_APP_URL)
) {
  process.env.NEXT_PUBLIC_APP_URL = "https://patronbenikap.com";
}

const port = Number(process.env.PORT || 3000);
const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");
const nextBuild = path.join(__dirname, ".next");

function startNext() {
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: __dirname,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

function startPlaceholder() {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><title>Patron Beni Kap</title></head>
<body style="font-family:system-ui;max-width:560px;margin:48px auto;padding:0 16px;line-height:1.5">
  <h1>Kurulum devam ediyor</h1>
  <p>Dosyalar yüklendi. Sunucuda henüz <code>npm install</code> ve <code>npm run build</code> çalıştırılmadı.</p>
  <p>Hosting desteğinden SSH/terminal ile şunu iste:</p>
  <pre style="background:#f4f4f4;padding:12px;border-radius:8px">cd ~/web/patronbenikap.com/nodeapp
npm install
npm run build
pm2 restart all</pre>
</body>
</html>`);
  });

  server.listen(port, () => {
    console.log(`Placeholder listening on port ${port}`);
  });
}

if (fs.existsSync(nextBin) && fs.existsSync(nextBuild)) {
  startNext();
} else {
  console.log("Next build missing — placeholder mode");
  startPlaceholder();
}

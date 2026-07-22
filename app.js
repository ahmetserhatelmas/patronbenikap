/**
 * Hestia NodeApps entry — matches host "FTP src + Restart" workflow.
 * On Restart: if `src` is newer than `.next`, runs `next build` then `next start`.
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

if (
  !process.env.NEXT_PUBLIC_APP_URL ||
  /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_APP_URL)
) {
  process.env.NEXT_PUBLIC_APP_URL = "https://patronbenikap.com";
}

const port = Number(process.env.PORT || 3000);
const nextBin = path.join(
  __dirname,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const nextDir = path.join(__dirname, ".next");
const srcDir = path.join(__dirname, "src");

function newestMtime(dir, maxDepth = 6) {
  let newest = 0;
  if (!fs.existsSync(dir)) return 0;

  function walk(current, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      const full = path.join(current, entry.name);
      try {
        if (entry.isDirectory()) {
          walk(full, depth + 1);
        } else {
          const t = fs.statSync(full).mtimeMs;
          if (t > newest) newest = t;
        }
      } catch {
        /* ignore */
      }
    }
  }

  walk(dir, 0);
  return newest;
}

function needsBuild() {
  if (process.env.FORCE_REBUILD === "1") return true;
  if (!fs.existsSync(nextDir)) return true;
  const buildId = path.join(nextDir, "BUILD_ID");
  const builtAt = fs.existsSync(buildId)
    ? fs.statSync(buildId).mtimeMs
    : fs.statSync(nextDir).mtimeMs;
  const sourceAt = Math.max(
    newestMtime(srcDir),
    newestMtime(path.join(__dirname, "public")),
    fs.existsSync(path.join(__dirname, "next.config.ts"))
      ? fs.statSync(path.join(__dirname, "next.config.ts")).mtimeMs
      : 0,
    fs.existsSync(path.join(__dirname, "package.json"))
      ? fs.statSync(path.join(__dirname, "package.json")).mtimeMs
      : 0
  );
  return sourceAt > builtAt + 1000;
}

function startNext() {
  console.log(`Starting Next on port ${port}`);
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

function runBuild(done) {
  console.log("Building Next.js (FTP update detected)...");
  const child = spawn(process.execPath, [nextBin, "build"], {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
  child.on("exit", (code) => done(code === 0));
}

function withBuildingPage(thenStart) {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><meta http-equiv="refresh" content="15"><title>Güncelleniyor</title></head>
<body style="font-family:system-ui;max-width:520px;margin:48px auto;padding:0 16px;line-height:1.5">
  <h1>Site güncelleniyor</h1>
  <p>Yeni kod derleniyor (1–3 dakika). Sayfa otomatik yenilenecek.</p>
</body>
</html>`);
  });

  server.listen(port, () => {
    console.log(`Building page on port ${port}`);
    runBuild((ok) => {
      server.close(() => {
        if (!ok) {
          console.error("next build failed");
          process.exit(1);
        }
        thenStart();
      });
    });
  });
}

function startPlaceholder(message) {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><title>Patron Beni Kap</title></head>
<body style="font-family:system-ui;max-width:560px;margin:48px auto;padding:0 16px;line-height:1.5">
  <h1>Kurulum eksik</h1>
  <p>${message}</p>
</body>
</html>`);
  });
  server.listen(port, () => console.log(`Placeholder on ${port}`));
}

if (!fs.existsSync(nextBin)) {
  startPlaceholder(
    "node_modules eksik. Hosting’den <code>npm install</code> isteyin."
  );
} else if (needsBuild()) {
  withBuildingPage(startNext);
} else {
  startNext();
}

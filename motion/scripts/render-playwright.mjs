/**
 * Alternative renderer without HyperFrames: Playwright drives the page,
 * calls window.seek(t) frame by frame at 30 fps, saves PNGs, then ffmpeg
 * encodes a master. Also used by `npm run sheet` for contact sheets.
 *
 *   node scripts/render-playwright.mjs                 # 16:9 → renders/master-16x9.mp4
 *   node scripts/render-playwright.mjs --vertical      # 9:16 → renders/master-9x16.mp4
 *   node scripts/render-playwright.mjs --sheet         # key-frame contact sheet → renders/contact-sheet.jpg
 *   node scripts/render-playwright.mjs --from 3 --to 6 # partial range
 *
 * Uses the preinstalled Chromium (never runs `playwright install`).
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const val = (f, d) => (argv.includes(`--${f}`) ? Number(argv[argv.indexOf(`--${f}`) + 1]) : d);

const vertical = has("vertical");
const sheet = has("sheet");
const FPS = 30;
const [W, H] = vertical ? [1080, 1920] : [1920, 1080];
const page = vertical ? "vertical/index.html" : "index.html";
const tag = vertical ? "9x16" : "16x9";

// tiny static server (fonts and scripts need http, not file://)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root) || !existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream" });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/${page}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
tab.on("pageerror", (e) => console.error("page error:", e.message));
await tab.goto(url);
// outside HyperFrames nothing sizes the composition root, so pin it to the frame size
await tab.addStyleTag({ content: `#root { width: ${W}px !important; height: ${H}px !important; }` });
await tab.waitForFunction(() => window.motionReady !== undefined);
await tab.evaluate(() => window.motionReady);
const duration = await tab.evaluate(() => window.duration);

const grab = async (t, file) => {
  await tab.evaluate((time) => window.seek(time), t);
  const jpg = file.endsWith(".jpg");
  await tab.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H }, type: jpg ? "jpeg" : "png", quality: jpg ? 90 : undefined });
};

if (sheet) {
  // one frame per ~0.75 s plus every transition midpoint is plenty to review the whole piece
  const dir = join(root, "renders/sheet");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const times = [];
  for (let t = 0.4; t < duration; t += 0.75) times.push(+t.toFixed(2));
  for (const [i, t] of times.entries()) await grab(t, join(dir, `${String(i).padStart(3, "0")}.jpg`));
  const cols = vertical ? 10 : 6;
  const out = join(root, `renders/contact-sheet-${tag}.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-pattern_type", "glob", "-i", join(dir, "*.jpg"),
    "-vf", `scale=${vertical ? 216 : 384}:-1,drawtext=text='%{eif\\:n*0.75+0.4\\:d\\:2}':x=8:y=8:fontcolor=white:fontsize=14:box=1:boxcolor=black@0.6,tile=${cols}x${Math.ceil(times.length / cols)}:padding=4:color=0x222222`,
    "-frames:v", "1", out]);
  console.log(`✓ ${out} (${times.length} frames)`);
} else {
  const from = val("from", 0);
  const to = val("to", duration);
  const dir = join(root, `renders/frames-${tag}${from > 0 || to < duration ? "-partial" : ""}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const n = Math.round((to - from) * FPS);
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    await grab(from + f / FPS, join(dir, `${String(f).padStart(5, "0")}.png`));
    if (f % 30 === 0) process.stdout.write(`\r  frame ${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  // a partial range never overwrites the master that export.mjs reads
  const partial = from > 0 || to < duration;
  const out = join(root, partial ? `renders/partial-${tag}.mp4` : `renders/master-${tag}.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "%05d.png"),
    "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", out], { stdio: "inherit" });
  writeFileSync(join(dir, "README.txt"), "PNG frames from render-playwright.mjs; safe to delete.\n");
  console.log(`\n✓ ${out}`);
}

await browser.close();
server.close();

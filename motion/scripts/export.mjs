/**
 * Encodes the web deliverables from the rendered masters and copies them to
 * the Next.js site (../public/video):
 *   nuven-motion.mp4            H.264 yuv420p 1920x1080 30fps +faststart, no audio, < 4 MB (two-pass)
 *   nuven-motion.webm           VP9 alternative
 *   nuven-motion-vertical.mp4   1080x1920 for social
 *   nuven-motion-poster.jpg     logo frame (also nuven-motion-vertical-poster.jpg)
 *
 * Usage: node scripts/export.mjs [--master renders/master-16x9.mp4] [--vmaster renders/master-9x16.mp4]
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const master = resolve(root, arg("master", "renders/master-16x9.mp4"));
const vmaster = resolve(root, arg("vmaster", "renders/master-9x16.mp4"));
const out = resolve(root, "out");
const site = resolve(root, "../public/video");
const MAX_BYTES = 4 * 1024 * 1024 * 0.97; // keep a little headroom under 4 MB
const POSTER_AT = 2.9; // logo fully formed in scene 1

mkdirSync(out, { recursive: true });
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const size = (f) => statSync(f).size;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

const duration = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
/** Average video bitrate (kbit/s) that lands the file under the byte budget, with container overhead headroom. */
const kbpsFor = (src, budget) => Math.floor(((budget * 8) / duration(src) / 1000) * 0.93);
const passlog = join(out, "ffpass");

/** H.264 High, two-pass at the bitrate that fits the budget. */
function mp4(src, dst, budget) {
  const kbps = Math.min(6000, kbpsFor(src, budget));
  const common = ["-an", "-c:v", "libx264", "-preset", "slow", "-tune", "film", "-profile:v", "high", "-level", "4.1",
    "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 2)}k`, "-bufsize", `${kbps * 4}k`, "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
    "-passlogfile", passlog];
  ff("-i", src, ...common, "-pass", "1", "-f", "null", "/dev/null");
  ff("-i", src, ...common, "-pass", "2", "-movflags", "+faststart", dst);
  return `${kbps}k`;
}

/** VP9, two-pass at the same budget. */
function webm(src, dst, budget) {
  const kbps = Math.min(5000, kbpsFor(src, budget));
  const common = ["-an", "-c:v", "libvpx-vp9", "-b:v", `${kbps}k`, "-row-mt", "1", "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
    "-passlogfile", passlog];
  ff("-i", src, ...common, "-pass", "1", "-deadline", "good", "-cpu-used", "4", "-f", "null", "/dev/null");
  ff("-i", src, ...common, "-pass", "2", "-deadline", "good", "-cpu-used", "2", dst);
  return `${kbps}k`;
}

const results = [];
if (existsSync(master)) {
  const f = join(out, "nuven-motion.mp4");
  results.push([f, mp4(master, f, MAX_BYTES)]);
  const w = join(out, "nuven-motion.webm");
  results.push([w, webm(master, w, MAX_BYTES)]);
  const p = join(out, "nuven-motion-poster.jpg");
  ff("-ss", String(POSTER_AT), "-i", master, "-frames:v", "1", "-q:v", "3", p);
  results.push([p, "-"]);
} else console.warn(`! missing ${master}`);

if (existsSync(vmaster)) {
  const f = join(out, "nuven-motion-vertical.mp4");
  results.push([f, mp4(vmaster, f, MAX_BYTES)]);
  const p = join(out, "nuven-motion-vertical-poster.jpg");
  ff("-ss", String(POSTER_AT), "-i", vmaster, "-frames:v", "1", "-q:v", "3", p);
  results.push([p, "-"]);
} else console.warn(`! missing ${vmaster}`);

mkdirSync(site, { recursive: true });
for (const [f, crf] of results) {
  if (size(f) > MAX_BYTES && !f.endsWith(".jpg")) console.warn(`! ${f} is over budget`);
  copyFileSync(f, join(site, f.split("/").pop()));
  console.log(`✓ ${f.split("/").pop().padEnd(34)} ${mb(size(f)).padStart(9)}   ${crf}`);
}
console.log(`→ copied to ${site}`);

for (const f of ["ffpass-0.log", "ffpass-0.log.mbtree"]) rmSync(join(out, f), { force: true });

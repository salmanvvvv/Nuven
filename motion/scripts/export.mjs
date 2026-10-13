/**
 * Encodes the web deliverables from the rendered masters and copies them to
 * the Next.js site (../public/video):
 *   nuven-motion.mp4            H.264 yuv420p 1920x1080 30fps +faststart, no audio, < 4 MB (two-pass)
 *   nuven-motion.webm           VP9 alternative
 *   nuven-motion-vertical.mp4   1080x1920 for social, with music + SFX (AAC, -14 LUFS), < 8 MB
 *   nuven-motion-poster.jpg     logo frame (also nuven-motion-vertical-poster.jpg)
 *
 * Usage: node scripts/export.mjs [--master renders/master-16x9.mp4] [--vmaster renders/master-9x16.mp4]
 */
import { execFileSync, spawnSync } from "node:child_process";
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
const MAX_BYTES = 4 * 1024 * 1024 * 0.97; // web files: keep a little headroom under 4 MB
const SOCIAL_BYTES = 8 * 1024 * 1024 * 0.97; // vertical cut (with sound) is for social, not the page
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

const AUDIO_KBPS = 160;
const hasAudio = (f) =>
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", f]).toString().trim() !== "";

/** Two-pass EBU R128 normalisation to -14 LUFS / -2 dBTP (headroom for the AAC encode) (social platforms' target). */
function loudnormFilter(src) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", src, "-vn", "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"]);
  const m = JSON.parse(r.stderr.toString().match(/\{[\s\S]*\}/)[0]);
  return `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
}

/** H.264 High, two-pass at the bitrate that fits the budget. Keeps (normalised) AAC audio if the master has any. */
function mp4(src, dst, budget) {
  const audio = hasAudio(src);
  const kbps = Math.min(6000, kbpsFor(src, budget) - (audio ? AUDIO_KBPS + 8 : 0));
  const common = ["-c:v", "libx264", "-preset", "slow", "-tune", "film", "-profile:v", "high", "-level", "4.1",
    "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 2)}k`, "-bufsize", `${kbps * 4}k`, "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
    "-passlogfile", passlog];
  ff("-i", src, "-an", ...common, "-pass", "1", "-f", "null", "/dev/null");
  const a = audio ? ["-af", loudnormFilter(src), "-c:a", "aac", "-b:a", `${AUDIO_KBPS}k`, "-ar", "48000", "-shortest"] : ["-an"];
  ff("-i", src, ...common, ...a, "-pass", "2", "-movflags", "+faststart", dst);
  return `${kbps}k${audio ? ` + AAC ${AUDIO_KBPS}k` : ""}`;
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
  results.push([f, mp4(vmaster, f, SOCIAL_BYTES)]);
  const p = join(out, "nuven-motion-vertical-poster.jpg");
  ff("-ss", String(POSTER_AT), "-i", vmaster, "-frames:v", "1", "-q:v", "3", p);
  results.push([p, "-"]);
} else console.warn(`! missing ${vmaster}`);

mkdirSync(site, { recursive: true });
for (const [f, crf] of results) {
  if (size(f) > (f.includes("vertical") ? SOCIAL_BYTES : MAX_BYTES) && !f.endsWith(".jpg")) console.warn(`! ${f} is over budget`);
  copyFileSync(f, join(site, f.split("/").pop()));
  console.log(`✓ ${f.split("/").pop().padEnd(34)} ${mb(size(f)).padStart(9)}   ${crf}`);
}
console.log(`→ copied to ${site}`);

for (const f of ["ffpass-0.log", "ffpass-0.log.mbtree"]) rmSync(join(out, f), { force: true });

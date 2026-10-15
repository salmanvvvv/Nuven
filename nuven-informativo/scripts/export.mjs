/**
 * Final deliverables from the HyperFrames masters:
 *
 *   out/nuven-informativo-16x9.mp4   H.264 High · yuv420p · 30 fps · +faststart · AAC 160k · -14 LUFS · < 15 MB
 *   out/nuven-informativo-9x16.mp4   same, 1080×1920
 *   out/nuven-informativo.srt        subtitles (copy of content/subtitulos.srt)
 *   out/poster.jpg                   16:9 thumbnail (end card: logo + call to action, no subtitle) + out/poster-9x16.jpg
 *
 *   node scripts/export.mjs   (npm run export)
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cues } from "./cues.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
mkdirSync(out, { recursive: true });
const BUDGET = 15 * 1024 * 1024 * 0.95;
const AUDIO_K = 160;
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const mb = (f) => (statSync(f).size / 1048576).toFixed(2) + " MB";
const { duration, captions } = cues();
// poster: end card, after the last subtitle and before the closing fade
const POSTER_AT = (captions[captions.length - 1].end + duration - 0.6) / 2;

/** two-pass EBU R128: -14 LUFS integrated, -1.5 dBTP */
function loudnorm(src) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", src, "-vn", "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"]);
  const m = JSON.parse(r.stderr.toString().match(/\{[\s\S]*\}/)[0]);
  return `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
}

function encode(src, dst) {
  const kbps = Math.min(8000, Math.floor((BUDGET * 8) / duration / 1000) - AUDIO_K - 16);
  const v = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
    "-b:v", `${kbps}k`, "-maxrate", `${kbps * 2}k`, "-bufsize", `${kbps * 4}k`, "-passlogfile", join(out, "ffpass")];
  ff("-i", src, ...v, "-an", "-pass", "1", "-f", "null", "/dev/null");
  ff("-i", src, ...v, "-af", loudnorm(src), "-c:a", "aac", "-b:a", `${AUDIO_K}k`, "-ar", "48000", "-shortest", "-pass", "2", "-movflags", "+faststart", dst);
  console.log(`✓ ${dst.split("/").pop().padEnd(30)} ${mb(dst).padStart(9)}  (${kbps}k video + AAC ${AUDIO_K}k)`);
}

const m16 = join(root, "renders/master-16x9.mp4");
const m9 = join(root, "renders/master-9x16.mp4");
if (existsSync(m16)) {
  encode(m16, join(out, "nuven-informativo-16x9.mp4"));
  ff("-ss", POSTER_AT.toFixed(2), "-i", m16, "-frames:v", "1", "-q:v", "2", join(out, "poster.jpg"));
}
if (existsSync(m9)) {
  encode(m9, join(out, "nuven-informativo-9x16.mp4"));
  ff("-ss", POSTER_AT.toFixed(2), "-i", m9, "-frames:v", "1", "-q:v", "2", join(out, "poster-9x16.jpg"));
}
copyFileSync(join(root, "content/subtitulos.srt"), join(out, "nuven-informativo.srt"));
for (const f of ["guion.md", "datos.md", "creditos.md"]) copyFileSync(join(root, "content", f), join(out, f));
spawnSync("rm", ["-f", join(out, "ffpass-0.log"), join(out, "ffpass-0.log.mbtree")]);
console.log(`→ ${out}`);

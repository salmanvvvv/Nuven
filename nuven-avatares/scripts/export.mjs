/**
 * Final deliverables from the HyperFrames masters (renders/master-*.mp4):
 *
 *   out/nuven-avatares-9x16.mp4   1080×1920 · H.264 High · yuv420p · 30 fps · +faststart · AAC 192k · −14 LUFS
 *   out/nuven-avatares-1x1.mp4    1080×1080 (if renders/master-1x1.mp4 exists)
 *   out/nuven-avatares-16x9.mp4   1920×1080 (if renders/master-16x9.mp4 exists)
 *   out/nuven-avatares.srt        subtitles (copy of content/subtitulos.srt)
 *   out/poster.jpg                thumbnail from the end card (+ poster-1x1 / poster-16x9)
 *   out/timing.json · creditos.md · guion.md
 *
 *   node scripts/export.mjs   (npm run export)
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
mkdirSync(out, { recursive: true });
const T = JSON.parse(readFileSync(join(root, "content/timing.json"), "utf8"));
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const mb = (f) => (statSync(f).size / 1048576).toFixed(2) + " MB";
// poster: the end card with the profile card fully in («Siguiendo» already on)
const POSTER_AT = Math.min(T.duration - 0.3, T.speech[1] + 0.4);

/** two-pass EBU R128: −14 LUFS integrated, −2 dBTP */
function loudnorm(src) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", src, "-vn", "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"]);
  const m = JSON.parse(r.stderr.toString().match(/\{[\s\S]*\}/)[0]);
  return `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
}

function encode(src, dst) {
  ff("-i", src, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-g", "60",
    "-crf", "19", "-maxrate", "12M", "-bufsize", "24M", "-af", loudnorm(src), "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
    "-movflags", "+faststart", dst);
  console.log(`✓ ${dst.split("/").pop().padEnd(28)} ${mb(dst).padStart(9)}`);
}

for (const [tag, poster] of [["9x16", "poster.jpg"], ["1x1", "poster-1x1.jpg"], ["16x9", "poster-16x9.jpg"]]) {
  const m = join(root, `renders/master-${tag}.mp4`);
  if (!existsSync(m)) continue;
  encode(m, join(out, `nuven-avatares-${tag}.mp4`));
  ff("-ss", POSTER_AT.toFixed(2), "-i", m, "-frames:v", "1", "-q:v", "2", join(out, poster));
}
copyFileSync(join(root, "content/subtitulos.srt"), join(out, "nuven-avatares.srt"));
for (const f of ["timing.json", "creditos.md", "guion.md"]) copyFileSync(join(root, "content", f), join(out, f));
console.log(`→ ${out}`);

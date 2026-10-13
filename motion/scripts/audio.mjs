/**
 * Procedural soundtrack for the vertical cut: a music bed that follows the
 * picture (sections, filter, intensity, tape-stop on the lens, breakdown on the
 * particles) and sound effects on every visual event (beam, ribbon folds,
 * wipes, word changes, UI clicks, counter ticks, logo hits).
 *
 * Every time comes from src/config.ts (T, BEATS, X), the same numbers the
 * visuals use, so retiming the video retimes the sound. Fully deterministic
 * (seeded noise), no samples, no licences.
 *
 *   node scripts/audio.mjs          → assets/audio/music.wav + assets/audio/sfx.wav (48 kHz, 16-bit stereo)
 *
 * Both stems start and end in silence so the video still loops cleanly.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BEATS, DURATION, T, X } from "../src/config.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SR = 48000;
const N = Math.ceil(DURATION * SR);
const O = BEATS.outro;

// ───────────────────────── buffers & helpers ─────────────────────────
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const music = bus();
const sfx = bus();
// effect sends per stem, so each stem carries its own reverb (mixable separately in Studio)
const sends = new Map([
  [music, { verb: bus(), delay: bus() }],
  [sfx, { verb: bus(), delay: bus() }],
]);
const duck = new Float32Array(N).fill(1); // sidechain gain written by the kick

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
const ramp = (t, a, b) => smooth((t - a) / (b - a));
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const idx = (t) => Math.max(0, Math.min(N, Math.round(t * SR)));

let seed = 12345;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;

/** Equal-power pan, p in [-1, 1]. */
const panGains = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];

/** Topology-preserving state-variable filter (Zavalishin). */
class SVF {
  ic1 = 0;
  ic2 = 0;
  run(x, fc, q = 0.707) {
    const g = Math.tan((Math.PI * Math.min(fc, SR * 0.45)) / SR);
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = x - this.ic2;
    const v1 = a1 * this.ic1 + a2 * v3;
    const v2 = this.ic2 + a2 * this.ic1 + a3 * v3;
    this.ic1 = 2 * v1 - this.ic1;
    this.ic2 = 2 * v2 - this.ic2;
    return { lp: v2, bp: v1, hp: x - k * v1 - v2 };
  }
}

/**
 * Renders a voice from t0 for dur seconds. fn(tl, i) returns a sample (mono)
 * or [l, r]; pan may be a number or a function of tl. send = reverb amount.
 */
function voice(target, t0, dur, fn, { pan = 0, gain = 1, verb = 0, delay = 0, ducked = false } = {}) {
  const a = idx(t0);
  const b = idx(t0 + dur);
  for (let i = a; i < b; i++) {
    const tl = (i - a) / SR;
    let v = fn(tl, i);
    let l, r;
    if (Array.isArray(v)) [l, r] = v;
    else {
      const [gl, gr] = panGains(typeof pan === "function" ? pan(tl) : pan);
      l = v * gl;
      r = v * gr;
    }
    const g = gain * (ducked ? duck[i] : 1);
    l *= g;
    r *= g;
    target.L[i] += l;
    target.R[i] += r;
    const fx = sends.get(target);
    if (verb) {
      fx.verb.L[i] += l * verb;
      fx.verb.R[i] += r * verb;
    }
    if (delay) {
      fx.delay.L[i] += l * delay;
      fx.delay.R[i] += r * delay;
    }
  }
}

/** Band-limited-ish saw (polyBLEP). */
function sawOsc() {
  let ph = rnd();
  return (f) => {
    const dt = f / SR;
    ph += dt;
    if (ph >= 1) ph -= 1;
    let v = 2 * ph - 1;
    if (ph < dt) {
      const t = ph / dt;
      v -= t + t - t * t - 1;
    } else if (ph > 1 - dt) {
      const t = (ph - 1) / dt;
      v -= t * t + t + t + 1;
    }
    return v;
  };
}

// ───────────────────────── score: harmony & grid ─────────────────────────
const BEAT = 0.55; // ≈109 BPM; puts the scene-3 word changes and the 11 s cut on the grid
const GRID0 = T.type - BEAT * 5; // 3.3 s: first downbeat, right as the iris opens on the tiles
const BAR = BEAT * 4;
const beatsBetween = (a, b, every = 1, offset = 0) => {
  const out = [];
  for (let n = Math.ceil((a - GRID0) / BEAT - 1e-6); GRID0 + n * BEAT < b - 1e-6; n++) if ((n - offset) % every === 0) out.push(GRID0 + n * BEAT);
  return out;
};
// A minor: Am9 – Fmaj7 – Cmaj7 – G6/9, one chord per bar
const CHORDS = [
  { bass: 33, pad: [57, 60, 64, 71] },
  { bass: 29, pad: [53, 57, 60, 64] },
  { bass: 36, pad: [55, 60, 64, 71] },
  { bass: 31, pad: [55, 59, 62, 69] },
];
const chordAt = (t) => CHORDS[(((Math.floor((t - GRID0) / BAR) % 4) + 4) % 4)];

// "Interactive" curves: what the picture is doing drives the bed
const DRUMS_ON = (t) => (t >= GRID0 && t < T.lens) || (t >= T.lens + 0.6 && t < T.particles - 0.05);
const WHITE = (t) => (t >= T.type && t < T.type + BEATS.typeInvert) || (t >= T.outro + 0.15 && t < T.outro + O.wipe);
const COLLAPSE = (t) => ramp(t, T.particles + BEATS.particleCollapse[0], T.particles + BEATS.particleCollapse[1]);
const FORM = (t) => ramp(t, T.particles + BEATS.particleForm[0], T.particles + BEATS.particleForm[1]);
/** pad brightness (filter cutoff in Hz) follows the scene */
function padCutoff(t) {
  let f = 380 + 2200 * ramp(t, 0.15, 1.95); // intro opens towards the logo
  if (t >= T.tiles) f = 1300 + 500 * Math.sin((t - T.tiles) * 2.2);
  if (WHITE(t)) f = 4200; // white scenes = bright
  if (t >= T.type + BEATS.typeInvert && t < T.lens) f = 900; // inverted to black
  if (t >= T.lens && t < T.cards) f = 700 + 1300 * ramp(t, T.lens + 0.9, T.cards);
  if (t >= T.cards && t < T.metrics) f = 2400;
  if (t >= T.metrics && t < T.particles) f = 1600 + 1600 * ramp(t, T.metrics + BEATS.counter[0], T.metrics + BEATS.counter[1]);
  if (t >= T.particles && t < T.outro) f = 800 + 6000 * COLLAPSE(t) ** 2;
  if (t >= T.outro + O.wipe) f = 1800;
  return f;
}
/** tape-stop on the lens: everything pitched sinks for a moment */
const warp = (t) => 1 - 0.45 * (ramp(t, T.lens - 0.02, T.lens + 0.28) - ramp(t, T.lens + 0.45, T.lens + 0.8));
/** overall bed level */
function bedLevel(t) {
  let v = 0.55 * ramp(t, 0.15, 1.2);
  if (t >= GRID0) v = 0.85;
  if (t >= T.particles) v = 0.75;
  if (t >= T.outro - 0.05 && t < T.outro + 0.12) v = 0.05; // gap before the white flash hit
  if (t >= T.outro + 0.12) v = 0.6;
  v *= 1 - ramp(t, T.outro + O.collapse, T.outro + O.black - 0.12); // into silence for the loop
  return v;
}

// ───────────────────────── instruments ─────────────────────────
function kick(t0, amp = 1) {
  voice(music, t0, 0.5, (tl) => {
    const f = 46 + 120 * Math.exp(-tl * 38);
    const env = Math.exp(-tl * 7.5);
    const click = tl < 0.004 ? noise() * 0.6 : 0;
    return Math.tanh(1.6 * Math.sin(2 * Math.PI * f * tl * (1 + 0.6 * Math.exp(-tl * 38)))) * env * amp + click * amp;
  }, { gain: 0.75 });
  // sidechain: dip the bed under each kick
  const a = idx(t0);
  for (let i = a; i < Math.min(N, a + idx(0.32)); i++) {
    const tl = (i - a) / SR;
    duck[i] = Math.min(duck[i], 1 - 0.55 * Math.exp(-tl * 9));
  }
}
function hat(t0, open = false, amp = 1, pan = 0.2) {
  const f = new SVF();
  voice(music, t0, open ? 0.25 : 0.06, (tl) => f.run(noise(), 8500, 0.9).hp * Math.exp(-tl * (open ? 14 : 70)) * amp, { gain: 0.16, pan, verb: 0.05 });
}
function clap(t0, amp = 1) {
  const f = new SVF();
  voice(music, t0, 0.3, (tl) => {
    const bursts = tl < 0.03 ? Math.exp(-((tl % 0.01) * 400)) : Math.exp(-(tl - 0.02) * 22);
    return f.run(noise(), 1300, 1.2).bp * bursts * amp;
  }, { gain: 0.5, verb: 0.25 });
}
function bassNote(t0, dur, midi) {
  const f = new SVF();
  const osc = sawOsc();
  voice(music, t0, dur, (tl, i) => {
    const t = t0 + tl;
    const fr = mtof(midi) * warp(t);
    const env = Math.min(1, tl / 0.004) * Math.exp(-tl * 3.2);
    const sub = Math.sin(2 * Math.PI * fr * tl);
    const body = f.run(osc(fr), 220 + 500 * Math.exp(-tl * 10), 0.9).lp;
    return Math.tanh(1.4 * (sub * 0.9 + body * 0.5)) * env * bedLevel(t);
  }, { gain: 0.42, ducked: true });
}
function pluck(t0, midi, pan, amp = 1) {
  const f = new SVF();
  const osc = sawOsc();
  voice(music, t0, 0.6, (tl) => {
    const env = Math.min(1, tl / 0.003) * Math.exp(-tl * 7);
    return f.run(osc(mtof(midi) * warp(t0 + tl)), 600 + 4200 * Math.exp(-tl * 14), 1.1).lp * env * amp;
  }, { gain: 0.14, pan, verb: 0.2, delay: 0.3, ducked: true });
}
/** FM bell / soft keys */
function bell(t0, midi, { dur = 2.2, amp = 1, pan = 0, verb = 0.45, bright = 1 } = {}) {
  const fc = mtof(midi);
  voice(sfx, t0, dur, (tl) => {
    const env = Math.min(1, tl / 0.002) * Math.exp(-tl * (3 / dur) * 1.6);
    const idxm = bright * 2.2 * Math.exp(-tl * 4);
    return Math.sin(2 * Math.PI * fc * tl + idxm * Math.sin(2 * Math.PI * fc * 3.5 * tl)) * env * amp;
  }, { gain: 0.16, pan, verb });
}

// ── drums & bass on the grid
for (const b of beatsBetween(GRID0, T.particles)) {
  if (!DRUMS_ON(b)) continue;
  const halfTime = b >= T.lens && b < T.cards; // lens section: kick on 1 and 3 only
  const n = Math.round((b - GRID0) / BEAT);
  if (!halfTime || n % 2 === 0) kick(b, b >= T.cards ? 1 : 0.9);
  if (b >= GRID0 + BEAT) hat(b + BEAT / 2, n % 4 === 3, b >= T.cards && b < T.metrics ? 0.6 : 1);
  if (b >= T.type && n % 2 === 1 && !halfTime) clap(b, WHITE(b) ? 1 : 0.8);
  if (b >= T.type) for (const s of [0.25, 0.75]) hat(b + BEAT * s, false, 0.45, -0.25);
}
for (const b of beatsBetween(GRID0, T.particles)) {
  if (!DRUMS_ON(b)) continue;
  for (const off of [0, 0.5]) bassNote(b + off * BEAT, BEAT * 0.48, chordAt(b).bass + (off ? 12 : 0));
}
// ── arpeggio over the cards and the metrics (16ths on the dashboard)
for (let t = T.cards; t < T.particles - 0.1; ) {
  const step = t < T.metrics ? BEAT / 2 : BEAT / 4;
  const pad = chordAt(t).pad;
  const k = Math.round((t - T.cards) / step);
  const pattern = [0, 1, 2, 3, 2, 1];
  pluck(t, pad[pattern[k % pattern.length]] + 12, k % 2 ? 0.35 : -0.35, t < T.metrics ? 0.8 : 1);
  t += step;
}
// ── pad (rendered after the kicks so their sidechain ducking applies): chord follows the bar, filter follows the picture
{
  const voices = [0, 1, 2, 3].map(() => [sawOsc(), sawOsc()]);
  const filters = [new SVF(), new SVF()];
  let cut = 400;
  voice(music, 0, DURATION, (tl, i) => {
    const t = tl;
    const level = bedLevel(t);
    if (level <= 0.0001) return [0, 0];
    const intro = t < GRID0;
    const notes = intro ? [45, 52, 59, 64] : t >= T.outro ? [45, 57, 60, 64] : chordAt(t).pad;
    cut += (padCutoff(t) - cut) * 0.0006; // smooth so cuts in the picture glide, not click
    const w = warp(t);
    let l = 0;
    let r = 0;
    notes.forEach((m, n) => {
      const f = mtof(m) * w;
      l += voices[n][0](f * 0.9965);
      r += voices[n][1](f * 1.0035);
    });
    const breath = 0.85 + 0.15 * Math.sin(t * 1.7);
    return [filters[0].run(l, cut, 0.8).lp * level * breath, filters[1].run(r, cut * 1.02, 0.8).lp * level * breath];
  }, { gain: 0.085, verb: 0.35, ducked: true });
}

// ── shimmer: glassy grains (intro light, particles, logo sheen)
function shimmer(a, b, density, base = 81) {
  const notes = [0, 7, 12, 14, 19, 24];
  for (let t = a; t < b; ) {
    const d = density(t);
    if (d > 0.02) {
      const m = base + notes[Math.floor(rnd() * notes.length)];
      const amp = 0.25 + rnd() * 0.75;
      const f = mtof(m);
      voice(music, t, 0.5, (tl) => Math.sin(2 * Math.PI * f * tl) * Math.min(1, tl / 0.01) * Math.exp(-tl * 9) * amp * d, { gain: 0.05, pan: rnd() * 1.6 - 0.8, verb: 0.6 });
    }
    t += 0.02 + (1 - Math.min(1, d)) * 0.12 + rnd() * 0.04;
  }
}
shimmer(0.2, GRID0, (t) => 0.5 * ramp(t, 0.15, 1.2) * (1 - ramp(t, 2.6, 3.2)));
shimmer(T.particles, T.outro - 0.1, (t) => 0.35 + 0.65 * FORM(t) + 0.6 * COLLAPSE(t), 76);
shimmer(T.outro + O.logo + 0.85, T.outro + O.logo + 1.5, () => 0.8, 88);

// ───────────────────────── sound effects ─────────────────────────
function whoosh(t0, dur, { from = -0.8, to = 0.8, lo = 300, hi = 5000, amp = 1, verb = 0.15, q = 1.4 } = {}) {
  const f = new SVF();
  voice(sfx, t0, dur, (tl) => {
    const x = tl / dur;
    const env = Math.sin(Math.PI * Math.min(1, x)) ** 1.6;
    const fc = lo * (hi / lo) ** smooth(x);
    return f.run(noise(), fc, q).bp * env * amp;
  }, { gain: 0.55, pan: (tl) => lerp(from, to, smooth(tl / dur)), verb });
}
function paper(t0, dur, amp = 1, pan = 0) {
  const f = new SVF();
  let crinkle = 1;
  voice(sfx, t0, dur, (tl) => {
    if (rnd() < 0.004) crinkle = 0.4 + rnd() * 1.4;
    const x = tl / dur;
    const env = Math.sin(Math.PI * Math.min(1, x)) * (0.6 + 0.4 * crinkle);
    return f.run(noise(), 2500 + 3500 * x, 0.7).hp * env * amp;
  }, { gain: 0.22, pan, verb: 0.12 });
}
function click(t0, { f = 2600, amp = 1, pan = 0, verb = 0.08 } = {}) {
  voice(sfx, t0, 0.04, (tl) => (Math.sin(2 * Math.PI * f * tl) * 0.7 + noise() * 0.3) * Math.exp(-tl * 160) * amp, { gain: 0.35, pan, verb });
}
function boom(t0, { amp = 1, dur = 1.8, f0 = 52, verb = 0.35 } = {}) {
  // tails capped at 1.1 s and level trimmed so the low end stays clean
  dur = Math.min(dur, 1.1);
  amp *= 0.8;
  const lp = new SVF();
  voice(sfx, t0, dur, (tl) => {
    const f = f0 * (1 + 0.8 * Math.exp(-tl * 18));
    const body = Math.sin(2 * Math.PI * f * tl) * Math.exp(-tl * (3.4 / dur) * 1.4);
    const hit = lp.run(noise(), 900, 0.7).lp * Math.exp(-tl * 14);
    return Math.tanh(1.8 * (body + hit * 0.8)) * amp;
  }, { gain: 0.7, verb });
}
function riser(t0, dur, { amp = 1, lo = 200, hi = 7000 } = {}) {
  const f = new SVF();
  voice(sfx, t0, dur, (tl) => {
    const x = tl / dur;
    const env = x ** 2.2;
    const tone = Math.sin(2 * Math.PI * (120 + 900 * x * x) * tl) * 0.25;
    return (f.run(noise(), lo * (hi / lo) ** x, 2).bp + tone) * env * amp;
  }, { gain: 0.45, verb: 0.3, pan: (tl) => 0.3 * Math.sin(tl * 9) });
}

// 1 · intro: point ignites, beam crosses, scanners split, ribbon folds, logo hit
bell(0.15, 93, { amp: 0.7, dur: 2.5, verb: 0.7, bright: 0.6 });
boom(0.15, { amp: 0.25, f0: 40, dur: 1.2 });
whoosh(0.42, 0.62, { from: 0, to: 0, lo: 400, hi: 9000, amp: 0.9, q: 2 });
click(0.97, { f: 3200, pan: -0.15, amp: 0.6 });
click(0.99, { f: 3400, pan: 0.15, amp: 0.6 });
paper(1.2, 0.8, 1, -0.2);
boom(1.95, { amp: 0.9, dur: 2.0 });
bell(1.95, 69, { amp: 0.6, dur: 2.6, verb: 0.6 });
bell(1.95, 76, { amp: 0.45, dur: 2.6, verb: 0.6, pan: 0.3 });
bell(1.97, 83, { amp: 0.3, dur: 2.4, verb: 0.7, pan: -0.3 });
riser(2.2, X.introOut[0] + 0.35 - 2.2, { amp: 0.7 });
// 1→2 · zoom through the logo, iris opens on the tiles
whoosh(X.introOut[0], X.introOut[1] - X.introOut[0], { from: 0, to: 0, lo: 2000, hi: 200, amp: 1.1, q: 0.9 });
boom(GRID0, { amp: 0.7, dur: 1.4, f0: 45 });

// 2→3 · white ribbon wipe (bottom-left → top-right)
whoosh(X.tilesOut[0], X.tilesOut[1] - X.tilesOut[0], { from: -0.9, to: 0.9, lo: 250, hi: 6000, amp: 1.1 });
paper(X.tilesOut[0] + 0.05, 0.45, 0.8, 0.3);
// 3 · word changes + invert hit
BEATS.type.slice(1).forEach((b, n) => {
  click(T.type + b, { f: 1800 + n * 250, amp: 0.9, pan: n % 2 ? 0.25 : -0.25 });
  whoosh(T.type + b - 0.06, 0.2, { from: 0, to: 0, lo: 3000, hi: 900, amp: 0.4, q: 1 });
});
riser(T.type + BEATS.typeInvert - 0.5, 0.5, { amp: 0.5, lo: 1500, hi: 9000 });
boom(T.type + BEATS.typeInvert, { amp: 0.85, dur: 1.2 });

// 4 · lens: warp, quadrant swaps, fly-off, 3D cards
voice(sfx, T.lens, 0.8, (tl) => Math.sin(2 * Math.PI * (420 * Math.exp(-tl * 4) + 50) * tl) * Math.sin(Math.PI * Math.min(1, tl / 0.8)) * 0.8, { gain: 0.35, verb: 0.3 });
whoosh(T.lens, 0.45, { from: 0, to: 0, lo: 5000, hi: 400, amp: 0.6, q: 0.8 });
for (let n = 0; n < 4; n++) {
  const t = T.lens + BEATS.swapStart + n * BEATS.swapStep;
  click(t, { f: 2200 + n * 300, amp: 0.7, pan: [0.5, -0.5, 0.5, -0.5][n] });
  whoosh(t, 0.35, { from: 0, to: 0, lo: 1500, hi: 4500, amp: 0.25 });
}
whoosh(T.lens + BEATS.lensExit, 0.6, { from: 0, to: 0, lo: 200, hi: 8000, amp: 1.2, q: 0.8 });
bell(T.cards, 81, { amp: 0.4, dur: 2, verb: 0.7, pan: -0.4 });
bell(T.cards + 0.12, 88, { amp: 0.3, dur: 2, verb: 0.7, pan: 0.4 });

// 4→5 · white ribbon wipe, reversed (top-right → bottom-left)
whoosh(X.cardsOut[0], X.cardsOut[1] - X.cardsOut[0], { from: 0.9, to: -0.9, lo: 250, hi: 6000, amp: 1.1 });
paper(X.cardsOut[0] + 0.05, 0.45, 0.8, -0.3);

// 5 · dashboard: counter ticks (they slow down with the count), toggles, button
{
  const [a, b] = BEATS.counter;
  let last = -1;
  for (let t = T.metrics + a; t < T.metrics + b; t += 1 / 120) {
    // same expo.out shape as the counter: one tick per 12 units
    const x = (t - T.metrics - a) / (b - a);
    const v = Math.floor(((1 - 2 ** (-10 * x)) * 312) / 12);
    if (v !== last) {
      click(t, { f: 3000 + (v % 3) * 200, amp: 0.35, pan: 0.1, verb: 0.02 });
      last = v;
    }
  }
  BEATS.toggles.forEach((tt, n) => click(T.metrics + tt + BEATS.toggleDur * 0.6, { f: 1400 + n * 180, amp: 0.8, pan: 0.3 }));
  click(T.metrics + BEATS.press, { f: 900, amp: 1 });
  bell(T.metrics + BEATS.press + 0.05, 88, { amp: 0.45, dur: 1.2, verb: 0.5, pan: 0.2 });
}
// 5→6 · beam of light sweeps down
whoosh(X.metricsOut[0] - 0.05, X.metricsOut[1] - X.metricsOut[0] + 0.1, { from: 0, to: 0, lo: 6000, hi: 300, amp: 1 });

// 6 · particles: riser follows the collapse, then the white flash hit
riser(T.particles + BEATS.particleCollapse[0] - 0.3, T.outro - 0.05 - (T.particles + BEATS.particleCollapse[0] - 0.3), { amp: 1.1, lo: 150, hi: 9000 });
boom(T.outro, { amp: 1, dur: 2.2, f0: 48, verb: 0.55 });
voice(sfx, T.outro, 1.6, (tl) => noise() * Math.exp(-tl * 4) * 0.4, { gain: 0.25, verb: 0.6 }); // white noise flash

// 7 · words land one by one (A minor: A C E A), marker swipe under the key word
[69, 72, 76, 81].forEach((m, n) => bell(T.outro + O.phrase + n * O.wordStep, m, { amp: 0.55, dur: 1.6, pan: (n - 1.5) * 0.25, verb: 0.4 }));
paper(T.outro + O.highlight, 0.38, 0.9, 0.2);
// black ribbon wipe → logo forms → logo hit → sheen → collapse into the point of light
whoosh(X.phraseOut[0], X.phraseOut[1] - X.phraseOut[0], { from: -0.9, to: 0.9, lo: 180, hi: 3500, amp: 1 });
paper(T.outro + O.logo + 0.1, 0.52, 0.9, -0.2);
{
  const hit = T.outro + O.logo + 0.62;
  boom(hit, { amp: 0.95, dur: 1.4 });
  [57, 64, 69, 71, 76].forEach((m, n) => bell(hit + n * 0.015, m, { amp: 0.4, dur: 1.5, pan: (n - 2) * 0.2, verb: 0.55 }));
}
{
  const a = T.outro + O.collapse;
  const b = T.outro + O.black - 0.06;
  const f = new SVF();
  voice(sfx, a, b - a, (tl) => {
    const x = tl / (b - a);
    return f.run(noise(), 300 + 6000 * x * x, 1.6).bp * x ** 1.5;
  }, { gain: 0.5 }); // reverse suction, cut dead → silence = frame 0
}

// ───────────────────────── effects buses ─────────────────────────
/** Ping-pong delay: left line fed by the input, right line by the left (dotted eighth). */
function pingPong(src, dst, time = BEAT * 0.75, fb = 0.38) {
  const d = Math.round(time * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const dl = i >= d ? L[i - d] : 0;
    const dr = i >= d ? R[i - d] : 0;
    L[i] = (src.L[i] + src.R[i]) * 0.5 + dr * fb;
    R[i] = dl;
    dst.L[i] += dl * 0.5;
    dst.R[i] += dr * 0.5;
  }
}
function freeverb(src) {
  const s = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const aps = [556, 441, 341, 225];
  const out = bus();
  for (const [ch, spread] of [
    ["L", 0],
    ["R", 23],
  ]) {
    const x = src[ch];
    const y = out[ch];
    for (const c of combs) {
      const len = Math.round((c + spread) * s);
      const buf = new Float32Array(len);
      let p = 0;
      let store = 0;
      for (let i = 0; i < N; i++) {
        const o = buf[p];
        store = o * 0.75 + store * 0.25; // damping
        buf[p] = x[i] * 0.015 + store * 0.86; // room size
        y[i] += o;
        if (++p >= len) p = 0;
      }
    }
    for (const a of aps) {
      const len = Math.round((a + spread) * s);
      const buf = new Float32Array(len);
      let p = 0;
      for (let i = 0; i < N; i++) {
        const b = buf[p];
        const inp = y[i];
        y[i] = b - inp;
        buf[p] = inp + b * 0.5;
        if (++p >= len) p = 0;
      }
    }
  }
  return out;
}

for (const [stem, fx] of sends) {
  pingPong(fx.delay, stem);
  pingPong(fx.delay, fx.verb);
  const wet = freeverb(fx.verb);
  for (let i = 0; i < N; i++) {
    stem.L[i] += wet.L[i] * 0.9;
    stem.R[i] += wet.R[i] * 0.9;
  }
}

// ───────────────────────── master: loop-safe edges, gentle limit ─────────────────────────
function finish(b) {
  const fadeIn = idx(0.03);
  const fadeOutA = idx(DURATION - 0.06);
  for (let i = 0; i < N; i++) {
    let g = 1;
    if (i < fadeIn) g = i / fadeIn;
    if (i >= fadeOutA) g = Math.max(0, 1 - (i - fadeOutA) / (N - fadeOutA));
    b.L[i] *= g;
    b.R[i] *= g;
  }
}
finish(music);
finish(sfx);

// common gain so the summed stems peak at -1.5 dBFS after a soft clip
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(music.L[i] + sfx.L[i]), Math.abs(music.R[i] + sfx.R[i]));
const target = 10 ** (-1.5 / 20);
const gain = Math.min(4, (target / (peak || 1)) * 1.25);
const soft = (v) => Math.tanh(v * gain * 1.1) / 1.1;

function wav(path, b) {
  const data = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    data.writeInt16LE(Math.round(clamp(soft(b.L[i]), -1, 1) * 32767), i * 4);
    data.writeInt16LE(Math.round(clamp(soft(b.R[i]), -1, 1) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

const dir = join(root, "assets/audio");
mkdirSync(dir, { recursive: true });
wav(join(dir, "music.wav"), music);
wav(join(dir, "sfx.wav"), sfx);
console.log(`✓ assets/audio/music.wav + sfx.wav  (${DURATION}s, ${SR} Hz, gain ${gain.toFixed(2)})`);

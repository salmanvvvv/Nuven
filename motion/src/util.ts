import gsap from "gsap";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const easeCache = new Map<string, (t: number) => number>();
export function ease(name: string): (t: number) => number {
  let fn = easeCache.get(name);
  if (!fn) {
    fn = gsap.parseEase(name) as (t: number) => number;
    easeCache.set(name, fn);
  }
  return fn;
}

/**
 * Keyframe helper: eased 0→1 progress of `t` between `a` and `b`.
 * Pure function of time, so every frame is seekable.
 */
export function k(t: number, a: number, b: number, e = "power3.out") {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return ease(e)((t - a) / (b - a));
}

/** Seeded PRNG (mulberry32) — never use Math.random for anything visible. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic hash noise in [0,1). */
export function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

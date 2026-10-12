import { C } from "../config";
import { drawLockup, glow, grid, hud, lockupGeom } from "../draw";
import type { RC } from "../types";
import { clamp, hash, k, lerp, rng } from "../util";

/** Seeded dust specks floating in the light. */
const DUST = (() => {
  const r = rng(7);
  return Array.from({ length: 46 }, () => ({ x: r(), y: r(), z: 0.3 + r() * 0.7, p: r() * 10 }));
})();

export function dust(rc: RC, alpha: number, t: number) {
  if (alpha <= 0) return;
  const { g, W, H, u } = rc;
  g.save();
  g.fillStyle = "#fff";
  for (const d of DUST) {
    const x = ((d.x * W + t * 12 * d.z * u) % W + W) % W;
    const y = d.y * H + Math.sin(t * 0.6 + d.p) * 18 * u;
    g.globalAlpha = alpha * 0.35 * d.z * (0.6 + 0.4 * Math.sin(t * 2 + d.p * 3));
    g.fillRect(x, y, 1.6 * d.z * u, 1.6 * d.z * u);
  }
  g.restore();
}

/**
 * Scene 1 (0–3.2 s): fine grid on black, a point of light ignites, stretches
 * into a horizontal beam, splits into two scan lines that reveal the bars of
 * the N, the ribbon folds across, then NUVEN tracks in and DIGITAL follows.
 */
export function drawIntro(rc: RC, t: number) {
  const { g, W, H, u, cx } = rc;
  const geo = lockupGeom(rc);
  const by = geo.markCy; // beam line runs through the middle of the mark

  g.fillStyle = C.black;
  g.fillRect(0, 0, W, H);

  grid(rc, k(t, 0.05, 1.1, "power2.out") * (1 - 0.35 * k(t, 1.6, 2.6)));
  dust(rc, k(t, 0.6, 1.6), t);

  // 1 — the point of light ignites (with a short deterministic flicker)
  const ig = k(t, 0.15, 0.5, "expo.out");
  const flicker = t < 0.34 ? (hash(Math.floor(t * 30)) > 0.45 ? 1 : 0.3) : 1;
  const beam = k(t, 0.42, 1.0, "expo.inOut");
  const split = k(t, 0.95, 1.55, "power3.inOut");
  const lineFade = 1 - k(t, 1.35, 1.95, "power2.out");

  if (ig > 0) {
    const a = ig * flicker * (1 - 0.55 * split);
    glow(g, cx, by, lerp(10, 170, ig) * u, 0.9 * a);
    glow(g, cx, by, 26 * u, a);
    g.fillStyle = `rgba(255,255,255,${a})`;
    g.beginPath();
    g.arc(cx, by, 3.2 * u * (1 - split), 0, Math.PI * 2);
    g.fill();
  }

  // 2 — the horizontal beam crosses the screen, then splits into two scanners
  if (beam > 0 && lineFade > 0) {
    const half = beam * W * 0.62;
    const span = (geo.markBottom - geo.markTop) / 2 + 26 * u;
    const ys = split > 0 ? [by - split * span, by + split * span] : [by];
    for (const y of ys) {
      const a = lineFade * (split > 0 ? 0.9 : 1);
      const hg = g.createLinearGradient(cx - half, 0, cx + half, 0);
      hg.addColorStop(0, "rgba(255,255,255,0)");
      hg.addColorStop(0.5, `rgba(255,255,255,${a})`);
      hg.addColorStop(1, "rgba(255,255,255,0)");
      // soft vertical halo
      const vg = g.createLinearGradient(0, y - 34 * u, 0, y + 34 * u);
      vg.addColorStop(0, "rgba(255,255,255,0)");
      vg.addColorStop(0.5, `rgba(255,255,255,${0.16 * a})`);
      vg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = vg;
      g.fillRect(cx - half, y - 34 * u, half * 2, 68 * u);
      g.fillStyle = hg;
      g.fillRect(cx - half, y - 1.2 * u, half * 2, 2.4 * u);
    }
  }

  // warm-up light that stays behind the mark
  glow(g, cx, by, 420 * u, 0.1 * k(t, 1.0, 2.2, "power2.out"));

  // 3 — the N: bars revealed between the scanners, ribbon folds across
  const span = (geo.markBottom - geo.markTop) / 2 + 26 * u;
  const y0 = (by - split * span - geo.oy) / geo.m;
  const y1 = (by + split * span - geo.oy) / geo.m;
  drawLockup(rc, {
    barL: k(t, 0.95, 1.6, "expo.out"),
    barR: k(t, 1.02, 1.68, "expo.out"),
    barClip: split < 1 ? [y0, y1] : undefined,
    ribbon: k(t, 1.2, 2.0, "expo.inOut"),
    sheen: k(t, 2.15, 3.05, "power2.inOut"),
    word: k(t, 1.55, 2.65, "expo.out"),
    sub: k(t, 2.0, 2.75, "expo.out"),
    scale: lerp(0.965, 1, k(t, 0.9, 3.0, "power2.out")),
  });

  hud(rc, k(t, 1.0, 1.6) * clamp(1), 0);
}

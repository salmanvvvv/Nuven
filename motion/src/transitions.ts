import { RIBBON_NORMAL } from "./brand";
import { clipHalfPlane } from "./draw";
import type { RC } from "./types";
import { lerp } from "./util";

export interface RibbonWipeOpts {
  /** sweep from top-right to bottom-left instead */
  reverse?: boolean;
  /** dark ribbon (for white → black) instead of the white paper ribbon */
  dark?: boolean;
}

/**
 * The N's ribbon unrolls across the screen: a wide band cut on the logo's
 * 41.8° diagonal sweeps along its normal. Scene A stays ahead of it, scene B
 * is laid down behind it. The band carries the logo's paper gradient, a
 * bright crease on the leading edge and a soft shadow on scene A.
 */
export function ribbonWipe(rc: RC, p: number, drawA: () => void, drawB: () => void, o: RibbonWipeOpts = {}) {
  const { g, W, H, u, cx, cy } = rc;
  const sgn = o.reverse ? -1 : 1;
  const nx = RIBBON_NORMAL.x * sgn;
  const ny = RIBBON_NORMAL.y * sgn;
  const E = Math.abs(nx) * (W / 2) + Math.abs(ny) * (H / 2);
  const bw = Math.min(W, H) * 0.62;
  const e = lerp(-E - bw - 80 * u, E + 80 * u, p); // trailing edge

  if (p < 1) drawA();
  if (p > 0) {
    g.save();
    clipHalfPlane(rc, nx, ny, e, -1);
    drawB();
    g.restore();
  }
  if (p <= 0 || p >= 1) return;

  // band, in a frame whose +x axis is the sweep normal
  g.save();
  g.translate(cx + nx * e, cy + ny * e);
  g.rotate(Math.atan2(ny, nx));
  const L = Math.hypot(W, H);
  // shadow cast ahead of the band
  const sh = g.createLinearGradient(bw, 0, bw + 90 * u, 0);
  sh.addColorStop(0, `rgba(0,0,0,${o.dark ? 0.25 : 0.55})`);
  sh.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = sh;
  g.fillRect(bw, -L, 90 * u, L * 2);
  // the ribbon
  const gr = g.createLinearGradient(0, 0, bw, 0);
  if (o.dark) {
    gr.addColorStop(0, "#000000");
    gr.addColorStop(0.6, "#151515");
    gr.addColorStop(1, "#2e2e2e");
  } else {
    gr.addColorStop(0, "#cfcfcf");
    gr.addColorStop(0.35, "#efefef");
    gr.addColorStop(1, "#ffffff");
  }
  g.fillStyle = gr;
  g.fillRect(0, -L, bw, L * 2);
  // fold shadow on the trailing side, bright crease on the leading edge
  const fold = g.createLinearGradient(0, 0, 40 * u, 0);
  fold.addColorStop(0, `rgba(0,0,0,${o.dark ? 0.6 : 0.22})`);
  fold.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fold;
  g.fillRect(0, -L, 40 * u, L * 2);
  g.fillStyle = o.dark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,1)";
  g.fillRect(bw - 3 * u, -L, 3 * u, L * 2);
  g.restore();
}

/** A horizontal beam of light sweeps down; scene B is revealed above it. */
export function beamWipe(rc: RC, p: number, drawA: () => void, drawB: () => void) {
  const { g, W, H, u } = rc;
  const y = lerp(-40 * u, H + 40 * u, p);
  if (p < 1) drawA();
  if (p > 0) {
    g.save();
    g.beginPath();
    g.rect(0, 0, W, y);
    g.clip();
    drawB();
    g.restore();
  }
  if (p <= 0 || p >= 1) return;
  const vg = g.createLinearGradient(0, y - 60 * u, 0, y + 60 * u);
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(0.5, "rgba(255,255,255,0.35)");
  vg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = vg;
  g.fillRect(0, y - 60 * u, W, 120 * u);
  g.fillStyle = "#fff";
  g.fillRect(0, y - 1.5 * u, W, 3 * u);
}

/** Circle opening from (x, y); scene B inside. Optional bright rim. */
export function irisWipe(rc: RC, p: number, x: number, y: number, drawA: () => void, drawB: () => void, rim = true) {
  const { g, W, H, u } = rc;
  const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) * p;
  if (p < 1) drawA();
  if (p <= 0) return;
  g.save();
  g.beginPath();
  g.arc(x, y, Math.max(0.01, R), 0, Math.PI * 2);
  g.clip();
  drawB();
  g.restore();
  if (rim && p < 1) {
    g.save();
    g.strokeStyle = "rgba(255,255,255,0.85)";
    g.lineWidth = 2 * u;
    g.shadowColor = "rgba(255,255,255,0.9)";
    g.shadowBlur = 24 * u;
    g.beginPath();
    g.arc(x, y, Math.max(0.01, R), 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
}

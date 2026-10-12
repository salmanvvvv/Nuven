import { markPaths, RIBBON_ANGLE } from "./brand";
import { C, FONT } from "./config";
import { COPY } from "./content";
import { clamp, lerp } from "./util";
import type { RC } from "./types";

type G = CanvasRenderingContext2D;

export function font(g: G, size: number, weight = 500) {
  g.font = `${weight} ${size}px ${FONT}`;
}

export interface TextOpts {
  size: number;
  weight?: number;
  /** letter spacing in em */
  track?: number;
  align?: "left" | "center" | "right";
  color?: string;
  alpha?: number;
  stroke?: number; // outline width in px (outline only)
  blur?: number;
}

/** Width of a tracked string without the trailing letter-spacing Chrome adds. */
export function measure(g: G, text: string, o: TextOpts) {
  font(g, o.size, o.weight);
  g.letterSpacing = `${(o.track ?? 0) * o.size}px`;
  const w = g.measureText(text).width - (o.track ?? 0) * o.size;
  g.letterSpacing = "0px";
  return w;
}

/** Draws text on the alphabetic baseline. Returns its visual width. */
export function text(g: G, str: string, x: number, y: number, o: TextOpts) {
  const w = measure(g, str, o);
  const sx = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
  g.save();
  font(g, o.size, o.weight);
  g.letterSpacing = `${(o.track ?? 0) * o.size}px`;
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.globalAlpha *= o.alpha ?? 1;
  if (o.blur && o.blur > 0.2) g.filter = `blur(${o.blur.toFixed(2)}px)`;
  if (o.stroke) {
    g.strokeStyle = o.color ?? C.white;
    g.lineWidth = o.stroke;
    g.lineJoin = "round";
    g.strokeText(str, sx, y);
  } else {
    g.fillStyle = o.color ?? C.white;
    g.fillText(str, sx, y);
  }
  g.restore();
  return w;
}

export function rr(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

export function glow(g: G, x: number, y: number, r: number, alpha: number, color = "255,255,255") {
  if (alpha <= 0 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${color},${alpha})`);
  gr.addColorStop(0.25, `rgba(${color},${alpha * 0.45})`);
  gr.addColorStop(0.6, `rgba(${color},${alpha * 0.1})`);
  gr.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Thin grid of lines and dots, brighter in the centre. */
export function grid(rc: RC, alpha: number, step = 60, color = "255,255,255") {
  if (alpha <= 0) return;
  const { g, W, H, cx, cy, u } = rc;
  const s = step * u;
  const ox = cx % s;
  const oy = cy % s;
  g.save();
  g.lineWidth = 1;
  g.strokeStyle = `rgba(${color},${0.07 * alpha})`;
  g.beginPath();
  for (let x = ox; x < W; x += s) {
    g.moveTo(Math.round(x) + 0.5, 0);
    g.lineTo(Math.round(x) + 0.5, H);
  }
  for (let y = oy; y < H; y += s) {
    g.moveTo(0, Math.round(y) + 0.5);
    g.lineTo(W, Math.round(y) + 0.5);
  }
  g.stroke();
  g.fillStyle = `rgba(${color},${0.32 * alpha})`;
  for (let x = ox; x < W; x += s) for (let y = oy; y < H; y += s) g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
  // radial falloff: darken the edges so the grid lives in the centre
  const r = Math.hypot(W, H) * 0.55;
  const gr = g.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(0,0,0,0.85)");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.restore();
}

export interface MarkOpts {
  /** 0→1 left bar rising into place */
  barL: number;
  /** 0→1 right bar dropping into place */
  barR: number;
  /** 0→1 ribbon laid along its diagonal */
  ribbon: number;
  /** sheen position 0→1 (≤0 or ≥1 = hidden) */
  sheen?: number;
  alpha?: number;
  /** Clip the bars to a vertical band in mark units (scanner reveal). */
  barClip?: [number, number];
}

/** The folded-ribbon N, drawn with its viewBox origin at (ox, oy) and `m` px per unit. */
export function drawMark(g: G, ox: number, oy: number, m: number, o: MarkOpts) {
  const P = markPaths();
  g.save();
  g.translate(ox, oy);
  g.scale(m, m);
  g.globalAlpha *= o.alpha ?? 1;

  const bars = (fn: () => void) => {
    g.save();
    if (o.barClip) {
      g.beginPath();
      g.rect(-20, o.barClip[0], 140, Math.max(0, o.barClip[1] - o.barClip[0]));
      g.clip();
    }
    fn();
    g.restore();
  };

  if (o.barL > 0) {
    bars(() => {
      const lg = g.createLinearGradient(7.5, 58, 31.3, 17);
      lg.addColorStop(0, "#f2f2f2");
      lg.addColorStop(0.55, "#d2d2d2");
      lg.addColorStop(1, "#7d7d7d");
      g.save();
      g.globalAlpha *= clamp(o.barL * 1.4);
      g.translate(0, (1 - o.barL) * 16);
      g.fillStyle = lg;
      g.fill(P.left);
      g.restore();
    });
  }
  if (o.barR > 0) {
    bars(() => {
      const rg = g.createLinearGradient(92.3, 19.2, 68.3, 59.8);
      rg.addColorStop(0, "#e2e2e2");
      rg.addColorStop(0.5, "#a2a2a2");
      rg.addColorStop(1, "#4d4d4d");
      g.save();
      g.globalAlpha *= clamp(o.barR * 1.4);
      g.translate(0, -(1 - o.barR) * 16);
      g.fillStyle = rg;
      g.fill(P.right);
      g.restore();
    });
  }

  if (o.ribbon > 0) {
    const L = 116;
    const edge = o.ribbon * L;
    g.save();
    // reveal along the ribbon's diagonal
    g.translate(7.5, 5);
    g.rotate((RIBBON_ANGLE * Math.PI) / 180);
    g.beginPath();
    g.rect(-12, -60, edge + 12, 140);
    g.rotate((-RIBBON_ANGLE * Math.PI) / 180);
    g.translate(-7.5, -5);
    g.clip();

    g.save();
    g.globalAlpha *= 0.35;
    g.translate(0, 1.4);
    g.fillStyle = "#000";
    g.fill(P.ribbon);
    g.restore();

    const dg = g.createLinearGradient(7.5, 5, 92.3, 72.6);
    dg.addColorStop(0, "#ffffff");
    dg.addColorStop(0.65, "#efefef");
    dg.addColorStop(1, "#cfcfcf");
    g.fillStyle = dg;
    g.fill(P.ribbon);

    g.clip(P.ribbon);
    if (o.ribbon < 1) {
      // the crease of the fold travelling with the leading edge
      g.translate(7.5, 5);
      g.rotate((RIBBON_ANGLE * Math.PI) / 180);
      const cg = g.createLinearGradient(edge - 14, 0, edge, 0);
      cg.addColorStop(0, "rgba(0,0,0,0)");
      cg.addColorStop(0.7, "rgba(0,0,0,0.28)");
      cg.addColorStop(0.92, "rgba(255,255,255,0.9)");
      cg.addColorStop(1, "rgba(255,255,255,1)");
      g.fillStyle = cg;
      g.fillRect(edge - 14, -60, 14, 140);
      g.rotate((-RIBBON_ANGLE * Math.PI) / 180);
      g.translate(-7.5, -5);
    }
    if (o.sheen !== undefined && o.sheen > 0 && o.sheen < 1) {
      const sx = lerp(-30, 120, o.sheen);
      const sg = g.createLinearGradient(sx, 0, sx + 28, 0);
      sg.addColorStop(0, "rgba(255,255,255,0)");
      sg.addColorStop(0.5, "rgba(255,255,255,0.55)");
      sg.addColorStop(1, "rgba(255,255,255,0)");
      g.globalCompositeOperation = "lighter";
      g.fillStyle = sg;
      g.fillRect(sx, -10, 28, 100);
      // a faint grey shadow band so the sheen reads on near-white paper
      g.globalCompositeOperation = "source-over";
      const sh = g.createLinearGradient(sx - 18, 0, sx, 0);
      sh.addColorStop(0, "rgba(0,0,0,0)");
      sh.addColorStop(1, "rgba(0,0,0,0.08)");
      g.fillStyle = sh;
      g.fillRect(sx - 18, -10, 18, 100);
    }
    g.restore();
  }
  g.restore();
}

export interface LockupOpts extends MarkOpts {
  /** 0→1 NUVEN tracking-in */
  word: number;
  /** 0→1 DIGITAL */
  sub: number;
  /** 0→1 url line under the lockup */
  url?: number;
  scale?: number;
  /** vertical offset of the whole lockup in px */
  dy?: number;
}

/**
 * Full logo lockup centred on (cx, cy): mark, NUVEN, DIGITAL.
 * Proportions measured from public/brand/logo-original.jpg.
 */
export function lockupGeom(rc: RC, scale = 1, dy = 0) {
  const L = rc.u * 0.9 * scale;
  const cy = rc.cy + dy - 10 * L;
  const m = 2.574 * L;
  const markTop = cy - 197 * L;
  const markBottom = markTop + 67.6 * m;
  // viewBox origin of the mark (visible centre x = 49.9 units, visible top = 5 units)
  return { L, cy, m, ox: rc.cx - 49.9 * m, oy: markTop - 5 * m, markTop, markBottom, markCy: (markTop + markBottom) / 2 };
}

export function drawLockup(rc: RC, o: LockupOpts) {
  const { g, cx } = rc;
  const { L, cy, m, ox, oy } = lockupGeom(rc, o.scale, o.dy);
  drawMark(g, ox, oy, m, o);

  if (o.word > 0) {
    const w = o.word;
    const track = lerp(1.25, 0.6, w);
    text(g, COPY.brand, cx, cy + 121 * L, {
      size: 92 * L,
      weight: 400,
      track,
      align: "center",
      alpha: clamp(w * 1.6),
      blur: (1 - clamp(w * 1.4)) * 10 * L,
    });
  }
  if (o.sub > 0) {
    text(g, COPY.brandSub, cx, cy + 197 * L, {
      size: 32 * L,
      weight: 400,
      track: lerp(1.1, 0.62, o.sub),
      align: "center",
      color: "#bdbdbd",
      alpha: clamp(o.sub * 1.5),
      blur: (1 - clamp(o.sub * 1.3)) * 6 * L,
    });
  }
  if (o.url && o.url > 0) {
    const y = cy + 290 * L + (1 - o.url) * 14 * L;
    g.save();
    g.globalAlpha *= o.url;
    g.fillStyle = "rgba(255,255,255,0.25)";
    g.fillRect(cx - 120 * L * o.url, y - 52 * L, 240 * L * o.url, 1);
    g.restore();
    text(g, COPY.url, cx, y, { size: 24 * L, weight: 400, track: 0.18, align: "center", color: "#d8d8d8", alpha: o.url });
  }
}

/** Small corner labels + timecode that frame the dark scenes. */
export function hud(rc: RC, alpha: number, sceneIndex: number, dark = true) {
  if (alpha <= 0) return;
  const { g, W, H, u, t } = rc;
  const pad = (rc.portrait ? 56 : 64) * u;
  const col = dark ? "#ffffff" : "#000000";
  const size = 13 * u;
  const f = Math.floor(t * 30);
  const tc = `00:00:${String(Math.floor(f / 30)).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
  const o = { size, weight: 500, track: 0.28, color: col, alpha: alpha * 0.5 };
  text(g, COPY.hud.left, pad, pad + size, o);
  text(g, tc, W - pad, pad + size, { ...o, align: "right" });
  const name = `${String(sceneIndex + 1).padStart(2, "0")} / 07 — ${COPY.sceneNames[sceneIndex]}`;
  text(g, name, pad, H - pad, o);
  text(g, COPY.hud.right, W - pad, H - pad, { ...o, align: "right" });
  // tiny crosshair ticks in the corners
  g.save();
  g.globalAlpha *= alpha * 0.35;
  g.strokeStyle = col;
  g.lineWidth = 1;
  const c = 10 * u;
  for (const [x, y] of [
    [pad - 22 * u, pad - 22 * u],
    [W - pad + 22 * u, pad - 22 * u],
    [pad - 22 * u, H - pad + 22 * u],
    [W - pad + 22 * u, H - pad + 22 * u],
  ]) {
    g.beginPath();
    g.moveTo(x - c, y);
    g.lineTo(x + c, y);
    g.moveTo(x, y - c);
    g.lineTo(x, y + c);
    g.stroke();
  }
  g.restore();
}

/** Clip to the half-plane dot(p - centre, n) < s (side = -1) or > s (side = 1). */
export function clipHalfPlane(rc: RC, nx: number, ny: number, s: number, side: 1 | -1) {
  const { g, cx, cy } = rc;
  const R = Math.hypot(rc.W, rc.H) * 2;
  const px = cx + nx * s;
  const py = cy + ny * s;
  const dx = -ny;
  const dy = nx;
  g.beginPath();
  g.moveTo(px + dx * R, py + dy * R);
  g.lineTo(px - dx * R, py - dy * R);
  g.lineTo(px - dx * R + nx * R * side, py - dy * R + ny * R * side);
  g.lineTo(px + dx * R + nx * R * side, py + dy * R + ny * R * side);
  g.closePath();
  g.clip();
}

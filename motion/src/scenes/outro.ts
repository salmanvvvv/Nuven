import { BEATS, C } from "../config";
import { COPY } from "../content";
import { drawLockup, glow, hud, lockupGeom, measure, text } from "../draw";
import type { RC } from "../types";
import { clamp, k, lerp } from "../util";

/** Scene-local times of the closing beats. */
export const OUTRO = BEATS.outro;

/**
 * Scene 7a (18.4–20 s): "Hagamos realidad tu idea" word by word on paper;
 * a black ribbon slides under the key word and turns it white.
 */
export function drawPhrase(rc: RC, o: number) {
  const { g, W, H, u, cx, cy } = rc;
  g.fillStyle = C.paper;
  g.fillRect(0, 0, W, H);

  const { words, highlight } = COPY.closing;
  const opts = { size: 124 * u, weight: 600, track: -0.035 };
  const space = opts.size * 0.3;
  const lines = rc.portrait ? [words.slice(0, 2), words.slice(2)] : [words];
  const widest = Math.max(...lines.map((l) => l.reduce((s, w) => s + measure(g, w, opts), 0) + space * (l.length - 1)));
  const size = opts.size * Math.min(1, (W - 140 * u) / widest);
  const o2 = { ...opts, size };
  const lineH = size * 1.12;

  let wi = 0;
  lines.forEach((line, li) => {
    const widths = line.map((w) => measure(g, w, o2));
    const total = widths.reduce((s, w) => s + w, 0) + size * 0.3 * (line.length - 1);
    let x = cx - total / 2;
    const y = cy + size * 0.36 + (li - (lines.length - 1) / 2) * lineH;
    line.forEach((word, j) => {
      const i = wi++;
      const a = k(o, OUTRO.phrase + i * OUTRO.wordStep, OUTRO.phrase + 0.55 + i * OUTRO.wordStep, "expo.out");
      const dy = (1 - a) * 46 * u;
      const style = { ...o2, alpha: a, blur: (1 - a) * 12 * u, color: "#0b0b0b" };
      if (i === highlight) {
        // black ribbon marker sweeping in under the word (the N's diagonal cut on its ends)
        const hp = k(o, OUTRO.highlight, OUTRO.highlight + 0.38, "expo.inOut");
        const padX = size * 0.16;
        const top = y - size * 0.86;
        const bot = y + size * 0.24;
        const slant = (bot - top) * 0.45;
        const x0 = x - padX;
        const x1 = lerp(x0, x + widths[j] + padX, hp);
        if (hp > 0) {
          g.save();
          g.beginPath();
          g.moveTo(x0 + slant, top);
          g.lineTo(x1 + slant, top);
          g.lineTo(x1, bot);
          g.lineTo(x0, bot);
          g.closePath();
          const bg = g.createLinearGradient(0, top, 0, bot);
          bg.addColorStop(0, "#1c1c1c");
          bg.addColorStop(1, "#000");
          g.fillStyle = bg;
          g.fill();
          g.restore();
        }
        text(g, word, x, y + dy, style);
        if (hp > 0) {
          g.save();
          g.beginPath();
          g.rect(x0, top, x1 - x0 + slant, bot - top);
          g.clip();
          text(g, word, x, y + dy, { ...style, color: "#ffffff" });
          g.restore();
        }
      } else {
        text(g, word, x, y + dy, style);
      }
      x += widths[j] + size * 0.3;
    });
  });

  hud(rc, k(o, 0.3, 0.6), 6, false);
}

/**
 * Scene 7b (19.8–22 s): the logo forms again, the URL appears, then the whole
 * lockup collapses into the point of light the video started from.
 */
export function drawLogoEnd(rc: RC, o: number) {
  const { g, W, H, u, cx } = rc;
  g.fillStyle = C.black;
  g.fillRect(0, 0, W, H);

  const lo = o - OUTRO.logo;
  const col = k(o, OUTRO.collapse, OUTRO.black - 0.05, "expo.in");
  const geo = lockupGeom(rc);
  const py = geo.markCy;

  glow(g, cx, py, 420 * u, 0.1 * k(lo, 0, 0.8) * (1 - col));

  if (col < 1) {
    g.save();
    // collapse towards the centre of the mark
    const s = lerp(1, 0.02, col);
    g.translate(cx, py);
    g.scale(s, s);
    g.translate(-cx, -py);
    g.globalAlpha = 1 - clamp(col * 1.2 - 0.2);
    drawLockup(rc, {
      barL: k(lo, 0, 0.4, "expo.out"),
      barR: k(lo, 0.04, 0.44, "expo.out"),
      ribbon: k(lo, 0.1, 0.62, "expo.inOut"),
      sheen: k(lo, 0.85, 1.45, "power2.inOut"),
      word: k(lo, 0.25, 0.85, "expo.out"),
      sub: k(lo, 0.42, 0.9, "expo.out"),
      url: k(lo, 0.55, 0.95, "expo.out"),
    });
    g.restore();
  }

  // the point of light it all collapses into, then gone
  const pt = (k(o, OUTRO.collapse + 0.1, OUTRO.black - 0.1, "power2.in")) * (1 - k(o, OUTRO.black - 0.12, OUTRO.black, "power2.out"));
  if (pt > 0) {
    glow(g, cx, py, 150 * u * pt, 0.85 * pt);
    glow(g, cx, py, 22 * u, pt);
  }
}

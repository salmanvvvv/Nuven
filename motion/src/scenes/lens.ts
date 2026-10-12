import { T } from "../config";
import { hud, rr } from "../draw";
import { mockup, type MockKind } from "../mockups";
import type { RC } from "../types";
import { k, lerp } from "../util";
import { drawCards } from "./cards";
import { drawType } from "./type";

const QUADS: { kind: MockKind; order: number; sx: number; sy: number }[] = [
  { kind: "landing", order: 3, sx: -1, sy: -1 },
  { kind: "dashboard", order: 0, sx: 1, sy: -1 },
  { kind: "shop", order: 1, sx: -1, sy: 1 },
  { kind: "studio", order: 2, sx: 1, sy: 1 },
];

/** Barrel amount of the post pass during the lens section (scene-local time). */
export function lensBarrel(l: number) {
  return 0.34 * k(l, 0, 0.45, "power3.inOut") - 0.18 * k(l, 0.9, 1.6, "power2.inOut") - 0.16 * k(l, 1.9, 2.4, "power2.in");
}

/** When the quadrants fly off and the 3D cards take over (scene-local). */
export const LENS_EXIT = 1.95;

/**
 * Scene 4a (8.75–11 s): the frame bends like a curved screen (the actual
 * barrel distortion happens in the post pass), dashed guide lines appear, the
 * screen splits into four quadrants and each one slides to a website
 * mock-up. Then the quadrants fly past the camera into the 3D cards.
 */
export function drawLens(rc: RC, l: number) {
  const { g, W, H, u, cx, cy } = rc;
  const exit = k(l, LENS_EXIT, LENS_EXIT + 0.5, "expo.in");

  if (exit > 0) {
    drawCards(rc, rc.t - T.cards, { hud: false });
  } else {
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
  }

  const s = lerp(1, 0.8, k(l, 0, 0.45, "power3.inOut")) + 0.05 * k(l, 0.8, 2.2, "power1.inOut");
  const pw = W * s;
  const ph = H * s;
  const px = cx - pw / 2;
  const py = cy - ph / 2;
  const radius = 26 * u * k(l, 0, 0.45);
  const gap = 20 * u * k(l, 0.35, 0.75, "expo.out");
  const qw = (pw - gap) / 2;
  const qh = (ph - gap) / 2;

  // dashed guides through the centre and around the curved screen
  const guideA = k(l, 0.1, 0.5) * (1 - exit);
  if (guideA > 0) {
    g.save();
    g.strokeStyle = `rgba(255,255,255,${0.42 * guideA})`;
    g.lineWidth = Math.max(1, 1.4 * u);
    g.setLineDash([12 * u, 9 * u]);
    g.lineDashOffset = -l * 40 * u;
    g.beginPath();
    g.moveTo(0, cy);
    g.lineTo(W, cy);
    g.moveTo(cx, 0);
    g.lineTo(cx, H);
    g.stroke();
    rr(g, px - 18 * u, py - 18 * u, pw + 36 * u, ph + 36 * u, radius + 18 * u);
    g.stroke();
    g.restore();
  }

  for (const q of QUADS) {
    const qx = q.sx < 0 ? px : px + qw + gap;
    const qy = q.sy < 0 ? py : py + qh + gap;
    // fly-off towards the quadrant's corner
    const fx = q.sx * exit * W * 0.6;
    const fy = q.sy * exit * H * 0.6;
    const fs = 1 + exit * 0.8;
    const a = 1 - k(l, LENS_EXIT + 0.2, LENS_EXIT + 0.5);
    if (a <= 0) continue;

    g.save();
    g.globalAlpha = a;
    g.translate(cx + fx, cy + fy);
    g.scale(fs, fs);
    g.translate(-cx, -cy);

    // rounded outer corners only (the inner ones stay square while touching)
    const rad = [q.sx < 0 && q.sy < 0 ? radius : 6 * u, q.sx > 0 && q.sy < 0 ? radius : 6 * u, q.sx > 0 && q.sy > 0 ? radius : 6 * u, q.sx < 0 && q.sy > 0 ? radius : 6 * u];
    g.beginPath();
    g.roundRect(qx, qy, qw, qh, gap > 1 ? rad.map((r) => Math.max(r, 12 * u * (gap / (20 * u)))) : rad);
    g.clip();

    const sw = k(l, 0.5 + q.order * 0.11, 0.9 + q.order * 0.11, "expo.inOut");
    const split = qy + qh * (1 - sw);

    // old content: the scene-3 frame, scaled into the panel
    if (sw < 1) {
      g.save();
      g.beginPath();
      g.rect(qx, qy, qw, split - qy);
      g.clip();
      g.translate(px, py);
      g.scale(s, s);
      drawType(rc, rc.t - T.type);
      g.restore();
    }
    // new content: a website mock-up scrolling
    if (sw > 0) {
      g.save();
      g.beginPath();
      g.rect(qx, split, qw, qy + qh - split);
      g.clip();
      const mw = 960;
      const mh = Math.round(mw * (qh / qw) * 2.6);
      const img = mockup(q.kind, mw, mh);
      const visible = mw * (qh / qw);
      const scroll = Math.min(mh - visible, Math.max(0, (l - 0.9 - q.order * 0.1) * 140));
      g.drawImage(img, 0, scroll, mw, visible, qx, qy, qw, qh);
      g.restore();
      if (sw < 1) {
        g.fillStyle = "rgba(255,255,255,0.9)";
        g.fillRect(qx, split - 1, qw, 2);
      }
    }
    g.restore();

    // thin luminous outline per quadrant
    if (gap > 1) {
      g.save();
      g.globalAlpha = a * k(l, 0.4, 0.8) * 0.5;
      g.translate(cx + fx, cy + fy);
      g.scale(fs, fs);
      g.translate(-cx, -cy);
      g.strokeStyle = "#fff";
      g.lineWidth = 1;
      g.beginPath();
      g.roundRect(qx + 0.5, qy + 0.5, qw - 1, qh - 1, rad.map((r) => Math.max(r, 12 * u)));
      g.stroke();
      g.restore();
    }
  }

  hud(rc, 1 - exit, 3);
}

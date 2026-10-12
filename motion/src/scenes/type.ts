import { C } from "../config";
import { COPY } from "../content";
import { measure, text } from "../draw";
import type { RC } from "../types";
import { k } from "../util";

/** Beats (scene-local seconds) on which the solid word changes. */
export const TYPE_BEATS = [0, 0.55, 1.1, 1.7];
/** The background flips to black on this beat. */
export const TYPE_INVERT = 2.2;

const PHRASE = COPY.kineticWords.join(" · ") + " · ";

/**
 * Scene 3 (6.05–8.75 s): rows of outlined "DISEÑO · VELOCIDAD · SEO ·
 * RESULTADOS" scroll in alternate directions on white; the centre row holds
 * one solid word that slot-changes on every beat. On the last beat the whole
 * frame inverts to black.
 */
export function drawType(rc: RC, lt: number) {
  const { g, W, H, u, cx, cy } = rc;
  const inv = lt >= TYPE_INVERT;
  const bg = inv ? C.black : C.paper;
  const ink = inv ? "#ffffff" : "#0b0b0b";
  const inkRGB = inv ? "255,255,255" : "11,11,11";

  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  const size = (rc.portrait ? 104 : 128) * u;
  const rowH = size * 1.06;
  const centreSize = Math.min((rc.portrait ? 150 : 210) * u, ((W - 140 * u) / measure(g, "RESULTADOS", { size: 100, weight: 700, track: -0.03 })) * 100);
  const centreH = centreSize * 1.12;

  // beat-driven kick added to the scrolling rows
  let kick = 0;
  for (const b of TYPE_BEATS.slice(1)) kick += k(lt, b, b + 0.5, "expo.out");
  kick += k(lt, TYPE_INVERT, TYPE_INVERT + 0.5, "expo.out");

  const period = measure(g, PHRASE, { size, weight: 700, track: 0.01 }) + size * 0.25;
  const rows = Math.ceil((H - centreH) / 2 / rowH) + 1;

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 1; i <= rows; i++) {
      const y = cy + side * (centreH / 2 + (i - 0.5) * rowH) + size * 0.36;
      const idx = side * i;
      const dir = idx % 2 === 0 ? 1 : -1;
      const enter = k(lt, -0.25 + i * 0.05, 0.35 + i * 0.05, "expo.out");
      const off = dir * ((lt + 3) * (70 + 18 * i) * u + kick * 160 * u) + (1 - enter) * dir * 300 * u;
      let x = (((off + idx * 137 * u) % period) + period) % period - period;
      const alpha = Math.max(0.2, 1 - (i - 1) * 0.16);
      for (; x < W; x += period) {
        text(g, PHRASE, x, y, { size, weight: 700, track: 0.01, color: ink, stroke: Math.max(1, 1.5 * u), alpha });
      }
    }
  }

  // centre band: solid word, slot change on each beat
  g.save();
  g.beginPath();
  g.rect(0, cy - centreH / 2, W, centreH);
  g.clip();
  let cur = 0;
  for (let i = 0; i < TYPE_BEATS.length; i++) if (lt >= TYPE_BEATS[i]) cur = i;
  const tb = TYPE_BEATS[cur];
  const q = cur === 0 ? 1 : k(lt, tb, tb + 0.38, "expo.out");
  const words = COPY.kineticWords;
  const base = cy + centreSize * 0.36;
  if (q < 1 && cur > 0) {
    text(g, words[cur - 1], cx, base - q * centreH, { size: centreSize, weight: 700, track: -0.03, align: "center", color: ink });
  }
  text(g, words[cur], cx, base + (1 - q) * centreH, { size: centreSize, weight: 700, track: -0.03, align: "center", color: ink });
  g.restore();

  // hairlines framing the centre band
  g.fillStyle = `rgba(${inkRGB},0.18)`;
  g.fillRect(0, cy - centreH / 2, W, 1);
  g.fillRect(0, cy + centreH / 2, W, 1);
}

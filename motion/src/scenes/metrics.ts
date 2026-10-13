import { BEATS, C } from "../config";
import { COPY } from "../content";
import { glow, hud, rr, text } from "../draw";
import type { RC } from "../types";
import { clamp, k, lerp } from "../util";

type G = CanvasRenderingContext2D;
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function panel(g: G, b: Box, u: number, enter: number) {
  g.save();
  g.globalAlpha *= enter;
  g.translate(0, (1 - enter) * 40 * u);
  g.fillStyle = C.panel;
  rr(g, b.x, b.y, b.w, b.h, 22 * u);
  g.fill();
  g.strokeStyle = C.line;
  g.lineWidth = 1;
  g.stroke();
  g.restore();
}

/** Responsive layout: two columns on 16:9, stacked on 9:16. */
function layout(rc: RC) {
  const { W, H, u, portrait } = rc;
  if (!portrait) {
    const m = 130 * u;
    const right = { x: W * 0.5, w: W * 0.5 - m };
    return {
      counter: { x: m, y: H * 0.36 },
      phrase: { x: m, y: H * 0.72 },
      chart: { x: right.x, y: H * 0.17, w: right.w, h: H * 0.4 },
      ring: { x: right.x, y: H * 0.6, w: right.w * 0.42, h: H * 0.25 },
      ui: { x: right.x + right.w * 0.45, y: H * 0.6, w: right.w * 0.55, h: H * 0.25 },
      counterSize: 230 * u,
    };
  }
  const m = 70 * u;
  const w = W - m * 2;
  return {
    counter: { x: m, y: H * 0.2 },
    phrase: { x: m, y: H * 0.86 },
    chart: { x: m, y: H * 0.3, w, h: H * 0.24 },
    ring: { x: m, y: H * 0.565, w: w * 0.44, h: H * 0.2 },
    ui: { x: m + w * 0.48, y: H * 0.565, w: w * 0.52, h: H * 0.2 },
    counterSize: 200 * u,
  };
}

function toggle(g: G, x: number, y: number, u: number, on: number, label: string, w: number) {
  text(g, label, x, y + 7 * u, { size: 19 * u, weight: 500, color: "#e6e6e6" });
  const tw = 52 * u;
  const th = 28 * u;
  const tx = x + w - tw;
  const ty = y - th / 2;
  g.fillStyle = `rgba(255,255,255,${lerp(0.12, 1, on)})`;
  rr(g, tx, ty, tw, th, th / 2);
  g.fill();
  const kx = lerp(tx + th / 2, tx + tw - th / 2, on);
  g.fillStyle = on > 0.5 ? "#0a0a0a" : "#bdbdbd";
  g.beginPath();
  g.arc(kx, y, th / 2 - 4 * u, 0, Math.PI * 2);
  g.fill();
}

/**
 * Scene 5 (13.05–16 s): +312% counter, bars growing with a trend line, a
 * progress ring, and a UI card whose toggles switch on before the button is
 * pressed. All figures are sample data ([PLACEHOLDER] in content.ts).
 */
export function drawMetrics(rc: RC, lt: number) {
  const { g, W, H, u } = rc;
  const L = layout(rc);
  const M = COPY.metrics;

  g.fillStyle = C.ink;
  g.fillRect(0, 0, W, H);
  // faint grid echo of scene 1
  g.save();
  g.globalAlpha = 0.5;
  g.strokeStyle = "rgba(255,255,255,0.035)";
  g.beginPath();
  for (let x = (W / 2) % (60 * u); x < W; x += 60 * u) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  g.stroke();
  g.restore();

  const drift = 1 + 0.025 * k(lt, 0, 3, "power1.out");
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(drift, drift);
  g.translate(-W / 2, -H / 2);

  // — counter
  const cA = k(lt, 0.0, 0.45);
  text(g, M.counterLabel, L.counter.x, L.counter.y - L.counterSize * 0.92, { size: 17 * u, weight: 500, track: 0.28, color: C.grey, alpha: cA });
  const v = Math.round(M.counterValue * k(lt, BEATS.counter[0], BEATS.counter[1], "expo.out"));
  text(g, `+${v}%`, L.counter.x - 8 * u, L.counter.y, { size: L.counterSize, weight: 600, track: -0.04, alpha: cA, blur: (1 - cA) * 8 });
  text(g, M.counterSub, L.counter.x, L.counter.y + 58 * u, { size: 24 * u, weight: 400, color: "#bdbdbd", alpha: k(lt, 0.4, 0.9) });

  // — phrase, word group by word group
  let px = L.phrase.x;
  const pSize = (rc.portrait ? 34 : 36) * u;
  M.phrase.forEach((p, i) => {
    const a = k(lt, 1.0 + i * 0.28, 1.5 + i * 0.28, "expo.out");
    const last = i === M.phrase.length - 1;
    const w = text(g, p, px, L.phrase.y + (1 - a) * 24 * u, { size: pSize, weight: 600, track: -0.02, color: last ? "#ffffff" : "#8a8a8a", alpha: a, blur: (1 - a) * 10 });
    px += w;
    if (!last) {
      text(g, "·", px + pSize * 0.35, L.phrase.y, { size: pSize, weight: 600, color: "#555", alpha: a });
      px += pSize;
    }
  });

  // — bar chart with trend line
  const ch = L.chart;
  panel(g, ch, u, k(lt, 0.05, 0.6, "expo.out"));
  const chA = k(lt, 0.05, 0.6);
  g.save();
  g.globalAlpha *= chA;
  g.translate(0, (1 - chA) * 40 * u);
  text(g, M.chartTitle, ch.x + 32 * u, ch.y + 50 * u, { size: 21 * u, weight: 500, color: "#e8e8e8" });
  text(g, "DATO DE EJEMPLO", ch.x + ch.w - 32 * u, ch.y + 50 * u, { size: 12 * u, weight: 500, track: 0.24, color: "#6a6a6a", align: "right" });
  const bx = ch.x + 32 * u;
  const by = ch.y + ch.h - 36 * u;
  const bw = ch.w - 64 * u;
  const bh = ch.h - 120 * u;
  g.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i <= 3; i++) g.fillRect(bx, by - (bh * i) / 3, bw, 1);
  const n = M.bars.length;
  const slot = bw / n;
  const pts: [number, number][] = [];
  M.bars.forEach((val, i) => {
    const gr = k(lt, 0.25 + i * 0.05, 0.95 + i * 0.05, "power3.out");
    const h = (val / 100) * bh * gr;
    const x = bx + i * slot + slot * 0.2;
    g.fillStyle = i === n - 1 ? "#ffffff" : `rgba(255,255,255,${0.16 + (i / n) * 0.4})`;
    rr(g, x, by - h, slot * 0.6, Math.max(h, 0.01), 6 * u);
    g.fill();
    pts.push([x + slot * 0.3, by - (val / 100) * bh - 18 * u]);
  });
  // trend line drawing on
  const tl = k(lt, 0.85, 1.75, "power2.inOut");
  if (tl > 0) {
    g.save();
    g.beginPath();
    g.rect(bx - 10 * u, ch.y, (bw + 20 * u) * tl, ch.h);
    g.clip();
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2.5 * u;
    g.shadowColor = "rgba(255,255,255,0.8)";
    g.shadowBlur = 14 * u;
    g.stroke();
    g.restore();
    const hi = Math.min(n - 1, Math.floor(tl * (n - 1) + 0.0001));
    const fr = tl * (n - 1) - hi;
    const [x0, y0] = pts[hi];
    const [x1, y1] = pts[Math.min(n - 1, hi + 1)];
    const dx = lerp(x0, x1, fr);
    const dy = lerp(y0, y1, fr);
    glow(g, dx, dy, 34 * u, 0.6);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(dx, dy, 5 * u, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // — progress ring
  const rb = L.ring;
  const rA = k(lt, 0.15, 0.7, "expo.out");
  panel(g, rb, u, rA);
  g.save();
  g.globalAlpha *= rA;
  g.translate(0, (1 - rA) * 40 * u);
  const rcx = rb.x + rb.w / 2;
  const rcy = rb.y + rb.h * 0.47;
  const rad = Math.min(rb.w, rb.h) * 0.3;
  const pr = (M.ringValue / 100) * k(lt, 0.4, 1.6, "expo.out");
  g.lineCap = "round";
  g.lineWidth = 10 * u;
  g.strokeStyle = "rgba(255,255,255,0.1)";
  g.beginPath();
  g.arc(rcx, rcy, rad, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#fff";
  g.shadowColor = "rgba(255,255,255,0.7)";
  g.shadowBlur = 12 * u;
  g.beginPath();
  g.arc(rcx, rcy, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, pr));
  g.stroke();
  g.shadowBlur = 0;
  text(g, `${Math.round(pr * 100)}%`, rcx, rcy + 12 * u, { size: 34 * u, weight: 600, align: "center" });
  text(g, M.ringLabel, rcx, rb.y + rb.h - 24 * u, { size: 16 * u, weight: 500, track: 0.08, color: C.grey, align: "center" });
  g.restore();

  // — UI card: toggles + button
  const ub = L.ui;
  const uA = k(lt, 0.25, 0.8, "expo.out");
  const float = Math.sin(lt * 1.6) * 4 * u;
  panel(g, { ...ub, y: ub.y + float }, u, uA);
  g.save();
  g.globalAlpha *= uA;
  g.translate(0, (1 - uA) * 40 * u + float);
  const ix = ub.x + 28 * u;
  const iw = ub.w - 56 * u;
  const rowGap = ub.h * 0.18;
  M.toggles.forEach((label, i) => {
    toggle(g, ix, ub.y + ub.h * 0.2 + i * rowGap, u, k(lt, BEATS.toggles[i], BEATS.toggles[i] + BEATS.toggleDur, "power3.inOut"), label, iw);
  });
  const press = k(lt, BEATS.press, BEATS.press + 0.12, "power2.out") - k(lt, BEATS.press + 0.12, BEATS.press + 0.4, "power2.out");
  const btnH = 50 * u;
  const btnY = ub.y + ub.h - btnH - 22 * u;
  g.save();
  g.translate(ix + iw / 2, btnY + btnH / 2);
  g.scale(1 - press * 0.05, 1 - press * 0.05);
  g.fillStyle = "#ffffff";
  g.shadowColor = "rgba(255,255,255,0.9)";
  g.shadowBlur = (8 + 30 * clamp(press * 2)) * u;
  rr(g, -iw / 2, -btnH / 2, iw, btnH, btnH / 2);
  g.fill();
  g.shadowBlur = 0;
  text(g, M.button, 0, 7 * u, { size: 18 * u, weight: 600, color: "#000", align: "center" });
  g.restore();
  // ripple after the press
  const rp = k(lt, BEATS.press + 0.08, BEATS.press + 0.7, "power2.out");
  if (rp > 0 && rp < 1) {
    g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - rp)})`;
    g.lineWidth = 1.5 * u;
    rr(g, ix - rp * 18 * u, btnY - rp * 18 * u, iw + rp * 36 * u, btnH + rp * 36 * u, btnH / 2 + rp * 18 * u);
    g.stroke();
  }
  g.restore();

  g.restore();
  hud(rc, 1, 4);
}

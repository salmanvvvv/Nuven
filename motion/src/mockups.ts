/**
 * Generic website / UI mock-ups drawn once into offscreen canvases.
 * All names and figures are placeholders — no real brands.
 */
import { COPY } from "./content";
import { font, rr, text } from "./draw";
import { rng } from "./util";

type G = CanvasRenderingContext2D;
export type MockKind = "landing" | "shop" | "dashboard" | "studio" | "chart" | "form" | "mobile" | "pricing" | "profile";

const cache = new Map<string, HTMLCanvasElement>();

export function mockup(kind: MockKind, w: number, h: number): HTMLCanvasElement {
  const key = `${kind}:${w}x${h}`;
  let c = cache.get(key);
  if (!c) {
    c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    DRAW[kind](g, w, h);
    cache.set(key, c);
  }
  return c;
}

const bar = (g: G, x: number, y: number, w: number, h: number, col: string) => {
  g.fillStyle = col;
  rr(g, x, y, w, h, h / 2);
  g.fill();
};

const imageBox = (g: G, x: number, y: number, w: number, h: number, r: number, seed: number, dark: boolean) => {
  const R = rng(seed);
  const gr = g.createLinearGradient(x, y, x + w, y + h);
  const a = dark ? 20 + R() * 30 : 190 + R() * 40;
  const b = dark ? 50 + R() * 50 : 120 + R() * 60;
  gr.addColorStop(0, `rgb(${a},${a},${a})`);
  gr.addColorStop(1, `rgb(${b},${b},${b})`);
  g.fillStyle = gr;
  rr(g, x, y, w, h, r);
  g.fill();
  // abstract shape inside
  g.save();
  rr(g, x, y, w, h, r);
  g.clip();
  g.globalAlpha = 0.35;
  g.fillStyle = dark ? "#fff" : "#000";
  g.beginPath();
  g.arc(x + w * (0.3 + R() * 0.4), y + h * (0.4 + R() * 0.3), Math.min(w, h) * (0.18 + R() * 0.2), 0, Math.PI * 2);
  g.fill();
  g.restore();
};

const nav = (g: G, w: number, s: number, brand: string, dark: boolean) => {
  const fg = dark ? "#f2f2f2" : "#111";
  const mid = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  g.fillStyle = fg;
  g.beginPath();
  g.arc(36 * s, 38 * s, 9 * s, 0, Math.PI * 2);
  g.fill();
  text(g, brand, 54 * s, 44 * s, { size: 17 * s, weight: 600, color: fg });
  const narrow = w < 640 * s;
  if (!narrow) for (let i = 0; i < 3; i++) bar(g, w - (330 - i * 70) * s, 34 * s, 50 * s, 8 * s, mid);
  g.fillStyle = fg;
  rr(g, w - 120 * s, 22 * s, 92 * s, 32 * s, 16 * s);
  g.fill();
  g.fillStyle = dark ? "#111" : "#fff";
  rr(g, w - 98 * s, 35 * s, 48 * s, 6 * s, 3 * s);
  g.fill();
};

const DRAW: Record<MockKind, (g: G, w: number, h: number) => void> = {
  landing(g, w, h) {
    const s = w / 960;
    const narrow = h > w * 1.2;
    g.fillStyle = "#0c0c0c";
    g.fillRect(0, 0, w, h);
    nav(g, w, s, COPY.mockups.landing.brand, true);
    const size = (narrow ? 64 : 60) * s;
    const lines = narrow ? ["Una web", "que trabaja", "por ti"] : ["Una web que", "trabaja por ti"];
    lines.forEach((l, i) => text(g, l, 48 * s, 170 * s + i * size * 1.05, { size, weight: 600, color: "#f5f5f5", track: -0.03 }));
    let y = 170 * s + lines.length * size * 1.05 + 10 * s;
    for (let i = 0; i < 2; i++) bar(g, 48 * s, y + i * 22 * s, (narrow ? 300 : 380 - i * 90) * s, 9 * s, "rgba(255,255,255,0.28)");
    y += 70 * s;
    g.fillStyle = "#fff";
    rr(g, 48 * s, y, 150 * s, 46 * s, 23 * s);
    g.fill();
    text(g, COPY.mockups.landing.cta, 74 * s, y + 29 * s, { size: 16 * s, weight: 600, color: "#000" });
    g.strokeStyle = "rgba(255,255,255,0.3)";
    rr(g, 214 * s, y, 150 * s, 46 * s, 23 * s);
    g.stroke();
    // hero visual
    const hx = narrow ? 48 * s : 540 * s;
    const hy = narrow ? y + 90 * s : 120 * s;
    const hw = narrow ? w - 96 * s : 372 * s;
    imageBox(g, hx, hy, hw, (narrow ? 360 : 330) * s, 22 * s, 3, true);
    // features + more sections for scrolling
    y = Math.max(y + 120 * s, hy + 380 * s);
    const cols = narrow ? 1 : 3;
    const cw = (w - 96 * s - (cols - 1) * 20 * s) / cols;
    for (let r = 0; y < h; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 48 * s + c * (cw + 20 * s);
        g.fillStyle = "#151515";
        rr(g, x, y, cw, 190 * s, 18 * s);
        g.fill();
        g.strokeStyle = "rgba(255,255,255,0.08)";
        g.stroke();
        g.fillStyle = "rgba(255,255,255,0.85)";
        rr(g, x + 22 * s, y + 24 * s, 34 * s, 34 * s, 10 * s);
        g.fill();
        bar(g, x + 22 * s, y + 90 * s, cw * 0.6, 12 * s, "rgba(255,255,255,0.75)");
        bar(g, x + 22 * s, y + 120 * s, cw * 0.8, 8 * s, "rgba(255,255,255,0.25)");
        bar(g, x + 22 * s, y + 140 * s, cw * 0.5, 8 * s, "rgba(255,255,255,0.25)");
      }
      y += 220 * s;
      if (r % 2 === 1) {
        imageBox(g, 48 * s, y, w - 96 * s, 260 * s, 22 * s, 10 + r, true);
        y += 290 * s;
      }
    }
  },

  shop(g, w, h) {
    const s = w / 960;
    const narrow = h > w * 1.2;
    g.fillStyle = "#f3f3f1";
    g.fillRect(0, 0, w, h);
    nav(g, w, s, COPY.mockups.shop.brand, false);
    text(g, COPY.mockups.shop.title, 48 * s, 150 * s, { size: (narrow ? 50 : 54) * s, weight: 600, color: "#111", track: -0.03 });
    const pills = ["Todo", "Nuevo", "Ofertas"];
    pills.forEach((p, i) => {
      g.strokeStyle = "rgba(0,0,0,0.2)";
      g.fillStyle = i === 0 ? "#111" : "transparent";
      rr(g, 48 * s + i * 110 * s, 180 * s, 96 * s, 34 * s, 17 * s);
      if (i === 0) g.fill();
      g.stroke();
      text(g, p, 48 * s + i * 110 * s + 48 * s, 202 * s, { size: 13 * s, weight: 500, align: "center", color: i === 0 ? "#fff" : "#333" });
    });
    const cols = narrow ? 2 : 3;
    const gap = 22 * s;
    const cw = (w - 96 * s - gap * (cols - 1)) / cols;
    let y = 250 * s;
    let n = 0;
    while (y < h) {
      for (let c = 0; c < cols; c++) {
        const x = 48 * s + c * (cw + gap);
        imageBox(g, x, y, cw, cw * 1.15, 16 * s, 40 + n, false);
        bar(g, x, y + cw * 1.15 + 18 * s, cw * 0.6, 10 * s, "rgba(0,0,0,0.75)");
        text(g, `€${29 + ((n * 17) % 60)}`, x, y + cw * 1.15 + 56 * s, { size: 15 * s, weight: 600, color: "#111" });
        n++;
      }
      y += cw * 1.15 + 90 * s;
    }
  },

  dashboard(g, w, h) {
    const s = w / 960;
    const narrow = h > w * 1.2;
    g.fillStyle = "#0b0b0b";
    g.fillRect(0, 0, w, h);
    const side = narrow ? 0 : 180 * s;
    if (side) {
      g.fillStyle = "#111";
      g.fillRect(0, 0, side, h);
      g.fillStyle = "#eee";
      g.beginPath();
      g.arc(34 * s, 38 * s, 9 * s, 0, Math.PI * 2);
      g.fill();
      text(g, COPY.mockups.dashboard.brand, 52 * s, 44 * s, { size: 16 * s, weight: 600, color: "#eee" });
      for (let i = 0; i < 7; i++) {
        if (i === 1) {
          g.fillStyle = "rgba(255,255,255,0.08)";
          rr(g, 14 * s, 92 * s + i * 44 * s, side - 28 * s, 34 * s, 10 * s);
          g.fill();
        }
        bar(g, 30 * s, 106 * s + i * 44 * s, (60 + ((i * 37) % 50)) * s, 7 * s, i === 1 ? "#fff" : "rgba(255,255,255,0.3)");
      }
    }
    const x0 = side + 32 * s;
    const cw = w - x0 - 32 * s;
    text(g, COPY.mockups.dashboard.title, x0, 64 * s, { size: 26 * s, weight: 600, color: "#f2f2f2", track: -0.02 });
    const kp = narrow ? 2 : 3;
    const kw = (cw - (kp - 1) * 16 * s) / kp;
    const vals = ["12,4k", "3,8%", "€8,2k"];
    for (let i = 0; i < kp; i++) {
      const x = x0 + i * (kw + 16 * s);
      g.fillStyle = "#141414";
      rr(g, x, 96 * s, kw, 110 * s, 16 * s);
      g.fill();
      bar(g, x + 18 * s, 120 * s, 70 * s, 7 * s, "rgba(255,255,255,0.3)");
      text(g, vals[i], x + 18 * s, 176 * s, { size: 34 * s, weight: 600, color: "#fff", track: -0.02 });
    }
    // line chart
    const cy = 230 * s;
    const ch = 260 * s;
    g.fillStyle = "#141414";
    rr(g, x0, cy, cw, ch, 16 * s);
    g.fill();
    const R = rng(5);
    g.beginPath();
    for (let i = 0; i <= 24; i++) {
      const x = x0 + 24 * s + (i / 24) * (cw - 48 * s);
      const y = cy + ch - 40 * s - (0.15 + 0.7 * (i / 24) ** 1.3 + R() * 0.12) * (ch - 80 * s);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.strokeStyle = "#fff";
    g.lineWidth = 3 * s;
    g.stroke();
    g.lineTo(x0 + cw - 24 * s, cy + ch - 40 * s);
    g.lineTo(x0 + 24 * s, cy + ch - 40 * s);
    const fg = g.createLinearGradient(0, cy, 0, cy + ch);
    fg.addColorStop(0, "rgba(255,255,255,0.18)");
    fg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = fg;
    g.fill();
    // table
    let y = cy + ch + 28 * s;
    for (let i = 0; y < h; i++) {
      g.fillStyle = i % 2 ? "#0f0f0f" : "#131313";
      g.fillRect(x0, y, cw, 52 * s);
      bar(g, x0 + 18 * s, y + 22 * s, 140 * s, 8 * s, "rgba(255,255,255,0.55)");
      bar(g, x0 + cw * 0.45, y + 22 * s, 80 * s, 8 * s, "rgba(255,255,255,0.25)");
      bar(g, x0 + cw - 110 * s, y + 18 * s, 80 * s, 16 * s, i % 3 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)");
      y += 56 * s;
    }
  },

  studio(g, w, h) {
    const s = w / 960;
    const narrow = h > w * 1.2;
    g.fillStyle = "#ececea";
    g.fillRect(0, 0, w, h);
    nav(g, w, s, COPY.mockups.studio.brand, false);
    const size = (narrow ? 70 : 84) * s;
    const words = COPY.mockups.studio.title.split(" ");
    const lines = narrow ? words : [words[0], words.slice(1).join(" ")];
    lines.forEach((l, i) => text(g, l, 44 * s, 170 * s + i * size, { size, weight: 600, color: "#0d0d0d", track: -0.045 }));
    let y = 170 * s + lines.length * size;
    const cols = narrow ? 1 : 2;
    const gap = 20 * s;
    const cw = (w - 88 * s - gap * (cols - 1)) / cols;
    const R = rng(21);
    const colY = Array.from({ length: cols }, () => y);
    for (let i = 0; Math.min(...colY) < h; i++) {
      const c = colY.indexOf(Math.min(...colY));
      const ih = cw * (0.6 + R() * 0.6);
      imageBox(g, 44 * s + c * (cw + gap), colY[c], cw, ih, 10 * s, 60 + i, i % 3 === 0);
      bar(g, 44 * s + c * (cw + gap), colY[c] + ih + 14 * s, cw * 0.4, 8 * s, "rgba(0,0,0,0.6)");
      colY[c] += ih + 52 * s;
    }
  },

  chart(g, w, h) {
    const s = w / 960;
    g.fillStyle = "#0d0d0d";
    g.fillRect(0, 0, w, h);
    text(g, "Rendimiento", 48 * s, 80 * s, { size: 30 * s, weight: 600, color: "#fff" });
    text(g, "+48%", 48 * s, 170 * s, { size: 72 * s, weight: 600, color: "#fff", track: -0.03 });
    const R = rng(9);
    for (let i = 0; i < 14; i++) {
      const bh = (0.2 + 0.75 * (i / 13) + R() * 0.12) * 300 * s;
      g.fillStyle = i === 13 ? "#fff" : `rgba(255,255,255,${0.18 + i * 0.03})`;
      rr(g, 48 * s + i * 62 * s, h - 60 * s - bh, 40 * s, bh, 8 * s);
      g.fill();
    }
  },

  form(g, w, h) {
    const s = w / 960;
    g.fillStyle = "#f2f2f0";
    g.fillRect(0, 0, w, h);
    text(g, "Reserva una llamada", 56 * s, 96 * s, { size: 40 * s, weight: 600, color: "#111", track: -0.03 });
    for (let i = 0; i < 3; i++) {
      bar(g, 56 * s, 150 * s + i * 100 * s, 120 * s, 8 * s, "rgba(0,0,0,0.4)");
      g.strokeStyle = "rgba(0,0,0,0.18)";
      g.lineWidth = 2 * s;
      rr(g, 56 * s, 170 * s + i * 100 * s, w - 112 * s, 52 * s, 12 * s);
      g.stroke();
    }
    g.fillStyle = "#111";
    rr(g, 56 * s, h - 110 * s, w - 112 * s, 60 * s, 30 * s);
    g.fill();
    text(g, "Enviar", w / 2, h - 72 * s, { size: 20 * s, weight: 600, color: "#fff", align: "center" });
  },

  mobile(g, w, h) {
    const s = w / 400;
    g.fillStyle = "#0d0d0d";
    g.fillRect(0, 0, w, h);
    bar(g, w / 2 - 50 * s, 18 * s, 100 * s, 22 * s, "#000");
    text(g, "Hola, Ana", 28 * s, 110 * s, { size: 34 * s, weight: 600, color: "#fff" });
    imageBox(g, 28 * s, 140 * s, w - 56 * s, 220 * s, 22 * s, 77, true);
    for (let i = 0; i < 4; i++) {
      const y = 390 * s + i * 86 * s;
      g.fillStyle = "#161616";
      rr(g, 28 * s, y, w - 56 * s, 70 * s, 16 * s);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.8)";
      rr(g, 42 * s, y + 15 * s, 40 * s, 40 * s, 12 * s);
      g.fill();
      bar(g, 98 * s, y + 24 * s, 160 * s, 8 * s, "rgba(255,255,255,0.7)");
      bar(g, 98 * s, y + 42 * s, 110 * s, 7 * s, "rgba(255,255,255,0.25)");
    }
  },

  pricing(g, w, h) {
    const s = w / 960;
    g.fillStyle = "#0c0c0c";
    g.fillRect(0, 0, w, h);
    text(g, "Planes", 56 * s, 90 * s, { size: 40 * s, weight: 600, color: "#fff" });
    for (let i = 0; i < 3; i++) {
      const x = 56 * s + i * 290 * s;
      g.fillStyle = i === 1 ? "#f2f2f2" : "#151515";
      rr(g, x, 130 * s, 262 * s, h - 180 * s, 20 * s);
      g.fill();
      const fg = i === 1 ? "#111" : "#fff";
      bar(g, x + 24 * s, 168 * s, 90 * s, 9 * s, i === 1 ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.4)");
      text(g, ["Básico", "Pro", "A medida"][i], x + 24 * s, 236 * s, { size: 32 * s, weight: 600, color: fg });
      for (let j = 0; j < 4; j++) bar(g, x + 24 * s, 280 * s + j * 30 * s, (160 - j * 18) * s, 8 * s, i === 1 ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.22)");
    }
  },

  profile(g, w, h) {
    const s = w / 960;
    g.fillStyle = "#f1f1ef";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(110 * s, 120 * s, 56 * s, 0, Math.PI * 2);
    g.fill();
    text(g, "Ana · Cliente", 190 * s, 112 * s, { size: 30 * s, weight: 600, color: "#111" });
    bar(g, 190 * s, 134 * s, 180 * s, 8 * s, "rgba(0,0,0,0.35)");
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "#111";
      font(g, 30 * s, 600);
      g.fillText("★", 56 * s + i * 40 * s, 250 * s);
    }
    for (let i = 0; i < 3; i++) bar(g, 56 * s, 300 * s + i * 30 * s, (760 - i * 160) * s, 9 * s, "rgba(0,0,0,0.3)");
  },
};

/**
 * Builds the HyperFrames compositions from src/template.html + content/timing.json.
 *
 *   index.html               9:16 · 1080×1920  (master)
 *
 * Every scene start/length, caption page and word span is written as static markup
 * from timing.json, so Studio, lint and the renderer all see the real voice timing.
 * The stickman rigs, the street and the phone/web UI are generated here as SVG/HTML.
 *
 *   node scripts/build.mjs        (npm run build)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const T = JSON.parse(readFileSync(join(root, "content/timing.json"), "utf8"));
const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const S = Object.fromEntries(T.scenes.map((s) => [s.id, s]));
const ORDER = ["gancho", "seva", "busqueda", "ficha", "informatica", "web", "marca", "valores", "cierre"];

// ── stickman rig ──────────────────────────────────────────────────────
// Local space: hip at (0,0), y down; feet on y=144, head top at y≈-208.
// Each joint is a <g> with transform="rotate(a x y)"; GSAP tweens the attribute string.
// Joints: torso (lean, about the hip), head, shL/elL (left arm, screen-left), shR/elR, hpL/knL, hpR/knR.
const J = { sh: [0, -132], el: [0, -72], hand: [0, -14], hip: [0, 0], kn: [0, 72], foot: [0, 144], neck: [0, -140], head: [0, -176] };
const line = (a, b, cls = "") => `<line${cls ? ` class="${cls}"` : ""} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;

/** accessories drawn in the rig's local space, by attachment point */
const ACC = {
  martin: {
    torso: `<path class="acc fillsoft" d="M-24 -112 L24 -112 L30 22 L-30 22 Z"/><path class="acc" d="M-24 -112 Q0 -128 24 -112"/><rect class="acc" x="-12" y="-62" width="24" height="18" rx="3"/>`,
    head: `<path class="acc" d="M22 -192 L44 -214"/><path class="acc" d="M40 -218 L48 -210"/>`, // pencil behind the ear
    handR: `<g class="acc wrench"><path d="M0 -14 L0 30"/><path d="M-9 30 Q0 50 9 30 L5 30 L5 38 L-5 38 L-5 30 Z"/></g>`,
  },
  rival: {
    torso: `<path class="acc" d="M-9 -128 L0 -118 L9 -128 L9 -106 L0 -116 L-9 -106 Z"/><path class="acc" d="M-16 -132 L-6 -60 M16 -132 L6 -60"/><rect class="acc fillsoft" x="-14" y="-62" width="28" height="18" rx="4"/>`,
    handR: `<g class="acc phone"><rect x="-11" y="-30" width="22" height="38" rx="5"/><line x1="-6" y1="-22" x2="6" y2="-22"/></g>`,
  },
  client: {
    torso: `<path class="acc" d="M-16 -128 Q0 -112 16 -128"/>`,
    handL: `<g class="acc bag"><path d="M-16 -8 L16 -8 L20 40 L-20 40 Z"/><path d="M-8 -8 Q-8 -24 0 -24 Q8 -24 8 -8"/></g>`,
  },
};

function stickman(id, kind) {
  const a = ACC[kind] || {};
  const g = (cls, pivot, inner) => `<g class="j ${cls}" data-px="${pivot[0]}" data-py="${pivot[1]}" transform="rotate(0 ${pivot[0]} ${pivot[1]})">${inner}</g>`;
  const arm = (side) =>
    g(`sh${side}`, J.sh, line(J.sh, J.el) + g(`el${side}`, J.el, line(J.el, J.hand) + `<circle class="hand" cx="0" cy="${J.hand[1]}" r="4"/>` + (a["hand" + side] || "")));
  const leg = (side) => g(`hp${side}`, J.hip, line(J.hip, J.kn) + g(`kn${side}`, J.kn, line(J.kn, J.foot) + `<path d="M0 144 L${side === "R" ? 14 : -14} 146"/>`));
  return `<svg class="stick ${kind}" id="${id}" viewBox="-130 -240 260 400" aria-hidden="true">
    <ellipse class="shadow" cx="0" cy="150" rx="58" ry="8"/>
    <g class="body">${leg("L")}${leg("R")}${g("torso", J.hip, line(J.hip, J.neck) + (a.torso || "") + arm("L") + arm("R") + g("head", J.neck, `<circle cx="0" cy="${J.head[1]}" r="31"/>` + (a.head || "") + `<circle class="eye" cx="-10" cy="-180" r="3.2"/><circle class="eye" cx="10" cy="-180" r="3.2"/>`))}</g>
  </svg>`;
}

// ── street (background, drawn once, blurred in CSS) ─────────────────
function street(w = 1600, h = 1920) {
  let s = `<svg class="street" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">`;
  s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset="0.6" stop-color="#0d0d0e"/><stop offset="1" stop-color="#121213"/></linearGradient>
  <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  // far rooftops (deterministic pseudo-random heights)
  const hsh = (i) => ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
  for (let x = 0, i = 0; x < w; i++) {
    const fw = 130 + Math.round(hsh(i) * 50);
    s += `<rect x="${x}" y="${420 + Math.round(hsh(i + 50) * 150)}" width="${fw}" height="${h}" fill="#0f0f10"/>`;
    x += fw - 10;
  }
  // facades with shops at street level (ground at y=1180)
  for (let x = -20, i = 0; x < w; i++) {
    const fw = 260 + Math.round(hsh(i + 9) * 40), y = 600 + Math.round(hsh(i + 21) * 100);
    s += `<rect x="${x}" y="${y}" width="${fw}" height="${1180 - y}" fill="${i % 2 ? "#161617" : "#19191a"}"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const lit = (i * 7 + r * 3 + c) % 5 === 0;
      s += `<rect x="${x + 30 + c * ((fw - 60) / 3)}" y="${y + 40 + r * 110}" width="${(fw - 60) / 3 - 22}" height="70" rx="3" fill="${lit ? "#3a3a3a" : "#101011"}"/>`;
    }
    s += `<rect x="${x + 18}" y="980" width="${fw - 36}" height="200" fill="#0c0c0c"/>`;
    s += `<path d="M${x + 8} 960 L${x + fw - 8} 960 L${x + fw - 28} 1000 L${x + 28} 1000 Z" fill="#232324"/>`;
    x += fw + 10;
  }
  // pavement + kerb + street lamps
  s += `<rect x="0" y="1180" width="${w}" height="${h - 1180}" fill="#0e0e0f"/><rect x="0" y="1180" width="${w}" height="6" fill="#262627"/>`;
  for (let x = 200 + ((w - 1600) / 2) % 560; x < w; x += 560) s += `<circle cx="${x}" cy="860" r="190" fill="url(#lamp)"/><rect x="${x - 3}" y="860" width="6" height="320" fill="#1e1e1f"/>`;
  return s + `</svg>`;
}

// ── shops in focus (mid-ground): Martín's (left) and the new one (right) ──
const SHOP_MARTIN = `<div class="shop martin" id="shopMartin" data-layout-allow-occlusion data-layout-allow-overlap>
  <div class="sign"><span class="name" data-layout-allow-occlusion>FERRETERÍA MARTÍN</span><span class="since" id="since" data-layout-allow-occlusion>DESDE 2005</span></div>
  <div class="window"><div class="shelf"></div><div class="shelf"></div><div class="webshot" id="webshot"><i></i><i></i><i></i></div></div>
  <div class="door"></div>
</div>`;
const SHOP_RIVAL = `<div class="shop rival" id="shopRival" data-layout-allow-occlusion data-layout-allow-overlap data-layout-allow-overflow>
  <div class="sign"><span class="name" data-layout-allow-occlusion>FERRETERÍA NOVA</span><span class="badge" data-layout-allow-occlusion>NUEVO</span></div>
  <div class="window lit"><div class="shelf"></div><div class="shelf"></div></div>
  <div class="door"></div>
</div>`;

// ── captions: one page per card, one span per word ─────────────────
const words = T.words;
const CAPTIONS = T.captions
  .map((c, n) => {
    const rows = c.rows
      .map((r) => `<div class="row">${r.map((i) => `<span class="w${words[i].key ? " k" : ""}" data-t="${words[i].start}">${esc(words[i].text)}</span>`).join(" ")}</div>`)
      .join("");
    return `<div class="page" id="cap${n}" data-in="${c.start}" data-out="${c.end}">${rows}</div>`;
  })
  .join("\n        ");

// ── NUVEN mark (brand-paths.ts) ─────────────────────────────────────
const MARK = `<svg class="mark" viewBox="0 0 100 80" aria-hidden="true">
  <path d="M7.5 17h23.8v41H7.5z" fill="#d9d9d9"/><path d="M68.3 19.2h24v40.6h-24z" fill="#9a9a9a"/>
  <path d="M7.5 17C7.5 10 13.6 5 21.6 5H27.4C30.2 5 32.2 6 34 7.7L92.3 59.8C92.3 67.4 86.6 72.6 79 72.6H76.6C74.2 72.6 72.5 71.9 70.8 70.4L12.6 18.6C11.1 17.3 9.4 16.9 7.5 17Z" fill="#fff"/></svg>`;

const ICONS = {
  design: `<svg viewBox="0 0 64 64"><path d="M14 50 L32 14 L50 50"/><path d="M22 36 H42"/><circle cx="32" cy="14" r="3"/></svg>`,
  speed: `<svg viewBox="0 0 64 64"><path d="M36 8 L18 36 H32 L28 56 L46 28 H32 Z"/></svg>`,
  pin: `<svg viewBox="0 0 64 64"><path class="pinp" d="M32 56 C32 56 14 38 14 26 A18 18 0 0 1 50 26 C50 38 32 56 32 56 Z"/><circle class="pinp" cx="32" cy="26" r="6"/><path class="phonep" d="M20 12 C16 14 14 20 18 28 C24 40 32 48 42 52 C48 54 52 50 52 46 L44 40 L38 44 C32 41 26 35 22 28 L26 22 Z"/></svg>`,
};

const VARIANTS = {
  v: { W: 1080, H: 1920, LABEL: "9:16", ID: "nuven-avatares", file: "index.html", BASE: "", streetW: 1600 },
  s: { W: 1080, H: 1080, LABEL: "1:1", ID: "nuven-avatares-1x1", file: "cuadrado/index.html", BASE: "", streetW: 1800 },
  h: { W: 1920, H: 1080, LABEL: "16:9", ID: "nuven-avatares-16x9", file: "horizontal/index.html", BASE: "", streetW: 3200 },
};

function render(o) {
  const V = VARIANTS[o];
  let html = readFileSync(join(root, "src/template.html"), "utf8");
  const vars = {
    W: V.W, H: V.H, ORIENT: o, LABEL: V.LABEL, ID: V.ID, BASE: V.BASE,
    D: r3(T.duration), VOICE_LEN: r3(T.voice_length),
    STREET: street(V.streetW), FAR_W: V.streetW, FAR_LEFT: -(V.streetW - 1080) / 2, SHOP_MARTIN, SHOP_RIVAL, MARK,
    MARTIN: stickman("martin", "martin"), RIVAL: stickman("rival", "rival"), CLIENT: stickman("client", "client"),
    MARTIN_BIG: stickman("martinBig", "martin"),
    ICON_DESIGN: ICONS.design, ICON_SPEED: ICONS.speed, ICON_PIN: ICONS.pin,
    CAPTIONS,
    MUSIC_VOL: "0.55", SFX_VOL: "0.7",
    WORDMARK: [..."NUVEN"].map((c) => `<span>${c}</span>`).join(""),
    WORDSUB: [..."DIGITAL"].map((c) => `<span>${c}</span>`).join(""),
  };
  ORDER.forEach((id, i) => {
    vars[`S${i + 1}_START`] = r3(S[id].start);
    vars[`S${i + 1}_DUR`] = r3(S[id].end - S[id].start);
  });
  return html.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) throw new Error(`template variable ${k} has no value`);
    return String(vars[k]);
  });
}

for (const o of Object.keys(VARIANTS)) {
  const f = join(root, VARIANTS[o].file);
  mkdirSync(dirname(f), { recursive: true });
  if (o !== "v" && !existsSync(join(dirname(f), "assets"))) symlinkSync("../assets", join(dirname(f), "assets"));
  writeFileSync(f, render(o));
}

// ── voiceover carve: the music bed dips under the voice (/hyperframes-audio) ──
const carve = join(homedir(), ".claude/skills/hyperframes-audio/scripts/carve.mjs");
if (existsSync(carve) && existsSync(join(root, "assets/audio/voz-master.wav"))) {
  execFileSync("node", [carve, "--comp", join(root, "index.html"), "--bed", "music", "--voice", "voz", "--strength", "0.7"], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
  const tag = /<audio\b[^>]*\bid="music"[^>]*><\/audio>/;
  const carved = readFileSync(join(root, "index.html"), "utf8").match(tag)[0].replace(/ data-hf-id="[^"]*"/, "");
  for (const o of ["s", "h"]) {
    const f = join(root, VARIANTS[o].file);
    writeFileSync(f, readFileSync(f, "utf8").replace(tag, carved));
  }
  console.log("✓ música con carve bajo la voz (strength 0.7)");
} else {
  console.warn("! carve.mjs o voz-master.wav no encontrados — la música no se agacha bajo la voz");
}
console.log(`✓ index.html (9:16) + cuadrado/ (1:1) + horizontal/ (16:9) · ${T.duration}s · ${T.captions.length} páginas de subtítulos`);

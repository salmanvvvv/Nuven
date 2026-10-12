import { RIBBON_NORMAL } from "./brand";
import { POST, T } from "./config";
import { lockupGeom } from "./draw";
import { drawCards } from "./scenes/cards";
import { drawIntro } from "./scenes/intro";
import { drawLens, lensBarrel, LENS_EXIT } from "./scenes/lens";
import { drawMetrics } from "./scenes/metrics";
import { drawLogoEnd, drawPhrase, OUTRO } from "./scenes/outro";
import { drawParticles, PARTICLE_COLLAPSE } from "./scenes/particles";
import { drawTiles } from "./scenes/tiles";
import { drawType, TYPE_INVERT } from "./scenes/type";
import { beamWipe, irisWipe, ribbonWipe } from "./transitions";
import type { PostParams, RC } from "./types";
import { k, lerp } from "./util";

/** Transition windows (global seconds). Each one overlaps the two scenes it joins. */
export const X = {
  introOut: [T.tiles - 0.25, T.tiles + 0.3], // logo zooms through, iris opens on the tiles
  tilesOut: [T.type - 0.32, T.type + 0.25], // white ribbon wipe
  lensIn: [T.lens, T.lens], // lens is a continuous effect inside scene 4
  cardsOut: [T.metrics - 0.32, T.metrics + 0.25], // white ribbon wipe, reversed
  metricsOut: [T.particles - 0.15, T.particles + 0.15], // beam of light sweeps down
  particlesOut: [T.outro - 0.1, T.outro + 0.25], // core flash opens to white
  phraseOut: [T.outro + OUTRO.wipe, T.outro + OUTRO.wipe + 0.35], // black ribbon wipe
} as const;

/**
 * Draws the frame at rc.t: decides which scenes are on screen and how the
 * transitions between them mix. Pure function of time.
 */
export function compose(rc: RC) {
  const { g, t, cx, cy } = rc;
  const intro = () => drawIntro(rc, t);
  const tiles = () => drawTiles(rc, t - T.tiles);
  const type = () => drawType(rc, t - T.type);
  const cards = () => drawCards(rc, t - T.cards);
  const metrics = () => drawMetrics(rc, t - T.metrics);
  const particles = () => drawParticles(rc, t - T.particles);
  const phrase = () => drawPhrase(rc, t - T.outro);
  const logo = () => drawLogoEnd(rc, t - T.outro);

  g.save();
  if (t < X.introOut[0]) intro();
  else if (t < X.introOut[1]) {
    const my = lockupGeom(rc).markCy;
    const zoom = k(t, X.introOut[0], X.introOut[1] - 0.05, "power2.in");
    irisWipe(
      rc,
      k(t, X.introOut[0] + 0.16, X.introOut[1], "expo.in"),
      cx,
      my,
      () => {
        g.save();
        g.translate(cx, my);
        g.scale(1 + zoom * 1.6, 1 + zoom * 1.6);
        g.translate(-cx, -my);
        intro();
        g.restore();
      },
      tiles,
    );
  } else if (t < X.tilesOut[0]) tiles();
  else if (t < X.tilesOut[1]) ribbonWipe(rc, k(t, X.tilesOut[0], X.tilesOut[1], "power3.inOut"), tiles, type);
  else if (t < T.lens) type();
  else if (t < T.lens + LENS_EXIT + 0.5) drawLens(rc, t - T.lens);
  else if (t < X.cardsOut[0]) cards();
  else if (t < X.cardsOut[1]) ribbonWipe(rc, k(t, X.cardsOut[0], X.cardsOut[1], "power3.inOut"), cards, metrics, { reverse: true });
  else if (t < X.metricsOut[0]) metrics();
  else if (t < X.metricsOut[1]) beamWipe(rc, k(t, X.metricsOut[0], X.metricsOut[1], "power2.inOut"), metrics, particles);
  else if (t < X.particlesOut[0]) particles();
  else if (t < X.particlesOut[1]) irisWipe(rc, k(t, X.particlesOut[0], X.particlesOut[1], "expo.in"), cx, cy, particles, phrase);
  else if (t < X.phraseOut[0]) phrase();
  else if (t < X.phraseOut[1]) ribbonWipe(rc, k(t, X.phraseOut[0], X.phraseOut[1], "power3.inOut"), phrase, logo, { dark: true });
  else logo();
  g.restore();
}

const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, (t - a) / (b - a))));

export function postAt(t: number, rc?: RC): PostParams {
  const p: PostParams = {
    barrel: 0,
    bloom: POST.bloom,
    bloomThreshold: 0.68,
    vignette: POST.vignette,
    grain: POST.grain,
    zoomBlur: 0,
    center: [0.5, 0.5],
    dir: [0, 0],
  };

  // a small bloom kick when the ribbon closes the N
  p.bloom += 0.35 * (k(t, 1.7, 1.95) - k(t, 1.95, 2.6));

  // white scenes: almost no bloom, lighter vignette
  const white =
    (t >= X.tilesOut[0] + 0.25 && t < T.type + TYPE_INVERT ? 1 : 0) || (t >= X.particlesOut[0] + 0.2 && t < X.phraseOut[0] + 0.2 ? 1 : 0);
  p.bloom *= 1 - 0.85 * white;
  p.vignette = lerp(p.vignette, 0.14, white);

  // lens / curved screen
  if (t >= T.lens && t < T.lens + LENS_EXIT + 0.6) p.barrel = Math.max(0, lensBarrel(t - T.lens));

  // zoom-through blur: logo → tiles, quadrants → cards, logo collapse
  if (rc) {
    const my = lockupGeom(rc).markCy / rc.H;
    const z1 = bump(t, X.introOut[0], X.introOut[1]);
    if (z1 > 0) {
      p.zoomBlur = 0.16 * z1;
      p.center = [0.5, my];
    }
    const z3 = bump(t, T.outro + OUTRO.collapse, T.outro + OUTRO.black);
    if (z3 > 0) {
      p.zoomBlur = 0.12 * z3;
      p.center = [0.5, my];
    }
  }
  const z2 = bump(t, T.lens + LENS_EXIT, T.lens + LENS_EXIT + 0.55);
  if (z2 > 0) p.zoomBlur = Math.max(p.zoomBlur, 0.13 * z2);
  const z4 = PARTICLE_COLLAPSE(t - T.particles) * (t < T.outro ? 1 : 0);
  if (z4 > 0) p.zoomBlur = Math.max(p.zoomBlur, 0.08 * z4);

  // directional blur during the wipes, along the sweep
  const wipes: [readonly [number, number], number][] = [
    [X.tilesOut, 1],
    [X.cardsOut, -1],
    [X.phraseOut, 1],
  ];
  for (const [w, s] of wipes) {
    const b = bump(t, w[0], w[1]);
    if (b > 0) p.dir = [RIBBON_NORMAL.x * s * 0.018 * b, RIBBON_NORMAL.y * s * 0.018 * b];
  }
  const bb = bump(t, X.metricsOut[0], X.metricsOut[1]);
  if (bb > 0) p.dir = [0, 0.02 * bb];

  return p;
}

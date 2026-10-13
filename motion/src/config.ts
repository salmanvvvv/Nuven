/**
 * Global timing and look of the Nuven Digital motion piece.
 *
 * Every scene reads its start time from `T`, and all choreography inside a
 * scene is written relative to that start. To retime the video, change the
 * numbers here (and `DURATION`) and re-render. Keep `data-duration` in
 * index.html / vertical.html equal to `DURATION`.
 */

export const FPS = 30;
export const DURATION = 22;

/** Scene start times in seconds (the master timeline also gets a label for each). */
export const T = {
  intro: 0, // 1 · grid, light point, beam, logo
  tiles: 3.2, // 2 · 3D tile wave
  type: 6.05, // 3 · kinetic typography (white)
  lens: 8.75, // 4 · fisheye split + floating 3D cards
  cards: 11.0, //     (3D cards part of scene 4)
  metrics: 13.05, // 5 · dashboard
  particles: 16.0, // 6 · particle vortex
  outro: 18.4, // 7 · closing phrase + logo
  end: DURATION,
} as const;

/**
 * Beat times inside the scenes (scene-local seconds). The visuals and the
 * soundtrack generator (scripts/audio.mjs) both read these, so music and
 * SFX stay locked to the picture when you retime anything.
 */
export const BEATS = {
  /** scene 3: solid word changes, then the frame inverts to black */
  type: [0, 0.55, 1.1, 1.7],
  typeInvert: 2.2,
  /** scene 4: quadrant n slides to its mock-up at swapStart + n * swapStep; quadrants fly off at lensExit */
  swapStart: 0.5,
  swapStep: 0.11,
  lensExit: 1.95,
  /** scene 5: counter count-up window, toggle switch times, button press */
  counter: [0.15, 1.45],
  toggles: [1.1, 1.35, 1.6],
  toggleDur: 0.25,
  press: 2.0,
  /** scene 6: particles gather into the ring, then collapse into the vortex */
  particleForm: [0.4, 1.3],
  particleCollapse: [1.4, 2.3],
  /** scene 7 */
  outro: {
    phrase: 0.2, // first word
    wordStep: 0.17, // delay between words
    highlight: 0.88, // ribbon marker under the key word
    wipe: 1.42, // black ribbon wipe to the logo
    logo: 1.62, // logo starts forming
    collapse: 3.2, // logo collapses into a point of light
    black: 3.56, // point gone → black (matches frame 0)
  },
};

/** Transition windows (global seconds). Each one overlaps the two scenes it joins. */
export const X = {
  introOut: [T.tiles - 0.25, T.tiles + 0.3], // logo zooms through, iris opens on the tiles
  tilesOut: [T.type - 0.32, T.type + 0.25], // white ribbon wipe
  lensIn: [T.lens, T.lens], // lens is a continuous effect inside scene 4
  cardsOut: [T.metrics - 0.32, T.metrics + 0.25], // white ribbon wipe, reversed
  metricsOut: [T.particles - 0.15, T.particles + 0.15], // beam of light sweeps down
  particlesOut: [T.outro - 0.1, T.outro + 0.25], // core flash opens to white
  phraseOut: [T.outro + BEATS.outro.wipe, T.outro + BEATS.outro.wipe + 0.35], // black ribbon wipe
} as const;

/** Monochrome palette. Glows, beams and borders are white / light grey on purpose. */
export const C = {
  black: "#000000",
  ink: "#0a0a0a",
  panel: "#101010",
  line: "rgba(255,255,255,0.10)",
  white: "#ffffff",
  paper: "#f4f4f2", // light background for the 1–2 contrast scenes
  grey: "#9a9a9a",
  greyDark: "#5a5a5a",
  greyLight: "#cfcfcf",
} as const;

export const FONT = "Sora";

/** Post-processing defaults (per-scene overrides live in engine.ts → postAt). */
export const POST = {
  grain: 0.012,
  vignette: 0.34,
  bloom: 0.32,
};

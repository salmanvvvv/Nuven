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

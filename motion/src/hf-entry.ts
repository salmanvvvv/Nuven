/**
 * HyperFrames entry (built to build/nuven-motion.js as an IIFE).
 *
 * The composition root (index.html / vertical/index.html) holds a
 * <canvas id="stage">. mount() builds the motion engine at the root's size;
 * its paused GSAP master timeline is registered on window.__timelines so
 * HyperFrames seeks it frame by frame. We also listen to `hf-seek` and expose
 * window.seek / window.duration for the standalone Playwright renderer.
 */
import gsap from "gsap";
import { createMotion } from "./engine";

declare global {
  interface Window {
    __timelines: Record<string, unknown>;
    __hf?: { buildReady?: Record<string, Promise<unknown>> };
    __hfForceTimelineRebind?: () => void;
    seek: (t: number) => void;
    duration: number;
    motionReady: Promise<void>;
    gsap: typeof gsap;
  }
}

window.gsap = gsap;

/**
 * Builds the engine inside the composition root and resolves with the paused
 * master timeline once fonts are loaded. The inline script in index.html
 * registers it: window.__timelines[id] = (await NuvenMotion.mount()).timeline.
 */
export function mount(): Promise<{ timeline: gsap.core.Timeline }> {
  const root = document.querySelector<HTMLElement>("[data-composition-id]")!;
  const W = Number(root.dataset.width) || 1920;
  const H = Number(root.dataset.height) || 1080;
  const canvas = document.getElementById("stage") as HTMLCanvasElement;

  const motion = createMotion(canvas, W, H);
  window.seek = motion.seek;
  window.duration = motion.duration;
  window.motionReady = motion.ready;

  window.addEventListener("hf-seek", (e) => {
    const time = (e as CustomEvent<{ time: number }>).detail?.time;
    if (typeof time === "number") motion.seek(time);
  });

  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady["nuven-motion"] = motion.ready;

  // Wrapped in an object: a GSAP timeline is thenable, so resolving a promise
  // with it directly would wait for the (paused) timeline to complete.
  return motion.ready.then(() => {
    motion.seek(0);
    return { timeline: motion.timeline };
  });
}

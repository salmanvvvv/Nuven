import gsap from "gsap";
import { DURATION, FONT, FPS, T } from "./config";
import { compose, postAt } from "./compose";
import { createPost } from "./post";
import { ThreeLayer } from "./three-layer";
import type { RC } from "./types";

export interface Motion {
  /** Draw exactly the frame at time t (seconds). */
  seek(t: number): void;
  duration: number;
  fps: number;
  /** Paused GSAP master timeline (the clock HyperFrames seeks). */
  timeline: gsap.core.Timeline;
  ready: Promise<void>;
  width: number;
  height: number;
}

async function loadFonts() {
  // The @font-face rules live in the page; this forces the faces to load
  // before the first frame so canvas text never falls back.
  await Promise.all([300, 400, 500, 600, 700].map((w) => document.fonts.load(`${w} 64px ${FONT}`, "NUVEN DIGITAL ñÑ%+0123")));
  await document.fonts.ready;
}

export function createMotion(canvas: HTMLCanvasElement, W: number, H: number): Motion {
  const work = document.createElement("canvas");
  work.width = W;
  work.height = H;
  const g = work.getContext("2d", { alpha: false, willReadFrequently: false })!;
  const post = createPost(canvas, W, H);
  const three = new ThreeLayer(W, H);

  const rc: RC = {
    g,
    W,
    H,
    u: Math.min(W, H) / 1080,
    cx: W / 2,
    cy: H / 2,
    portrait: H > W,
    t: 0,
    three,
  };

  let last = -1;
  let isReady = false;
  const draw = (t: number) => {
    if (!isReady) return;
    const time = Math.max(0, Math.min(DURATION, t));
    if (time === last) return;
    last = time;
    rc.t = time;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
    g.filter = "none";
    compose(rc);
    post.render(work, postAt(time, rc), Math.round(time * FPS));
  };

  /**
   * Master timeline: a linear clock from 0 to DURATION with a label per scene.
   * Scenes are pure functions of this clock (eases come from GSAP), so the
   * whole piece can be seeked to any frame.
   */
  const clock = { t: 0 };
  const timeline = gsap.timeline({ paused: true, onUpdate: () => draw(clock.t) });
  timeline.to(clock, { t: DURATION, duration: DURATION, ease: "none" }, 0);
  for (const [name, at] of Object.entries(T)) timeline.addLabel(name, at);

  const ready = loadFonts().then(() => {
    isReady = true;
    last = -1;
    draw(clock.t);
  });

  return {
    seek(t: number) {
      timeline.pause();
      timeline.totalTime(Math.max(0, Math.min(DURATION, t)), true);
      draw(clock.t);
    },
    duration: DURATION,
    fps: FPS,
    timeline,
    ready,
    width: W,
    height: H,
  };
}

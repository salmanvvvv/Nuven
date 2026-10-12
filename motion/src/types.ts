import type { ThreeLayer } from "./three-layer";

/** Render context handed to every scene for one frame. */
export interface RC {
  g: CanvasRenderingContext2D;
  W: number;
  H: number;
  /** layout unit: 1 at 1080 px on the short side */
  u: number;
  cx: number;
  cy: number;
  portrait: boolean;
  /** global time in seconds */
  t: number;
  three: ThreeLayer;
}

/** Per-frame parameters of the final WebGL pass. */
export interface PostParams {
  barrel: number;
  bloom: number;
  bloomThreshold: number;
  vignette: number;
  grain: number;
  /** radial (zoom) blur amount, 0 = off */
  zoomBlur: number;
  /** centre of the zoom blur in uv */
  center: [number, number];
  /** directional motion blur vector in uv, [0,0] = off */
  dir: [number, number];
}

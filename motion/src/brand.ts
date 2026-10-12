/**
 * The folded-ribbon "N" of the Nuven logo, shared with the website
 * (src/components/brand-paths.ts). viewBox 0 0 100 80.
 */
export const LEFT_BAR = "M7.5 17h23.8v41H7.5z";
export const RIGHT_BAR = "M68.3 19.2h24v40.6h-24z";
export const RIBBON =
  "M7.5 17C7.5 10 13.6 5 21.6 5H27.4C30.2 5 32.2 6 34 7.7L92.3 59.8C92.3 67.4 86.6 72.6 79 72.6H76.6C74.2 72.6 72.5 71.9 70.8 70.4L12.6 18.6C11.1 17.3 9.4 16.9 7.5 17Z";

/** Visible bounds of the mark inside its viewBox. */
export const MARK_BOX = { x0: 7.5, y0: 5, x1: 92.3, y1: 72.6 };
/** Angle of the ribbon's long axis (degrees) and its unit vectors. */
export const RIBBON_ANGLE = 41.8;
const a = (RIBBON_ANGLE * Math.PI) / 180;
export const RIBBON_DIR = { x: Math.cos(a), y: Math.sin(a) };
export const RIBBON_NORMAL = { x: Math.sin(a), y: -Math.cos(a) };

let cache: { left: Path2D; right: Path2D; ribbon: Path2D } | null = null;
export function markPaths() {
  if (!cache) cache = { left: new Path2D(LEFT_BAR), right: new Path2D(RIGHT_BAR), ribbon: new Path2D(RIBBON) };
  return cache;
}

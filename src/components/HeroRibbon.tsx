"use client";

import { useEffect, useId, useState } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { LEFT_BAR, RIBBON, RIGHT_BAR } from "./brand-paths";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero visual: the "N" ribbon of the logo unfolding. The bars rise, the ribbon
 * is laid down along its diagonal, then a soft sheen travels across the paper.
 * On fine pointers the mark tilts gently towards the cursor.
 */
export function HeroRibbon() {
  const raw = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // 2D drift only: a 3D rotation makes the browser rasterise the SVG and it turns blurry.
  const x = useSpring(useTransform(px, [-1, 1], [-10, 10]), { stiffness: 120, damping: 20, mass: 0.6 });
  const y = useSpring(useTransform(py, [-1, 1], [-8, 8]), { stiffness: 120, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  // Replay the unfolding once the entrance video has finished.
  const [run, setRun] = useState(0);
  useEffect(() => {
    const replay = () => setRun((r) => r + 1);
    window.addEventListener("nuven:intro-done", replay);
    return () => window.removeEventListener("nuven:intro-done", replay);
  }, []);

  const id = (s: string) => `${raw}${s}`;

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]" aria-hidden>
      {/* soft light behind the mark */}
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.13),rgb(255_255_255/0.03)_55%,transparent)] blur-2xl" />

      <m.div key={run} className="relative size-full" style={{ x, y }}>
        <svg viewBox="-6 -6 112 92" className="size-full overflow-visible" shapeRendering="geometricPrecision">
          <defs>
            <linearGradient id={id("l")} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#f2f2f2" />
              <stop offset="0.55" stopColor="#d2d2d2" />
              <stop offset="1" stopColor="#7d7d7d" />
            </linearGradient>
            <linearGradient id={id("r")} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e2e2e2" />
              <stop offset="0.5" stopColor="#a2a2a2" />
              <stop offset="1" stopColor="#4d4d4d" />
            </linearGradient>
            <linearGradient id={id("d")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.65" stopColor="#efefef" />
              <stop offset="1" stopColor="#cfcfcf" />
            </linearGradient>
            <linearGradient id={id("s")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={id("clip")}>
              <path d={RIBBON} />
            </clipPath>
            <mask id={id("mask")} maskUnits="userSpaceOnUse" x="-10" y="-10" width="130" height="110">
              <g transform="rotate(41.8 7.5 5)">
                <m.rect
                  x="0"
                  y="-30"
                  height="80"
                  fill="#fff"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ duration: 1.5, ease: EASE, delay: 0.45 }}
                />
              </g>
            </mask>
          </defs>

          {/* floor shadow */}
          <ellipse cx="50" cy="83" rx="34" ry="1.6" fill="#fff" opacity="0.035" />

          <m.path
            d={LEFT_BAR}
            fill={`url(#${id("l")})`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          />
          <m.path
            d={RIGHT_BAR}
            fill={`url(#${id("r")})`}
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          />
          <g mask={`url(#${id("mask")})`}>
            <path d={RIBBON} fill="#000" opacity="0.35" transform="translate(0 1.4)" />
            <path d={RIBBON} fill={`url(#${id("d")})`} />
            <g clipPath={`url(#${id("clip")})`}>
              <rect
                x="0"
                y="-10"
                width="28"
                height="100"
                fill={`url(#${id("s")})`}
                opacity="0.55"
                className="animate-sheen [transform-box:fill-box] motion-reduce:hidden"
                style={{ animationDelay: "2.2s", animationFillMode: "backwards" }}
              />
            </g>
          </g>
        </svg>
      </m.div>
    </div>
  );
}

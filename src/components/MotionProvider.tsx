"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Loads the small animation bundle once and honours prefers-reduced-motion everywhere. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

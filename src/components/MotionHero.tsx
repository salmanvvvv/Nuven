"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Rendered by /motion (npm run render) and copied to /public/video. */
export const MOTION_VIDEO = {
  webm: "/video/nuven-motion.webm",
  mp4: "/video/nuven-motion.mp4",
  poster: "/video/nuven-motion-poster.jpg",
};

type Props = {
  className?: string;
  /** Above the fold (hero): the poster loads eagerly with high priority so it can be the LCP image. */
  priority?: boolean;
  /** Below the fold: only mount the <video> when it gets close to the viewport. */
  lazy?: boolean;
  /** Describes the video for screen readers. Without it the video is decorative (aria-hidden). */
  label?: string;
  /** Pause / resume playback from a parent control. */
  paused?: boolean;
  /** Called with true while the video is actually playing. */
  onPlayingChange?: (playing: boolean) => void;
  sizes?: string;
};

/**
 * The Nuven Digital motion loop. The poster image is always rendered first
 * (it reserves the 16:9 box and is what visitors with reduced motion see);
 * the <video> mounts after hydration — or when near the viewport if `lazy` —
 * and fades in once it is really playing.
 */
export function MotionHero({ className, priority = false, lazy = false, label, paused = false, onPlayingChange, sizes = "100vw" }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  // stays true after the first frame plays, so pausing freezes the frame instead of fading to the poster
  const [shown, setShown] = useState(false);
  const decorative = !label;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let io: IntersectionObserver | undefined;
    const update = () => {
      io?.disconnect();
      if (reduce.matches) {
        setMounted(false);
        return;
      }
      if (!lazy) {
        setMounted(true);
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setMounted(true);
            io?.disconnect();
          }
        },
        { rootMargin: "300px 0px" },
      );
      if (box.current) io.observe(box.current);
    };
    update();
    reduce.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      io?.disconnect();
    };
  }, [lazy]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, mounted]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  return (
    <div
      ref={box}
      className={cn("relative aspect-video overflow-hidden bg-ink", className)}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
    >
      <Image
        src={MOTION_VIDEO.poster}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
      />
      {mounted && (
        <video
          ref={video}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-[var(--ease-out-soft)]",
            shown ? "opacity-100" : "opacity-0",
          )}
          autoPlay={!paused}
          muted
          loop
          playsInline
          preload="metadata"
          poster={MOTION_VIDEO.poster}
          aria-hidden
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => {
            setPlaying(true);
            setShown(true);
          }}
          onPause={() => setPlaying(false)}
        >
          <source src={MOTION_VIDEO.webm} type="video/webm" />
          <source src={MOTION_VIDEO.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

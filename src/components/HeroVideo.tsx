"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const WATCH_EVENT = "nuven:watch-hero-video";

/** Asks the hero background video to play on its own, uncovered, from the start. */
export function watchHeroVideo() {
  window.dispatchEvent(new Event(WATCH_EVENT));
}

/**
 * Background of the hero: the rest of the motion reel (from second 4), looping.
 * It continues where the entrance video stops: when the intro starts fading out
 * this one starts playing underneath. Without an intro it starts after page load,
 * so it never competes with the first paint. Paused while off screen, and not
 * autoplayed for people who prefer reduced motion.
 *
 * "Ver vídeo" (see WatchVideoButton) switches the hero to watch mode: the copy and
 * overlays fade out (CSS on the section's `data-watching`), the whole frame is
 * shown at full brightness and the video plays once from the start.
 */
export function HeroVideo({ closeLabel }: { closeLabel: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [watching, setWatching] = useState(false);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const section = video.closest("section");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let started = false;
    let visible = true;
    let loaded = false;
    let returnFocus: Element | null = null;

    const ensureLoaded = () => {
      if (loaded) return;
      loaded = true;
      video.preload = "auto";
      video.load();
    };
    const playLoop = () => {
      if (started && visible && !reduce) video.play().catch(() => {});
    };
    const start = () => {
      if (started) return;
      started = true;
      playLoop();
    };

    const watch = () => {
      returnFocus = document.activeElement;
      ensureLoaded();
      section?.setAttribute("data-watching", "");
      setWatching(true);
      video.loop = false;
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const stop = () => {
      if (!section?.hasAttribute("data-watching")) return;
      section.removeAttribute("data-watching");
      setWatching(false);
      video.loop = true;
      if (reduce) video.pause();
      else playLoop();
      if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
    };
    stopRef.current = stop;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && stop();

    const onPlaying = () => video.setAttribute("data-on", "");
    video.addEventListener("playing", onPlaying);
    video.addEventListener("ended", stop);
    window.addEventListener(WATCH_EVENT, watch);
    window.addEventListener("keydown", onKey);

    if (!reduce) {
      ensureLoaded();
      const introActive = document.documentElement.classList.contains("intro-active");
      if (introActive) window.addEventListener("nuven:intro-leaving", start, { once: true });
      else if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        video.pause();
        stop();
      } else playLoop();
    });
    io.observe(video);

    return () => {
      io.disconnect();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("ended", stop);
      window.removeEventListener(WATCH_EVENT, watch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nuven:intro-leaving", start);
      window.removeEventListener("load", start);
    };
  }, []);

  useEffect(() => {
    if (watching) closeRef.current?.focus({ preventScroll: true });
  }, [watching]);

  return (
    <>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-0 brightness-[0.72] transition-[opacity,filter] duration-700 data-[on]:opacity-100 group-data-[watching]/hero:object-contain group-data-[watching]/hero:brightness-100 group-data-[watching]/hero:opacity-100"
      >
        <source src="/intro/hero-540.mp4" type='video/mp4; codecs="avc1.64001F"' />
        <source src="/intro/hero-540.webm" type='video/webm; codecs="vp9"' />
      </video>
      {watching && (
        <button
          ref={closeRef}
          type="button"
          onClick={() => stopRef.current()}
          className="fixed right-5 bottom-6 z-[60] inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-ink/60 px-5 text-[0.8125rem] font-medium text-fg backdrop-blur-md transition-colors duration-200 hover:border-fg/40 hover:bg-ink/80 sm:right-8 sm:bottom-8"
        >
          <X aria-hidden className="size-4" />
          {closeLabel}
        </button>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { INTRO_KEY } from "@/lib/intro";

const LEAVE_MS = 800;

/**
 * Full-screen entrance animation (the Nuven motion reel). Visible only while
 * <html> has the `intro-active` class, set by the INTRO_BOOT script. It ends
 * when the video finishes, on "Saltar intro", Escape, or when the visitor
 * starts scrolling, and it never blocks the site if the video fails.
 */
export function Intro({ label, skipLabel }: { label: string; skipLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const video = videoRef.current;
    if (!video || !root.classList.contains("intro-active")) return;

    let done = false;
    let raf = 0;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* storage blocked: the intro may play again next visit */
      }
      root.classList.add("intro-leaving");
      window.setTimeout(() => {
        root.classList.remove("intro-active", "intro-leaving");
        video.pause();
        video.querySelectorAll("source").forEach((s) => s.remove());
        video.load(); // stop any remaining download
        window.dispatchEvent(new Event("nuven:intro-done"));
      }, LEAVE_MS);
    };
    finishRef.current = finish;

    const tick = () => {
      if (video.duration && barRef.current) {
        barRef.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
      raf = requestAnimationFrame(tick);
    };

    // The markup uses preload="none" so visitors who skip the intro download nothing.
    video.preload = "auto";
    video.load();
    video
      .play()
      .then(() => {
        raf = requestAnimationFrame(tick);
      })
      .catch(finish);

    const onKey = (e: KeyboardEvent) => {
      if (["Escape", " ", "ArrowDown", "PageDown"].includes(e.key)) finish();
    };
    const onWheel = (e: WheelEvent) => e.deltaY > 0 && finish();
    video.addEventListener("ended", finish);
    video.addEventListener("error", finish);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", finish, { passive: true });
    const failsafe = window.setTimeout(finish, 30000);
    skipRef.current?.focus({ preventScroll: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", finish);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", finish);
    };
  }, []);

  return (
    <div id="intro" role="region" aria-label={label}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        aria-hidden
        className="size-full object-cover portrait:object-contain"
      >
        <source src="/intro/intro-720.mp4" type='video/mp4; codecs="avc1.64001F"' media="(max-width: 767px)" />
        <source src="/intro/intro-1080.mp4" type='video/mp4; codecs="avc1.640029"' />
        {/* for browsers without H.264 */}
        <source src="/intro/intro-720.webm" type='video/webm; codecs="vp9"' />
      </video>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-fg/80" />
      </div>
      <button
        ref={skipRef}
        type="button"
        onClick={() => finishRef.current()}
        className="absolute right-5 bottom-6 inline-flex h-10 items-center rounded-full border border-line-strong bg-ink/60 px-5 text-[0.8125rem] font-medium tracking-[0.04em] text-fg backdrop-blur-md transition-colors duration-200 hover:border-fg/40 hover:bg-ink/80 sm:right-8 sm:bottom-8"
      >
        {skipLabel}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Background of the hero: the rest of the motion reel (from second 4), looping.
 * It continues where the entrance video stops: when the intro starts fading out
 * this one starts playing underneath. Without an intro it starts after page load,
 * so it never competes with the first paint. Paused while off screen, and not
 * played at all for people who prefer reduced motion.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let started = false;
    let visible = true;
    const play = () => {
      if (started && visible) video.play().catch(() => {});
    };
    const start = () => {
      if (started) return;
      started = true;
      play();
    };

    video.preload = "auto";
    video.load();
    const onPlaying = () => video.setAttribute("data-on", "");
    video.addEventListener("playing", onPlaying);

    const introActive = document.documentElement.classList.contains("intro-active");
    if (introActive) window.addEventListener("nuven:intro-leaving", start, { once: true });
    else if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else video.pause();
    });
    io.observe(video);

    return () => {
      io.disconnect();
      video.removeEventListener("playing", onPlaying);
      window.removeEventListener("nuven:intro-leaving", start);
      window.removeEventListener("load", start);
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className="absolute inset-0 size-full object-cover opacity-0 brightness-[0.72] transition-opacity duration-700 data-[on]:opacity-100"
    >
      <source src="/intro/hero-540.mp4" type='video/mp4; codecs="avc1.64001F"' />
      <source src="/intro/hero-540.webm" type='video/webm; codecs="vp9"' />
    </video>
  );
}

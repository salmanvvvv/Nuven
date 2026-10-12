"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { MotionHero } from "./MotionHero";

type Props = { label: string; pauseLabel: string; playLabel: string };

/** The motion loop in a thin frame, with a pause / play button. Loads lazily. */
export function ShowreelPlayer({ label, pauseLabel, playLabel }: Props) {
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink sm:rounded-3xl">
      <MotionHero lazy label={label} paused={paused} onPlayingChange={setPlaying} sizes="(min-width: 1240px) 1176px, 100vw" />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? playLabel : pauseLabel}
        aria-pressed={paused}
        className="absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-fg backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] hover:border-white/30 hover:bg-black/75 active:scale-[0.94] sm:right-5 sm:bottom-5"
        hidden={!playing && !paused}
      >
        {paused ? <Play aria-hidden className="size-4 translate-x-px" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </div>
  );
}

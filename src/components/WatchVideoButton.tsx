"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/Button";
import { watchHeroVideo } from "@/components/HeroVideo";

export function WatchVideoButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="ghost" onClick={watchHeroVideo} className="sm:px-4">
      <span className="grid size-7 place-items-center rounded-full border border-line-strong transition-colors duration-200 group-hover:border-fg/50">
        <Play aria-hidden className="ml-0.5 size-3 fill-current" />
      </span>
      {label}
    </Button>
  );
}

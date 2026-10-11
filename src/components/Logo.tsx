import { useId } from "react";
import { cn } from "@/lib/cn";
import { LEFT_BAR, MARK_VIEWBOX, RIBBON, RIGHT_BAR } from "./brand-paths";

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset="0.6" stopColor="#d6d6d6" />
          <stop offset="1" stopColor="#8e8e8e" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dedede" />
          <stop offset="0.55" stopColor="#a9a9a9" />
          <stop offset="1" stopColor="#5e5e5e" />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f1f1f1" />
          <stop offset="1" stopColor="#d9d9d9" />
        </linearGradient>
      </defs>
      <path d={LEFT_BAR} fill={`url(#${id}l)`} />
      <path d={RIGHT_BAR} fill={`url(#${id}r)`} />
      <path d={RIBBON} fill={`url(#${id}d)`} />
    </svg>
  );
}

export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[0.95rem] font-medium tracking-[var(--tracking-wordmark)] text-fg">
        NUVEN
      </span>{" "}
      {!compact && (
        <span className="mt-1.5 font-display text-[0.5rem] font-medium tracking-[0.62em] text-muted">
          DIGITAL
        </span>
      )}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-6 w-auto" />
      <Wordmark />
    </span>
  );
}

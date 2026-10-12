import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { HeroRibbon } from "@/components/HeroRibbon";
import { HeroVideo } from "@/components/HeroVideo";
import { WatchVideoButton } from "@/components/WatchVideoButton";
import type { HeroContent } from "@/content/types";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section aria-labelledby="hero-title" className="group/hero relative overflow-hidden pt-28 pb-20 sm:pt-36 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-24 lg:pb-16">
      <HeroVideo closeLabel={content.closeVideo} />
      {/* darken the video: strongest behind the copy, and fade into the page at the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-data-[watching]/hero:opacity-0 bg-ink/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgb(0_0_0/0.9)_0%,rgb(0_0_0/0.82)_45%,rgb(0_0_0/0.58)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-data-[watching]/hero:opacity-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.7)_0%,transparent_22%,transparent_70%,#000_100%)]"
      />
      {/* faint fold-shaped light across the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute transition-opacity duration-500 group-data-[watching]/hero:opacity-0 -top-1/3 left-1/2 h-[140%] w-[60rem] -translate-x-1/2 rotate-[42deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.035)_45%,rgb(255_255_255/0.06)_50%,transparent)]"
      />
      <Container className="relative grid items-center transition-opacity duration-500 group-data-[watching]/hero:opacity-0 group-data-[watching]/hero:pointer-events-none gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <div>
          <h1
            id="hero-title"
            className="max-w-[14ch] text-[clamp(2.6rem,8.4vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
          >
            {content.title}
          </h1>
          <p className="hero-rise mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-muted sm:text-lg" style={{ animationDelay: "120ms" }}>
            {content.subtitle}
          </p>
          <div className="hero-rise mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <ButtonLink href="/#contacto" arrow>
              {content.primaryCta}
            </ButtonLink>
            <ButtonLink href="/#proyectos" variant="secondary">
              {content.secondaryCta}
            </ButtonLink>
            <WatchVideoButton label={content.watchVideo} />
          </div>
          <ul
            className="hero-rise mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-[0.8125rem] text-subtle"
            style={{ animationDelay: "320ms" }}
          >
            {content.facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2.5">
                <span aria-hidden className="size-1 rounded-full bg-muted" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
          <HeroRibbon />
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { m, useScroll, useSpring } from "framer-motion";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ProcessContent } from "@/content/types";

export function Process({ content }: { content: ProcessContent }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <section id="proceso" aria-labelledby="proceso-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="proceso-title" title={content.title} intro={content.intro} />
        <ol ref={ref} className="relative grid gap-12 pl-9 lg:grid-cols-4 lg:gap-8 lg:pt-12 lg:pl-0">
          {/* track + progress: vertical on mobile, horizontal on desktop */}
          <div aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-line lg:top-[5px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto" />
          <m.div
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-fg lg:hidden"
          />
          <m.div
            aria-hidden
            style={{ scaleX: progress }}
            className="absolute top-[5px] right-0 left-0 hidden h-px origin-left bg-fg lg:block"
          />
          {content.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
              <span
                aria-hidden
                className="absolute top-1.5 -left-9 size-[11px] rounded-full border border-fg/60 bg-ink lg:-top-12 lg:left-0"
              />
              <p className="label">
                <span className="sr-only">Paso {i + 1}: </span>
                <span aria-hidden>{String(i + 1).padStart(2, "0")} · </span>
                {step.duration}
              </p>
              <h3 className="mt-4 text-[1.375rem] font-medium tracking-[-0.025em]">{step.title}</h3>
              <p className="mt-3 max-w-[40ch] text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

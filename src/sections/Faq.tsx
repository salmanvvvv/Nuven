"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import type { FaqContent } from "@/content/types";
import { cn } from "@/lib/cn";

export function Faq({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="faq-title" className="text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {content.title}
          </h2>
          <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-muted sm:text-lg">{content.intro}</p>
        </Reveal>
        <Reveal>
          <ul className="border-b border-line">
            {content.items.map((item, i) => {
              const isOpen = open === i;
              const btnId = `${base}-q${i}`;
              const panelId = `${base}-a${i}`;
              return (
                <li key={item.q} className="border-t border-line">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left font-display text-[1.0625rem] font-medium tracking-[-0.01em] sm:text-[1.1875rem]"
                    >
                      {item.q}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line transition-colors duration-200 group-hover:border-line-strong">
                        <Plus
                          aria-hidden
                          className={cn(
                            "size-4 transition-transform duration-300 ease-[var(--ease-out-soft)]",
                            isOpen && "rotate-45",
                          )}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    inert={!isOpen}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-400 ease-[var(--ease-out-soft)]",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[62ch] pr-12 pb-7 text-[0.9375rem] leading-relaxed text-muted">{item.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

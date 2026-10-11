import { Check } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { PlansContent } from "@/content/types";
import { cn } from "@/lib/cn";

export function Plans({ content }: { content: PlansContent }) {
  return (
    <section id="planes" aria-labelledby="planes-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="planes-title" title={content.title} intro={content.intro} />
        <ul className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {content.items.map((plan, i) => (
            <Reveal
              as="li"
              key={plan.name}
              delay={i * 0.08}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 sm:p-9",
                plan.recommended
                  ? "fold-surface border-line-strong shadow-[0_30px_80px_-30px_rgb(255_255_255/0.12)]"
                  : "border-line bg-surface/40",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-medium tracking-[-0.02em]">{plan.name}</h3>
                {plan.recommended && (
                  <span className="rounded-full bg-fg px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink uppercase">
                    {content.recommendedBadge}
                  </span>
                )}
              </div>
              <p className="mt-3 min-h-[3lh] text-[0.9375rem] leading-relaxed text-muted lg:min-h-[4.5lh] xl:min-h-[3lh]">
                {plan.description}
              </p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="text-[0.875rem] text-muted">{content.fromLabel}</span>
                <span className="font-display text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                  {plan.price}
                </span>
              </p>
              <p className="mt-2 text-[0.8125rem] text-subtle">{plan.priceSuffix}</p>
              <ul className="mt-8 flex-1 space-y-3.5 border-t border-line pt-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[0.9375rem] leading-snug">
                    <Check aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-fg" />
                    <span className="text-fg/90">{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/#contacto"
                variant={plan.recommended ? "primary" : "secondary"}
                arrow
                className="mt-10 w-full"
                aria-label={`${content.cta}: plan ${plan.name}`}
              >
                {content.cta}
              </ButtonLink>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-[0.8125rem] text-subtle">{content.note}</p>
      </Container>
    </section>
  );
}

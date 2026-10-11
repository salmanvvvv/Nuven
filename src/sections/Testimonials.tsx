import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import type { TestimonialsContent } from "@/content/types";

export function Testimonials({ content }: { content: TestimonialsContent }) {
  return (
    <section aria-labelledby="testimonios-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2
            id="testimonios-title"
            className="mb-14 max-w-[20ch] text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] sm:mb-20"
          >
            {content.title}
          </h2>
        </Reveal>
        <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {content.items.map((t, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className="flex flex-col bg-ink p-7 sm:p-9">
              {t.isExample && (
                <span className="mb-8 self-start rounded-full border border-line-strong px-3 py-1 text-[0.6875rem] font-medium tracking-[0.12em] text-muted uppercase">
                  {content.exampleBadge}
                </span>
              )}
              <figure className="flex flex-1 flex-col">
                <blockquote className="flex-1 font-display text-[1.125rem] leading-[1.55] tracking-[-0.01em] text-fg/90">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-3 border-t border-line pt-6">
                  <span aria-hidden className="grid size-10 place-items-center rounded-full bg-elevated font-display text-[0.8125rem] font-medium text-muted">
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-medium">{t.name}</span>
                    <span className="block text-[0.8125rem] text-subtle">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

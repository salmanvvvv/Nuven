import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import type { ValueContent } from "@/content/types";

export function Value({ content }: { content: ValueContent }) {
  return (
    <section aria-labelledby="valor-title" className="relative border-t border-line py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="valor-title" className="max-w-[16ch] text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {content.title}
          </h2>
          <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">{content.intro}</p>
        </Reveal>
        <ul className="grid sm:grid-cols-2">
          {content.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(i % 2) * 0.08}
              className="border-t border-line py-8 sm:px-0 sm:py-10 sm:even:pl-10 sm:odd:pr-10 sm:[&:nth-child(odd)]:border-r"
            >
              <Icon name={item.icon} className="size-6 text-fg" />
              <h3 className="mt-6 text-xl font-medium tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

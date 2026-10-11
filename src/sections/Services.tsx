import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ServicesContent } from "@/content/types";

export function Services({ content }: { content: ServicesContent }) {
  return (
    <section id="servicios" aria-labelledby="servicios-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="servicios-title" title={content.title} intro={content.intro} />
        <ul className="border-b border-line">
          {content.items.map((item) => (
            <Reveal as="li" key={item.title} className="group relative border-t border-line">
              {/* light sweep on hover, echoing the fold of the logo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgb(255_255_255/0.05),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative grid gap-4 py-9 sm:py-11 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-8 lg:grid-cols-[3rem_minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                <Icon
                  name={item.icon}
                  className="size-6 text-muted transition-colors duration-300 group-hover:text-fg md:mt-1.5"
                />
                <h3 className="text-[1.5rem] leading-tight font-medium tracking-[-0.025em] sm:text-[1.75rem]">
                  {item.title}
                </h3>
                <p className="max-w-[48ch] text-[0.9375rem] leading-relaxed text-muted md:col-start-3 lg:col-start-auto">
                  {item.text}
                </p>
                <ul className="flex flex-wrap gap-2 md:col-start-3 lg:col-start-auto lg:flex-col lg:items-start lg:gap-2.5">
                  {item.includes.map((inc) => (
                    <li
                      key={inc}
                      className="rounded-full border border-line px-3 py-1 text-[0.8125rem] text-muted lg:border-0 lg:p-0"
                    >
                      <span aria-hidden className="mr-2 hidden text-subtle lg:inline">—</span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

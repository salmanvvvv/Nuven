import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ProjectsContent } from "@/content/types";

const domainOf = (href: string) => new URL(href).hostname.replace(/^www\./, "");

/** Branded stand-in shown until a screenshot is added for the project. */
function SitePreview({ title, domain }: { title: string; domain: string }) {
  return (
    <div className="fold-surface absolute inset-0 flex flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/15" />
          ))}
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-full bg-white/[0.06] px-3 py-1 text-[0.75rem] text-muted">
          {domain}
        </span>
        <span aria-hidden className="w-[2.6rem]" />
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        {/* diagonal light, like the fold of the N */}
        <div
          aria-hidden
          className="absolute -inset-x-1/4 -inset-y-full rotate-[42deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.05)_48%,transparent)] transition-transform duration-1000 ease-[var(--ease-out-soft)] group-hover:translate-x-[12%]"
        />
        <span className="relative text-center font-display text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-fg">
          {title}
        </span>
      </div>
    </div>
  );
}

export function Projects({ content }: { content: ProjectsContent }) {
  return (
    <section id="proyectos" aria-labelledby="proyectos-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="proyectos-title" title={content.title} intro={content.intro} />
        {/* One row: a swipeable strip on phones, three columns from 640px. */}
        <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:scroll-px-0 sm:overflow-visible sm:px-0 sm:pb-0">
          {content.items.map((project, i) => {
            const domain = domainOf(project.href);
            return (
              <Reveal as="li" key={project.href} delay={i * 0.08} className="group w-[78%] shrink-0 snap-start sm:w-auto">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${content.visitLabel}: ${project.title} (${content.newTabLabel})`}
                  className="block rounded-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,transform] duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 group-hover:border-line-strong">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.alt ?? ""}
                        fill
                        sizes="(min-width: 1240px) 390px, (min-width: 640px) 33vw, 80vw"
                        className="object-cover object-top transition-[transform,filter] duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] group-hover:brightness-110"
                      />
                    ) : (
                      <SitePreview title={project.title} domain={domain} />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[1.0625rem] font-medium tracking-[-0.015em]">{project.title}</h3>
                      <p className="mt-1 text-[0.8125rem] text-muted">{project.category ?? domain}</p>
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-muted transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
                    />
                  </div>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

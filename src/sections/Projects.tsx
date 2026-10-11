import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ProjectsContent } from "@/content/types";
import { cn } from "@/lib/cn";

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
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
          {content.items.map((project, i) => {
            const domain = domainOf(project.href);
            return (
              <Reveal
                as="li"
                key={project.href}
                delay={i * 0.08}
                className={cn("group", i === 0 && "md:col-span-2")}
              >
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${content.visitLabel}: ${project.title} (${content.newTabLabel})`}
                  className="block rounded-2xl"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,transform] duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 group-hover:border-line-strong",
                      i === 0 ? "aspect-[16/10] md:aspect-[2/1]" : "aspect-[16/10]",
                    )}
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.alt ?? ""}
                        fill
                        sizes={i === 0 ? "(min-width: 1240px) 1200px, 100vw" : "(min-width: 1240px) 600px, (min-width: 768px) 50vw, 100vw"}
                        className="object-cover object-top transition-[transform,filter] duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] group-hover:brightness-110"
                      />
                    ) : (
                      <SitePreview title={project.title} domain={domain} />
                    )}
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className={cn("font-medium tracking-[-0.02em]", i === 0 ? "text-2xl" : "text-xl")}>{project.title}</h3>
                      <p className="mt-1.5 text-[0.875rem] text-muted">{project.category ?? domain}</p>
                    </div>
                    <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] text-muted transition-colors duration-300 group-hover:text-fg">
                      {content.visitLabel}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
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

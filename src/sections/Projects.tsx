import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import type { ProjectsContent } from "@/content/types";
import { cn } from "@/lib/cn";

export function Projects({ content }: { content: ProjectsContent }) {
  return (
    <section id="proyectos" aria-labelledby="proyectos-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="proyectos-title" title={content.title} intro={content.intro} />
        <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2">
          {content.items.map((project, i) => {
            const card = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    sizes="(min-width: 1240px) 600px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-[transform,filter] duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                  {project.isExample && (
                    <span className="absolute top-4 left-4 rounded-full border border-line-strong bg-ink/70 px-3 py-1 text-[0.6875rem] font-medium tracking-[0.12em] text-fg uppercase backdrop-blur-md">
                      {content.exampleBadge}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.02em]">{project.title}</h3>
                    <p className="mt-1.5 text-[0.875rem] text-muted">
                      {project.category} <span aria-hidden>·</span> {project.year}
                    </p>
                  </div>
                  {project.href && (
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-5 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
                    />
                  )}
                </div>
              </>
            );
            return (
              <Reveal as="li" key={`${project.title}-${i}`} delay={(i % 2) * 0.1} className={cn("group", i % 2 === 1 && "md:mt-20")}>
                {project.href ? (
                  <a href={project.href} target="_blank" rel="noopener noreferrer" className="block rounded-2xl">
                    {card}
                  </a>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

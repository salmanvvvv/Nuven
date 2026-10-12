import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { ShowreelPlayer } from "@/components/ShowreelPlayer";
import type { ShowreelContent } from "@/content/types";

export function Showreel({ content }: { content: ShowreelContent }) {
  if (!content.enabled) return null;
  return (
    <section id="showreel" aria-labelledby="showreel-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="label mb-5">{content.eyebrow}</p>
            <h2
              id="showreel-title"
              className="max-w-[18ch] text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]"
            >
              {content.title}
            </h2>
          </div>
          <p className="max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">{content.intro}</p>
        </Reveal>
        <Reveal>
          <ShowreelPlayer label={content.videoLabel} pauseLabel={content.pauseLabel} playLabel={content.playLabel} />
        </Reveal>
      </Container>
    </section>
  );
}

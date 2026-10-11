import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import type { LegalPage } from "@/content/types";

export function LegalPageView({ page, backLabel }: { page: LegalPage; backLabel: string }) {
  return (
    <article className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container className="max-w-[820px]">
        <Link href="/" className="inline-flex items-center gap-2 text-[0.875rem] text-muted transition-colors hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" />
          {backLabel}
        </Link>
        <h1 className="mt-10 text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
          {page.title}
        </h1>
        <p className="mt-4 text-[0.875rem] text-subtle">Última actualización: {page.updated}</p>
        <div className="mt-14 space-y-12">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-medium tracking-[-0.02em]">{s.heading}</h2>
              <div className="mt-4 space-y-4 text-[0.9375rem] leading-[1.75] text-muted">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}

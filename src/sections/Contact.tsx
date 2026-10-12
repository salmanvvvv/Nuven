import { Mail, Phone } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { ContactContent, SiteContent } from "@/content/types";
import { telHref, whatsappHref } from "@/lib/contact-links";

export function Contact({ content, site }: { content: ContactContent; site: SiteContent }) {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative overflow-hidden border-t border-line py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[70rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)]"
      />
      <Container className="relative grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <Reveal>
          <h2
            id="contacto-title"
            className="max-w-[12ch] text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em]"
          >
            {content.title}
          </h2>
          <p className="mt-7 max-w-[44ch] text-base leading-relaxed text-muted sm:text-lg">{content.intro}</p>

          <h3 className="label mt-14">{content.nextStepsTitle}</h3>
          <ol className="mt-6 space-y-4">
            {content.nextSteps.map((step, i) => (
              <li key={step} className="flex gap-4 text-[0.9375rem] leading-relaxed">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong font-display text-[0.6875rem] text-muted tabular-nums">
                  {i + 1}
                </span>
                <span className="text-fg/90">{step}</span>
              </li>
            ))}
          </ol>

          <h3 className="label mt-14">{content.directLabel}</h3>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {site.whatsapp && (
              <ButtonLink
                href={whatsappHref(site.whatsapp, site.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${site.whatsappLabel}: ${site.whatsapp}`}
              >
                <WhatsAppIcon className="size-[1.125rem]" />
                {site.whatsappLabel}
              </ButtonLink>
            )}
            {site.phone && (
              <ButtonLink href={telHref(site.phone)} variant="secondary" aria-label={`${site.callLabel}: ${site.phone}`}>
                <Phone aria-hidden strokeWidth={1.5} className="size-4" />
                {site.callLabel} · {site.phone}
              </ButtonLink>
            )}
          </div>
          <a
            href={`mailto:${site.email}`}
            className="link-underline mt-6 inline-flex items-center gap-2.5 font-display text-base break-all sm:text-lg"
          >
            <Mail aria-hidden strokeWidth={1.5} className="size-5 shrink-0 text-muted" />
            {site.email}
          </a>
        </Reveal>

        <Reveal delay={0.1} className="fold-surface rounded-3xl border border-line p-6 sm:p-10">
          <ContactForm content={content.form} />
        </Reveal>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Container } from "@/components/Container";
import { LogoMark } from "@/components/Logo";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { SocialIcon } from "@/components/SocialIcon";
import { telHref, whatsappHref } from "@/lib/contact-links";
import type { FooterContent, SiteContent } from "@/content/types";

export function Footer({ site, content }: { site: SiteContent; content: FooterContent }) {
  const year = new Date().getFullYear();
  const linkCls = "text-[0.9375rem] text-muted transition-colors duration-200 hover:text-fg";

  return (
    <footer className="border-t border-line pt-20 pb-10">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link href="/" aria-label={site.homeLabel} className="-m-2 inline-flex flex-col items-start gap-5 rounded-md p-2">
              <LogoMark className="h-10 w-auto" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.25rem] font-medium tracking-[var(--tracking-wordmark)]">NUVEN</span>{" "}
                <span className="mt-2 font-display text-[0.625rem] font-medium tracking-[0.62em] text-muted">DIGITAL</span>
              </span>
            </Link>
            <p className="mt-6 max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted">{content.blurb}</p>
          </div>

          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className="label">{content.navTitle}</h2>
            <ul className="mt-5 space-y-3">
              {site.nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label">{content.contactTitle}</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${site.email}`} className={linkCls}>
                  {site.email}
                </a>
              </li>
              {site.whatsapp && (
                <li>
                  <a
                    href={whatsappHref(site.whatsapp, site.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                  >
                    WhatsApp · {site.whatsapp}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a href={telHref(site.phone)} className={linkCls}>
                    {site.callLabel} · {site.phone}
                  </a>
                </li>
              )}
              <li className="text-[0.9375rem] text-muted">{site.city}</li>
            </ul>
            <h2 className="label mt-10">{content.socialTitle}</h2>
            <ul className="mt-4 flex gap-2">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg"
                  >
                    <SocialIcon name={s.icon} className="size-[1.125rem]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="label">{content.legalTitle}</h2>
            <ul className="mt-5 space-y-3">
              {content.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className={linkCls}>{content.cookieSettings}</CookieSettingsButton>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-4 border-t border-line pt-8 text-[0.8125rem] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. {content.rights}
          </p>
          <a href="#top" className="inline-flex items-center gap-1.5 transition-colors hover:text-fg">
            {content.backToTop}
            <ArrowUp aria-hidden className="size-3.5" />
          </a>
        </div>
      </Container>
    </footer>
  );
}

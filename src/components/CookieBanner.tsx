"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Button } from "@/components/Button";
import type { CookieContent } from "@/content/types";

const STORAGE_KEY = "nuven-consent";
const OPEN_EVENT = "nuven:open-cookie-settings";

export type Consent = { analytics: boolean; date: string };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

/**
 * GDPR banner. Accept and reject carry the same weight, nothing optional loads
 * before a choice, and the choice can be changed from the footer at any time.
 * When you add analytics, load it only if `readConsent()?.analytics` is true
 * (and listen for the "nuven:consent" event to react to changes).
 */
export function CookieBanner({ content }: { content: CookieContent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!readConsent()) setVisible(true);
    }, 600);
    const open = () => setVisible(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, []);

  function choose(analytics: boolean) {
    const consent: Consent = { analytics, date: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* storage unavailable: the banner simply shows again next visit */
    }
    window.dispatchEvent(new CustomEvent("nuven:consent", { detail: consent }));
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-text"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-line-strong bg-raised/95 p-5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm sm:p-6"
        >
          <h2 id="cookie-title" className="font-display text-[0.9375rem] font-medium">
            {content.title}
          </h2>
          <p id="cookie-text" className="mt-2 text-[0.875rem] leading-relaxed text-muted">
            {content.text}{" "}
            <Link href="/cookies" className="link-underline text-fg">
              {content.moreInfo}
            </Link>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => choose(false)}>
              {content.reject}
            </Button>
            <Button size="sm" onClick={() => choose(true)}>
              {content.accept}
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {children}
    </button>
  );
}

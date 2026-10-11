"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/Button";
import type { ContactContent } from "@/content/types";
import { HONEYPOT_FIELD, validateContact, type ContactErrors, type ContactField } from "@/lib/contact-schema";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

const fieldBase =
  "w-full rounded-xl border bg-ink/60 px-4 text-[0.9375rem] text-fg placeholder:text-subtle " +
  "transition-[border-color,background-color] duration-200 outline-none " +
  "hover:border-line-strong focus:border-fg/60 focus:bg-ink focus-visible:outline-none";

export function ContactForm({ content }: { content: ContactContent["form"] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [serverError, setServerError] = useState("");
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function readForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      projectType: String(fd.get("projectType") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      message: String(fd.get("message") ?? ""),
      privacy: fd.get("privacy") === "on",
      [HONEYPOT_FIELD]: String(fd.get(HONEYPOT_FIELD) ?? ""),
    };
  }

  // Re-validate a single field once the user has seen an error for it.
  function revalidate(field: ContactField) {
    if (!errors[field] || !formRef.current) return;
    const { errors: next } = validateContact(readForm(formRef.current), content);
    setErrors((prev) => ({ ...prev, [field]: next?.[field] }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = readForm(form);
    const { errors: found } = validateContact(values, content);
    if (found) {
      setErrors(found);
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setServerError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, elapsed: Date.now() - startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { errors?: ContactErrors };
      if (res.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }
      setServerError(res.status === 429 ? content.errorRateLimit : content.errorGeneric);
      setStatus("error");
    } catch {
      setServerError(content.errorGeneric);
      setStatus("error");
    }
  }

  const describedBy = (f: ContactField) => (errors[f] ? `${f}-error` : undefined);
  const errorText = (f: ContactField) =>
    errors[f] ? (
      <p id={`${f}-error`} className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-danger">
        <CircleAlert aria-hidden className="size-3.5 shrink-0" />
        {errors[f]}
      </p>
    ) : null;
  const ring = (f: ContactField) => (errors[f] ? "border-danger/70" : "border-line");

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <m.div
            key="success"
            ref={(el: HTMLDivElement | null) => el?.focus()}
            tabIndex={-1}
            role="status"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[28rem] flex-col items-start justify-center outline-none"
          >
            <CircleCheck aria-hidden strokeWidth={1.25} className="size-10 text-fg" />
            <h3 className="mt-6 text-[1.75rem] font-semibold tracking-[-0.03em]">{content.successTitle}</h3>
            <p className="mt-3 max-w-[40ch] text-muted">{content.successText}</p>
            <Button variant="secondary" size="sm" className="mt-8" onClick={() => setStatus("idle")}>
              {content.sendAnother}
            </Button>
          </m.div>
        ) : (
          <m.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 sm:grid-cols-2"
            aria-describedby={serverError ? "form-error" : undefined}
          >
            <div>
              <label htmlFor="name" className="mb-2 block text-[0.875rem] font-medium">
                {content.name}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                placeholder={content.namePlaceholder}
                aria-invalid={!!errors.name}
                aria-describedby={describedBy("name")}
                onChange={() => revalidate("name")}
                className={cn(fieldBase, "h-12", ring("name"))}
              />
              {errorText("name")}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-[0.875rem] font-medium">
                {content.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={200}
                placeholder={content.emailPlaceholder}
                aria-invalid={!!errors.email}
                aria-describedby={describedBy("email")}
                onChange={() => revalidate("email")}
                className={cn(fieldBase, "h-12", ring("email"))}
              />
              {errorText("email")}
            </div>

            {(
              [
                ["projectType", content.projectType, content.projectTypes],
                ["budget", content.budget, content.budgets],
              ] as const
            ).map(([name, label, options]) => (
              <div key={name}>
                <label htmlFor={name} className="mb-2 block text-[0.875rem] font-medium">
                  {label}
                </label>
                <div className="relative">
                  <select
                    id={name}
                    name={name}
                    required
                    defaultValue=""
                    aria-invalid={!!errors[name]}
                    aria-describedby={describedBy(name)}
                    onChange={() => revalidate(name)}
                    className={cn(fieldBase, "h-12 cursor-pointer appearance-none pr-11", ring(name))}
                  >
                    <option value="" disabled>
                      {content.selectPlaceholder}
                    </option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted" />
                </div>
                {errorText(name)}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="message" className="mb-2 block text-[0.875rem] font-medium">
                {content.message}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                maxLength={5000}
                placeholder={content.messagePlaceholder}
                aria-invalid={!!errors.message}
                aria-describedby={describedBy("message")}
                onChange={() => revalidate("message")}
                className={cn(fieldBase, "min-h-36 resize-y py-3.5 leading-relaxed", ring("message"))}
              />
              {errorText("message")}
            </div>

            {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={HONEYPOT_FIELD}>{content.honeypotLabel}</label>
              <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  required
                  aria-invalid={!!errors.privacy}
                  aria-describedby={describedBy("privacy")}
                  onChange={() => revalidate("privacy")}
                  className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-ink bg-center bg-no-repeat transition-colors checked:border-fg checked:bg-fg checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%20fill=%22none%22%20stroke=%22%23000%22%20stroke-width=%222.2%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22/%3E%3C/svg%3E')] hover:border-fg/50"
                />
                <label htmlFor="privacy" className="text-[0.875rem] leading-relaxed text-muted">
                  {content.privacyPrefix}
                  <Link href="/privacidad" className="link-underline text-fg">
                    {content.privacyLink}
                  </Link>
                  {content.privacySuffix}
                </label>
              </div>
              {errorText("privacy")}
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
              <Button type="submit" arrow={status !== "submitting"} disabled={status === "submitting"} className="w-full sm:w-auto">
                {status === "submitting" && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
                {status === "submitting" ? content.submitting : content.submit}
              </Button>
              <p id="form-error" role="alert" className="text-[0.875rem] text-danger empty:hidden">
                {status === "error" ? serverError : ""}
              </p>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}

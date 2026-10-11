import type { ContactContent } from "@/content/types";

/*
 * Validation shared by the client form and the API route, so both behave the same.
 * Hand-written on purpose: a schema library would add ~50 KB of JavaScript to the page.
 */

export type ContactInput = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  privacy: true;
};
export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateContact(
  input: unknown,
  form: ContactContent["form"],
): { data: ContactInput; errors: null } | { data: null; errors: ContactErrors } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const name = str(raw.name);
  const email = str(raw.email);
  const projectType = str(raw.projectType);
  const budget = str(raw.budget);
  const message = str(raw.message);

  const errors: ContactErrors = {};
  if (name.length < 2 || name.length > 100) errors.name = form.errors.name;
  if (!EMAIL_RE.test(email) || email.length > 200) errors.email = form.errors.email;
  if (!form.projectTypes.includes(projectType)) errors.projectType = form.errors.projectType;
  if (!form.budgets.includes(budget)) errors.budget = form.errors.budget;
  if (message.length < 20 || message.length > 5000) errors.message = form.errors.message;
  if (raw.privacy !== true) errors.privacy = form.errors.privacy;

  if (Object.keys(errors).length > 0) return { data: null, errors };
  return { data: { name, email, projectType, budget, message, privacy: true }, errors: null };
}

/** Honeypot input name. Real users never see or fill it. */
export const HONEYPOT_FIELD = "company_website";
/** Submissions faster than this after the form renders are treated as bots. */
export const MIN_FILL_MS = 2500;

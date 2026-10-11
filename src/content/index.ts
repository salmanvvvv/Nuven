import type { Dictionary, Locale } from "./types";
import { es } from "./es";

/**
 * All copy lives in /src/content/<locale>. To add English later, create
 * /src/content/en with the same `Dictionary` shape and register it here.
 */
const dictionaries: Record<Locale, Dictionary> = { es };

export const defaultLocale: Locale = "es";

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary, Locale } from "./types";

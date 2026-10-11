/**
 * Shape of every piece of copy on the site. Each locale (es today, en later)
 * provides an object of type `Dictionary`, so components never hold text.
 */

export type Locale = "es";

export type Link = { label: string; href: string };

export type IconName =
  | "pen"
  | "bag"
  | "layout"
  | "refresh"
  | "wrench"
  | "search"
  | "gauge"
  | "headphones";

export type SiteContent = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  nav: Link[];
  primaryCta: string;
  secondaryCta: string;
  social: { label: string; href: string; icon: "instagram" | "linkedin" | "x" | "dribbble" }[];
  skipToContent: string;
  menuOpen: string;
  menuClose: string;
  homeLabel: string;
};

export type HeroContent = {
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  facts: string[];
};

export type ValueContent = {
  title: string;
  intro: string;
  items: { title: string; text: string; icon: IconName }[];
};

export type ServicesContent = {
  title: string;
  intro: string;
  items: { title: string; text: string; includes: string[]; icon: IconName }[];
};

export type ProcessContent = {
  title: string;
  intro: string;
  steps: { title: string; duration: string; text: string }[];
};

export type ProjectsContent = {
  title: string;
  intro: string;
  visitLabel: string;
  newTabLabel: string;
  items: {
    title: string;
    /** Shown under the title, e.g. "Web corporativa · 2026". Optional. */
    category?: string;
    href: string;
    /** Screenshot in /public/projects (1600 x 1000 px). Without it, a branded card is shown. */
    image?: string;
    alt?: string;
  }[];
};

export type PlansContent = {
  title: string;
  intro: string;
  recommendedBadge: string;
  note: string;
  cta: string;
  items: {
    name: string;
    price: string;
    priceSuffix: string;
    description: string;
    features: string[];
    recommended?: boolean;
  }[];
};

export type TestimonialsContent = {
  title: string;
  exampleBadge: string;
  /** Shown instead of a name for anonymous testimonials. */
  anonymousLabel: string;
  /** `name` is optional: leave it out to publish the testimonial anonymously. */
  items: { quote: string; name?: string; role: string; isExample: boolean }[];
};

export type FaqContent = {
  title: string;
  intro: string;
  items: { q: string; a: string }[];
};

export type ContactContent = {
  title: string;
  intro: string;
  nextStepsTitle: string;
  nextSteps: string[];
  directLabel: string;
  form: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    projectType: string;
    projectTypes: string[];
    budget: string;
    budgets: string[];
    selectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    privacyPrefix: string;
    privacyLink: string;
    privacySuffix: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successText: string;
    sendAnother: string;
    errorGeneric: string;
    errorRateLimit: string;
    honeypotLabel: string;
    errors: {
      name: string;
      email: string;
      projectType: string;
      budget: string;
      message: string;
      privacy: string;
    };
  };
};

export type FooterContent = {
  blurb: string;
  navTitle: string;
  legalTitle: string;
  contactTitle: string;
  socialTitle: string;
  legal: Link[];
  cookieSettings: string;
  rights: string;
  backToTop: string;
};

export type CookieContent = {
  title: string;
  text: string;
  accept: string;
  reject: string;
  moreInfo: string;
};

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalPage = {
  slug: "aviso-legal" | "privacidad" | "cookies";
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export type Dictionary = {
  site: SiteContent;
  hero: HeroContent;
  value: ValueContent;
  services: ServicesContent;
  process: ProcessContent;
  projects: ProjectsContent;
  plans: PlansContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  contact: ContactContent;
  footer: FooterContent;
  cookies: CookieContent;
  legal: Record<LegalPage["slug"], LegalPage>;
};

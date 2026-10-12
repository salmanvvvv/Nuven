import type { Metadata, Viewport } from "next";
import { Geist, Sora } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { Intro } from "@/components/Intro";
import { MotionProvider } from "@/components/MotionProvider";
import { getDictionary } from "@/content";
import { INTRO_BOOT } from "@/lib/intro";
import { siteUrl } from "@/lib/site-url";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const { site, footer, cookies } = getDictionary();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.name,
    url: "/",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: INTRO_BOOT adds a class to <html> before React hydrates.
    <html
      lang="es"
      id="top"
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${geist.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition-transform focus:translate-y-0"
        >
          {site.skipToContent}
        </a>
        <MotionProvider>
          <Intro label={site.introLabel} skipLabel={site.introSkip} />
          <Header site={site} />
          <main id="contenido" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer site={site} content={footer} />
          <CookieBanner content={cookies} />
        </MotionProvider>
      </body>
    </html>
  );
}

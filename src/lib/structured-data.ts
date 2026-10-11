import { getDictionary } from "@/content";
import { siteUrl } from "./site-url";

export function organizationJsonLd() {
  const { site, services, faq } = getDictionary();
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: site.name,
      description: site.description,
      url: siteUrl,
      logo: `${siteUrl}/brand/logo-original.jpg`,
      image: `${siteUrl}/opengraph-image`,
      email: site.email,
      telephone: site.phone || undefined,
      address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.country },
      areaServed: ["ES", "Latinoamérica"],
      sameAs: site.social.map((s) => s.href),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios",
        itemListElement: services.items.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.text },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

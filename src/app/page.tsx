import { getDictionary } from "@/content";
import { organizationJsonLd } from "@/lib/structured-data";
import { Contact } from "@/sections/Contact";
import { Faq } from "@/sections/Faq";
import { Hero } from "@/sections/Hero";
import { Plans } from "@/sections/Plans";
import { Process } from "@/sections/Process";
import { Projects } from "@/sections/Projects";
import { Services } from "@/sections/Services";
import { Testimonials } from "@/sections/Testimonials";
import { Value } from "@/sections/Value";

export default function HomePage() {
  const t = getDictionary();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
      />
      <Hero content={t.hero} />
      <Value content={t.value} />
      <Projects content={t.projects} />
      <Services content={t.services} />
      <Process content={t.process} />
      <Plans content={t.plans} />
      <Testimonials content={t.testimonials} />
      <Faq content={t.faq} />
      <Contact content={t.contact} site={t.site} />
    </>
  );
}

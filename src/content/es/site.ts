import type { CookieContent, FooterContent, SiteContent } from "../types";

// Datos generales de la marca. Busca "[PLACEHOLDER]" para ver lo que tienes que sustituir.
export const site: SiteContent = {
  name: "Nuven Digital",
  legalName: "Nuven Digital", // [PLACEHOLDER] Razón social o nombre del titular
  tagline: "Diseño y desarrollo web para negocios que quieren crecer",
  description:
    "Agencia de diseño y desarrollo web. Creamos webs a medida, rápidas y pensadas para convertir visitas en clientes para negocios, autónomos y startups.",
  email: "hola@nuvendigital.com", // [PLACEHOLDER] Email de contacto real
  phone: "+34 600 000 000", // [PLACEHOLDER] Teléfono (o déjalo vacío para ocultarlo)
  city: "Madrid", // [PLACEHOLDER] Ciudad
  country: "ES",
  nav: [
    { label: "Servicios", href: "/#servicios" },
    { label: "Proceso", href: "/#proceso" },
    { label: "Proyectos", href: "/#proyectos" },
    { label: "Planes", href: "/#planes" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contacto", href: "/#contacto" },
  ],
  primaryCta: "Solicitar presupuesto",
  secondaryCta: "Ver proyectos",
  // [PLACEHOLDER] Sustituye las URL por tus perfiles reales (o elimina los que no uses)
  social: [
    { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "X", href: "https://x.com/", icon: "x" },
    { label: "Dribbble", href: "https://dribbble.com/", icon: "dribbble" },
  ],
  skipToContent: "Saltar al contenido",
  menuOpen: "Abrir menú",
  menuClose: "Cerrar menú",
  homeLabel: "Nuven Digital, inicio",
};

export const footer: FooterContent = {
  blurb:
    "Diseñamos y desarrollamos webs a medida para negocios que quieren verse bien y vender más.",
  navTitle: "Navegación",
  legalTitle: "Legal",
  contactTitle: "Contacto",
  socialTitle: "Redes",
  legal: [
    { label: "Aviso legal", href: "/aviso-legal" },
    { label: "Política de privacidad", href: "/privacidad" },
    { label: "Política de cookies", href: "/cookies" },
  ],
  cookieSettings: "Configurar cookies",
  rights: "Todos los derechos reservados.",
  backToTop: "Volver arriba",
};

export const cookies: CookieContent = {
  title: "Tu privacidad",
  text: "Usamos cookies técnicas necesarias para que la web funcione. Solo usaremos cookies de análisis si nos das tu permiso.",
  accept: "Aceptar",
  reject: "Rechazar",
  moreInfo: "Leer la política de cookies",
};

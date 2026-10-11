import type {
  ContactContent,
  FaqContent,
  HeroContent,
  PlansContent,
  ProcessContent,
  ProjectsContent,
  ServicesContent,
  TestimonialsContent,
  ValueContent,
} from "../types";

export const hero: HeroContent = {
  title: "Webs que convierten visitas en clientes.",
  subtitle:
    "Diseñamos y desarrollamos la web de tu negocio a medida: rápida, clara y pensada para que quien llegue acabe escribiéndote.",
  primaryCta: "Solicitar presupuesto",
  secondaryCta: "Ver proyectos",
  facts: ["Diseño 100 % a medida", "Entrega en 2 a 6 semanas", "Trato directo, sin intermediarios"],
};

export const value: ValueContent = {
  title: "Tu web es tu mejor comercial. La construimos como tal.",
  intro:
    "Una web bonita no basta si no se encuentra, tarda en cargar o no deja claro qué ofreces. Cuidamos las cuatro cosas que marcan la diferencia.",
  items: [
    {
      icon: "pen",
      title: "Diseño a medida",
      text: "Nada de plantillas genéricas. Partimos de tu negocio, tu público y tu forma de vender para diseñar una web que solo podría ser tuya.",
    },
    {
      icon: "gauge",
      title: "Velocidad real",
      text: "Webs ligeras que cargan en menos de dos segundos en el móvil. Menos esperas significa menos visitas perdidas.",
    },
    {
      icon: "search",
      title: "SEO desde el primer día",
      text: "Estructura, metadatos, velocidad y contenido preparados para que Google entienda tu web desde el lanzamiento.",
    },
    {
      icon: "headphones",
      title: "Soporte cercano",
      text: "Hablas siempre con las personas que hacen tu web. Respondemos rápido y en tu idioma, también después del lanzamiento.",
    },
  ],
};

export const services: ServicesContent = {
  title: "Todo lo que tu web necesita, en un solo equipo.",
  intro:
    "Desde la primera idea hasta el mantenimiento. Elige un servicio concreto o combínalos según la fase en la que esté tu negocio.",
  items: [
    {
      icon: "pen",
      title: "Diseño web a medida",
      text: "Una web corporativa diseñada desde cero alrededor de tu marca y de lo que quieres conseguir con ella.",
      includes: ["Estrategia y estructura", "Diseño responsive", "Textos orientados a venta"],
    },
    {
      icon: "bag",
      title: "Tiendas online",
      text: "E-commerce fáciles de gestionar, con pagos seguros y un proceso de compra sin fricciones.",
      includes: ["Catálogo y pasarela de pago", "Gestión de pedidos", "Emails transaccionales"],
    },
    {
      icon: "layout",
      title: "Landing pages",
      text: "Páginas enfocadas en una sola acción para campañas, lanzamientos o captación de clientes.",
      includes: ["Copy persuasivo", "Formularios integrados", "Medición de conversiones"],
    },
    {
      icon: "refresh",
      title: "Rediseño de webs",
      text: "Modernizamos tu web actual sin perder lo que ya funciona: contenido, posicionamiento y clientes.",
      includes: ["Auditoría inicial", "Migración de contenidos", "Redirecciones SEO"],
    },
    {
      icon: "wrench",
      title: "Mantenimiento",
      text: "Actualizaciones, copias de seguridad, seguridad y pequeños cambios para que no tengas que preocuparte de nada.",
      includes: ["Copias de seguridad", "Actualizaciones y seguridad", "Cambios mensuales incluidos"],
    },
    {
      icon: "search",
      title: "SEO técnico básico",
      text: "Dejamos tu web lista para posicionar: rendimiento, indexación, datos estructurados y buenas prácticas.",
      includes: ["Auditoría técnica", "Optimización de velocidad", "Alta en Google Search Console"],
    },
  ],
};

export const process: ProcessContent = {
  title: "Un proceso claro, de la primera llamada al lanzamiento.",
  intro: "Sabrás en todo momento en qué punto está tu web y qué viene después.",
  steps: [
    {
      title: "Descubrimiento",
      duration: "Semana 1",
      text: "Una llamada para entender tu negocio, tus clientes y tus objetivos. Con eso definimos la estructura y una propuesta cerrada.",
    },
    {
      title: "Diseño",
      duration: "Semanas 1 a 3",
      text: "Diseñamos las páginas clave y las revisamos contigo. Ajustamos hasta que la web transmita exactamente lo que buscas.",
    },
    {
      title: "Desarrollo",
      duration: "Semanas 2 a 5",
      text: "Convertimos el diseño en una web rápida, accesible y optimizada para buscadores, que podrás revisar en un enlace privado.",
    },
    {
      title: "Lanzamiento y soporte",
      duration: "A partir de la semana 4",
      text: "Publicamos la web, configuramos dominio y analítica, y te enseñamos a gestionarla. Seguimos a tu lado después.",
    },
  ],
};

// Webs de referencia. Para mostrar una captura, añade la imagen en /public/projects
// (1600 x 1000 px, .webp) y rellena `image` y `alt`. Puedes añadir `category`, p. ej. "Web corporativa · 2026".
export const projects: ProjectsContent = {
  title: "Webs que ya hemos lanzado.",
  intro: "Algunos de los proyectos que hemos diseñado y desarrollado. Entra y pruébalos tú mismo.",
  visitLabel: "Visitar web",
  newTabLabel: "se abre en una pestaña nueva",
  items: [
    {
      title: "Brico Home Services",
      category: "Reformas y reparaciones · Roses, Girona",
      href: "https://bricohomeservices.com/",
      image: "/projects/brico-home-services.webp",
      alt: "Portada de la web de Brico Home Services, empresa de reformas en Roses y la provincia de Girona",
    },
    {
      title: "Work Armor",
      category: "Tienda online · Calzado de trabajo",
      href: "https://workarmor.es/",
      image: "/projects/workarmor.webp",
      alt: "Portada de la tienda online de Work Armor con zapatillas de trabajo con puntera de acero",
    },
    {
      title: "MindMap",
      category: "Aplicación web",
      href: "https://self-mapping-lab.lovable.app/",
      image: "/projects/mindmap.webp",
      alt: "Portada de MindMap, una aplicación web de autoconocimiento",
    },
  ],
};

// Ajusta el contenido de cada plan. Todos los precios son personalizados.
export const plans: PlansContent = {
  title: "Planes a la medida de tu proyecto.",
  intro:
    "Cada negocio necesita algo distinto, así que cada presupuesto también. Elige el punto de partida que más se parece a lo tuyo y te preparamos un precio cerrado.",
  recommendedBadge: "Recomendado",
  note: "Todos los presupuestos son personalizados, cerrados y sin compromiso. Te lo enviamos después de una primera llamada para conocer tu proyecto.",
  cta: "Solicitar presupuesto",
  items: [
    {
      name: "Esencial",
      price: "Precio personalizado",
      priceSuffix: "Presupuesto cerrado y sin compromiso",
      description: "Para autónomos y negocios que necesitan una presencia profesional cuanto antes.",
      features: [
        "Web de hasta 5 secciones",
        "Diseño responsive a medida",
        "Formulario de contacto",
        "SEO básico y Google Business",
        "Entrega en unas 2 semanas",
      ],
    },
    {
      name: "Profesional",
      price: "Precio personalizado",
      priceSuffix: "Presupuesto cerrado y sin compromiso",
      description: "Para negocios que quieren captar clientes de forma constante desde su web.",
      features: [
        "Web de hasta 10 páginas",
        "Textos orientados a conversión",
        "Blog o sección de novedades",
        "SEO técnico y analítica",
        "Panel para editar contenidos",
        "1 mes de soporte incluido",
      ],
      recommended: true,
    },
    {
      name: "Premium",
      price: "Precio personalizado",
      priceSuffix: "Presupuesto cerrado y sin compromiso",
      description: "Para tiendas online y proyectos con necesidades a medida.",
      features: [
        "Tienda online o funcionalidades a medida",
        "Diseño de identidad visual web",
        "Integraciones (pagos, reservas, CRM)",
        "Animaciones y microinteracciones",
        "Formación y 3 meses de soporte",
      ],
    },
  ],
};

// [PLACEHOLDER] Sustituye por testimonios reales (con permiso del cliente) y pon isExample: false.
export const testimonials: TestimonialsContent = {
  title: "Lo que dicen quienes ya trabajan con nosotros.",
  exampleBadge: "Testimonio de ejemplo",
  items: [
    {
      quote:
        "Texto de ejemplo. Aquí irá la opinión de un cliente real sobre cómo ha cambiado su negocio desde que tiene la nueva web.",
      name: "Nombre Apellido",
      role: "Cargo, Empresa",
      isExample: true,
    },
    {
      quote:
        "Texto de ejemplo. Un buen testimonio menciona un resultado concreto: más contactos, más ventas o menos tiempo perdido.",
      name: "Nombre Apellido",
      role: "Cargo, Empresa",
      isExample: true,
    },
    {
      quote:
        "Texto de ejemplo. Pide a tus clientes dos o tres frases sinceras sobre el proceso y el resultado final.",
      name: "Nombre Apellido",
      role: "Cargo, Empresa",
      isExample: true,
    },
  ],
};

export const faq: FaqContent = {
  title: "Preguntas frecuentes",
  intro: "Si tienes otra duda, escríbenos y te respondemos en menos de 24 horas laborables.",
  items: [
    {
      q: "¿Cuánto tarda en estar lista mi web?",
      a: "Una web sencilla suele estar lista en 2 o 3 semanas, y un proyecto más completo o una tienda online entre 4 y 6 semanas. Te damos una fecha cerrada antes de empezar.",
    },
    {
      q: "¿Cuánto cuesta una web?",
      a: "Depende de lo que necesites, por eso todos nuestros presupuestos son personalizados. Tras una primera llamada te enviamos un precio cerrado, sin costes ocultos ni compromiso.",
    },
    {
      q: "¿Os encargáis del dominio y el hosting?",
      a: "Sí. Te ayudamos a registrar el dominio y dejamos la web publicada en un hosting rápido y seguro. Todo queda a tu nombre: la web y el dominio son tuyos.",
    },
    {
      q: "¿Podré editar la web yo mismo?",
      a: "Sí, si lo necesitas. Podemos incluir un panel sencillo para que cambies textos, imágenes o publiques novedades sin tocar código, y te enseñamos a usarlo.",
    },
    {
      q: "¿Qué pasa después del lanzamiento?",
      a: "Todos los planes incluyen un periodo de soporte. Después puedes contratar el mantenimiento mensual para actualizaciones, copias de seguridad y pequeños cambios.",
    },
    {
      q: "¿Qué necesito para empezar?",
      a: "Solo una idea clara de tu negocio. Si tienes logo, textos o fotos, genial; si no, te ayudamos a prepararlos o te recomendamos cómo conseguirlos.",
    },
    {
      q: "¿La web aparecerá en Google?",
      a: "Sí. Todas nuestras webs se entregan con la base de SEO técnico hecha y dadas de alta en Google Search Console. El posicionamiento mejora con el tiempo y con contenido de calidad.",
    },
    {
      q: "¿Trabajáis con clientes de fuera de vuestra ciudad?",
      a: "Sí. Trabajamos en remoto con clientes de toda España y Latinoamérica mediante videollamadas y un canal de comunicación directo.",
    },
  ],
};

export const contact: ContactContent = {
  title: "Hablemos de tu proyecto.",
  intro:
    "Cuéntanos qué necesitas y te enviamos una propuesta sin compromiso. Sin formularios eternos ni llamadas comerciales.",
  nextStepsTitle: "Qué pasa después",
  nextSteps: [
    "Te respondemos en menos de 24 horas laborables.",
    "Hacemos una llamada de 30 minutos para conocer tu negocio.",
    "Recibes una propuesta con precio y plazos cerrados.",
  ],
  directLabel: "¿Prefieres el email?",
  form: {
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    projectType: "Tipo de proyecto",
    projectTypes: [
      "Web corporativa",
      "Tienda online",
      "Landing page",
      "Rediseño de mi web",
      "Mantenimiento o SEO",
      "Otro",
    ],
    budget: "Presupuesto aproximado",
    budgets: ["Menos de 1.000 €", "1.000 € a 2.500 €", "2.500 € a 5.000 €", "Más de 5.000 €", "Aún no lo sé"],
    selectPlaceholder: "Selecciona una opción",
    message: "Cuéntanos tu proyecto",
    messagePlaceholder: "A qué se dedica tu negocio, qué necesitas y para cuándo te gustaría tenerlo.",
    privacyPrefix: "He leído y acepto la ",
    privacyLink: "política de privacidad",
    privacySuffix: ".",
    submit: "Enviar solicitud",
    submitting: "Enviando…",
    successTitle: "Mensaje enviado.",
    successText: "Gracias por escribirnos. Te responderemos en menos de 24 horas laborables.",
    sendAnother: "Enviar otro mensaje",
    errorGeneric:
      "No hemos podido enviar tu mensaje. Inténtalo de nuevo en unos minutos o escríbenos directamente por email.",
    errorRateLimit: "Has enviado varios mensajes seguidos. Espera unos minutos y vuelve a intentarlo.",
    honeypotLabel: "Deja este campo vacío",
    errors: {
      name: "Escribe tu nombre.",
      email: "Escribe un email válido, por ejemplo nombre@dominio.com.",
      projectType: "Elige el tipo de proyecto.",
      budget: "Elige un presupuesto aproximado.",
      message: "Cuéntanos un poco más (al menos 20 caracteres).",
      privacy: "Necesitamos que aceptes la política de privacidad para responderte.",
    },
  },
};

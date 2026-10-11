import type { LegalPage } from "../types";

/*
 * Plantillas legales base. Sustituye todos los [COMPLETAR] por los datos reales
 * del titular y revisa el texto con un profesional antes de publicar.
 */

export const legal: Record<LegalPage["slug"], LegalPage> = {
  "aviso-legal": {
    slug: "aviso-legal",
    title: "Aviso legal",
    description: "Información legal sobre el titular de la web de Nuven Digital y las condiciones de uso.",
    updated: "[COMPLETAR: fecha de última actualización]",
    sections: [
      {
        heading: "Datos identificativos",
        paragraphs: [
          "En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:",
          "Titular: [COMPLETAR: nombre y apellidos o razón social]. NIF/CIF: [COMPLETAR]. Domicilio: [COMPLETAR: dirección completa]. Email: [COMPLETAR]. Teléfono: [COMPLETAR].",
          "Datos registrales (si es sociedad): [COMPLETAR: Registro Mercantil, tomo, folio, hoja e inscripción].",
        ],
      },
      {
        heading: "Objeto",
        paragraphs: [
          "Este sitio web tiene como finalidad informar sobre los servicios de diseño y desarrollo web de Nuven Digital y facilitar el contacto con potenciales clientes.",
        ],
      },
      {
        heading: "Condiciones de uso",
        paragraphs: [
          "El acceso a esta web es gratuito y atribuye la condición de usuario, que acepta las presentes condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas o contrarias a la buena fe.",
        ],
      },
      {
        heading: "Propiedad intelectual e industrial",
        paragraphs: [
          "Todos los contenidos de esta web (textos, diseño, logotipos, imágenes y código) son titularidad de [COMPLETAR: titular] o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.",
        ],
      },
      {
        heading: "Responsabilidad",
        paragraphs: [
          "El titular no se hace responsable de los daños derivados del uso de la web ni de la información contenida en sitios de terceros enlazados desde ella. Se reserva el derecho a modificar los contenidos sin previo aviso.",
        ],
      },
      {
        heading: "Legislación aplicable",
        paragraphs: [
          "Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de [COMPLETAR: ciudad], salvo que la normativa de consumidores disponga otra cosa.",
        ],
      },
    ],
  },
  privacidad: {
    slug: "privacidad",
    title: "Política de privacidad",
    description: "Cómo trata Nuven Digital los datos personales que recibe a través de su web.",
    updated: "[COMPLETAR: fecha de última actualización]",
    sections: [
      {
        heading: "Responsable del tratamiento",
        paragraphs: [
          "Responsable: [COMPLETAR: nombre o razón social]. NIF/CIF: [COMPLETAR]. Domicilio: [COMPLETAR]. Email de contacto para privacidad: [COMPLETAR].",
        ],
      },
      {
        heading: "Qué datos tratamos y para qué",
        paragraphs: [
          "A través del formulario de contacto recogemos tu nombre, tu email, el tipo de proyecto, el presupuesto aproximado y el mensaje que nos envíes. Los usamos únicamente para responder a tu solicitud y, en su caso, preparar y enviarte un presupuesto.",
        ],
      },
      {
        heading: "Base legal",
        paragraphs: [
          "La base legal es tu consentimiento, que prestas al marcar la casilla del formulario (art. 6.1.a RGPD), y la aplicación de medidas precontractuales a petición tuya (art. 6.1.b RGPD).",
        ],
      },
      {
        heading: "Cuánto tiempo conservamos los datos",
        paragraphs: [
          "Conservamos tus datos mientras sea necesario para atender tu solicitud y, si llegamos a trabajar juntos, durante la relación comercial y los plazos legales aplicables. Si no hay relación posterior, los eliminamos en un plazo máximo de [COMPLETAR: p. ej. 12 meses].",
        ],
      },
      {
        heading: "Destinatarios",
        paragraphs: [
          "No cedemos tus datos a terceros salvo obligación legal. Para enviar los mensajes del formulario usamos proveedores de servicios que actúan como encargados del tratamiento: [COMPLETAR: p. ej. Resend (envío de email) y Vercel (alojamiento)], que pueden implicar transferencias internacionales amparadas en cláusulas contractuales tipo.",
        ],
      },
      {
        heading: "Tus derechos",
        paragraphs: [
          "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a [COMPLETAR: email], indicando el derecho que quieres ejercer. También puedes retirar tu consentimiento en cualquier momento.",
          "Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Política de cookies",
    description: "Qué cookies usa la web de Nuven Digital y cómo puedes gestionarlas.",
    updated: "[COMPLETAR: fecha de última actualización]",
    sections: [
      {
        heading: "Qué son las cookies",
        paragraphs: [
          "Las cookies y tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos que una web guarda en tu dispositivo para funcionar correctamente o recordar tus preferencias.",
        ],
      },
      {
        heading: "Cookies que usamos",
        paragraphs: [
          "Técnicas y necesarias: guardamos en el almacenamiento local de tu navegador tu elección sobre cookies (clave «nuven-consent») para no volver a preguntarte. Están exentas de consentimiento porque son imprescindibles.",
          "Analíticas: actualmente no usamos cookies de análisis. [COMPLETAR: si añades una herramienta de analítica, indica aquí su nombre, finalidad, duración y proveedor]. Solo se activarán si las aceptas en el banner.",
        ],
      },
      {
        heading: "Cómo gestionar tus preferencias",
        paragraphs: [
          "Puedes cambiar tu elección en cualquier momento desde el enlace «Configurar cookies» del pie de página. También puedes bloquear o eliminar las cookies desde la configuración de tu navegador.",
        ],
      },
    ],
  },
};

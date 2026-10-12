/**
 * All on-screen copy of the motion piece. Anything marked [PLACEHOLDER] is
 * sample text or an invented figure: replace it before publishing.
 */

export const COPY = {
  brand: "NUVEN",
  brandSub: "DIGITAL",
  url: "nuvendigital.com", // [PLACEHOLDER] final domain

  hud: {
    left: "NUVEN DIGITAL — SHOWREEL 2026", // [PLACEHOLDER] year / title
    right: "nuvendigital.com", // [PLACEHOLDER]
  },

  /** Scene names shown in the small HUD label (01 / 07 — ...). */
  sceneNames: ["MARCA", "MOVIMIENTO", "SERVICIOS", "PROYECTOS", "RESULTADOS", "ESTRATEGIA", "CONTACTO"],

  tilesCaption: "DISEÑO WEB · DESARROLLO · SEO",

  /** Scene 3 rows and the solid word that changes on the beat. */
  kineticWords: ["DISEÑO", "VELOCIDAD", "SEO", "RESULTADOS"],

  /** Scene 4 — generic website mock-ups (no real brands). */
  mockups: {
    landing: { brand: "Tu marca", title: "Una web que trabaja por ti", cta: "Empezar" }, // [PLACEHOLDER]
    shop: { brand: "Tienda", title: "Nueva colección" }, // [PLACEHOLDER]
    dashboard: { brand: "Panel", title: "Resumen semanal" }, // [PLACEHOLDER]
    studio: { brand: "Estudio", title: "Proyectos seleccionados" }, // [PLACEHOLDER]
  },
  cardsCaption: "PROYECTOS A MEDIDA",

  /** Scene 5 — every figure here is sample data. */
  metrics: {
    counterLabel: "TRÁFICO ORGÁNICO · DATO DE EJEMPLO", // [PLACEHOLDER]
    counterValue: 312, // [PLACEHOLDER] shown as +312%
    counterSub: "en 6 meses", // [PLACEHOLDER]
    chartTitle: "Visitas / mes", // [PLACEHOLDER]
    bars: [18, 22, 21, 30, 34, 33, 45, 52, 58, 66, 79, 92], // [PLACEHOLDER] 0–100
    ringLabel: "Conversión", // [PLACEHOLDER]
    ringValue: 78, // [PLACEHOLDER] %
    toggles: ["SEO técnico", "Velocidad", "Analítica"],
    button: "Empezar proyecto",
    phrase: ["Más visitas", "Más clientes", "Más ventas"], // [PLACEHOLDER] editable
  },

  /** Scene 7 — closing line; `highlight` is the index of the emphasised word. */
  closing: { words: ["Hagamos", "realidad", "tu", "idea"], highlight: 1 },
};

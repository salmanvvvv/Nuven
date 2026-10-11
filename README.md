# Nuven Digital

Web de la agencia **Nuven Digital**: una landing de una sola página orientada a captar clientes, con páginas legales, formulario de contacto con envío por email y SEO técnico completo.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Resend

## Puesta en marcha

Requisitos: Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local   # opcional en local
npm run dev                  # http://localhost:3000
```

Otros comandos:

| Comando             | Qué hace                            |
| ------------------- | ----------------------------------- |
| `npm run build`     | Build de producción                 |
| `npm run start`     | Sirve el build de producción        |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | Comprobación de tipos de TypeScript |

## Estructura

```
src/
  app/                  Rutas, layout, metadata, API y ficheros SEO
    (legal)/            Aviso legal, privacidad y cookies
    api/contact/        Endpoint del formulario (validación, antispam, Resend)
    icon.svg, apple-icon.png, favicon.ico, opengraph-image.tsx
    sitemap.ts, robots.ts, manifest.ts
  content/              TODOS los textos de la web
    types.ts            Forma común de los textos (sirve para añadir idiomas)
    es/site.ts          Marca, contacto, navegación, redes, pie y banner de cookies
    es/home.ts          Secciones de la página principal
    es/legal.ts         Textos legales
  sections/             Secciones de la página (Hero, Servicios, Planes...)
  components/           Piezas reutilizables (botones, logo, formulario...)
  lib/                  Utilidades (validación, datos estructurados, URL)
public/
  brand/                Logo original
  projects/             Imágenes del portfolio
```

## Editar contenidos

No hace falta tocar componentes: todo el texto está en `src/content/es/`.

- **Planes, servicios, FAQ, proyectos y testimonios:** `src/content/es/home.ts`
- **Email, teléfono, ciudad, redes sociales y navegación:** `src/content/es/site.ts`
- **Textos legales:** `src/content/es/legal.ts`

Busca `[PLACEHOLDER]` y `[COMPLETAR]` en el proyecto para encontrar todo lo que debes sustituir.

**Proyectos:** la sección muestra las webs de `projects.items` en `home.ts` (nombre y enlace). Mientras no tengan captura se ve una tarjeta con el nombre y el dominio. Para mostrar la web real, guarda una captura en `public/projects/` (1600 × 1000 px, `.webp`) y añade `image: "/projects/nombre.webp"` y `alt` al proyecto. Opcionalmente, `category` (p. ej. «Web corporativa · 2026») sustituye al dominio bajo el título.

**Planes:** todos muestran «Precio personalizado». Cambia el texto en `plans.items[].price` si algún día quieres mostrar precios.

**Testimonios:** sustituye los textos en `testimonials.items` y pon `isExample: false`.

**Añadir inglés más adelante:** crea `src/content/en/` con la misma forma que `es` (el tipo `Dictionary` te avisará de lo que falte) y regístralo en `src/content/index.ts`. Después, añade un segmento `[locale]` en `src/app`.

## Variables de entorno

Copia `.env.example` a `.env.local` (en local) o configúralas en Vercel:

| Variable               | Descripción |
| ---------------------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública sin barra final, p. ej. `https://nuvendigital.com`. Se usa en metadata, sitemap, robots y Open Graph. |
| `RESEND_API_KEY`       | Clave de [Resend](https://resend.com) para enviar los emails del formulario. |
| `CONTACT_TO_EMAIL`     | Dirección que recibe las solicitudes. |
| `CONTACT_FROM_EMAIL`   | Remitente verificado en Resend, p. ej. `Nuven Digital <web@nuvendigital.com>`. Mientras no verifiques tu dominio puedes usar `onboarding@resend.dev`. |

**Sin `RESEND_API_KEY`:** en desarrollo el formulario funciona y el mensaje se muestra en la consola del servidor. En producción el endpoint responde con un error (503) para que ningún contacto se pierda sin que te enteres, así que configura la clave antes de publicar.

### Antispam

El formulario incluye un campo trampa (honeypot), descarta los envíos hechos en menos de 2,5 segundos y limita a 5 envíos cada 10 minutos por IP. El límite vive en memoria; si algún día recibes mucho spam, cámbialo por un almacén compartido (por ejemplo Upstash Redis).

## Despliegue en Vercel

1. En [vercel.com/new](https://vercel.com/new) importa este repositorio de GitHub. Vercel detecta Next.js automáticamente.
2. En **Settings → Environment Variables** añade las variables de la tabla anterior.
3. Pulsa **Deploy**.
4. En **Settings → Domains** conecta tu dominio, actualiza `NEXT_PUBLIC_SITE_URL` con él y vuelve a desplegar.
5. En [Resend](https://resend.com/domains) verifica tu dominio para poder enviar desde tu propia dirección.
6. Da de alta la web en Google Search Console y envía `https://tu-dominio/sitemap.xml`.

## Cookies y analítica

El banner guarda la elección del usuario en `localStorage` (`nuven-consent`) y se puede reabrir desde «Configurar cookies» en el pie. Ahora mismo la web no carga ninguna cookie de análisis. Si añades analítica, cárgala solo cuando `readConsent()?.analytics` sea `true` (en `src/components/CookieBanner.tsx`) y actualiza la política de cookies.

## Calidad

Medido con Lighthouse sobre el build de producción:

| Página              | Performance | Accessibility | Best Practices | SEO |
| ------------------- | ----------- | ------------- | -------------- | --- |
| Inicio (móvil)      | 95–96       | 100           | 100            | 100 |
| Inicio (escritorio) | 100         | 100           | 100            | 100 |

Revisado a 360, 768, 1280 y 1920 px sin scroll horizontal. Las animaciones respetan `prefers-reduced-motion`.

## Skills de Claude Code incluidas

- `.claude/skills/emil-design-eng`: [skill de diseño de Emil Kowalski](https://github.com/emilkowalski/skills) (MIT, commit 2d22863).
- `.claude/skills/impeccable`: [Impeccable](https://github.com/pbakaus/impeccable), de Paul Bakaus (Apache 2.0, commit c63b8dd, v4.5.2). Empieza con `/impeccable init`.
- `.claude/skills/design-taste-frontend`: [Taste Skill](https://github.com/Leonxlnx/taste-skill), de Leonxlnx (MIT, commit 717446e, `taste-skill` v2).

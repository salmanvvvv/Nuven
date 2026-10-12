# Nuven Digital · Motion

Vídeo de motion graphics de la agencia (≈22 s, loop limpio) construido como animación programada:
**HyperFrames** (composición HTML + render a vídeo) · **GSAP** (timeline maestro) · **Three.js** (baldosas 3D, tarjetas 3D, partículas) · **Canvas 2D** (UI, tipografía, gráficos) · un pase final **WebGL** (lente fisheye, bloom, motion blur en transiciones, grano y viñeta).

Todo es determinista: cada fotograma es una función pura del tiempo `t`, así que se puede buscar (seek) cualquier instante y renderizar fotograma a fotograma.

## Comandos

```bash
cd motion
npm install

npm run dev          # reproductor de vista previa (play/pausa/scrub, 16:9 ↔ 9:16) → http://localhost:5174/player.html
npm run preview      # HyperFrames Studio (timeline, scrub, edición)
npm run sheet        # contact sheet de fotogramas clave → renders/contact-sheet-16x9.jpg
npm run lint         # validación HyperFrames de las dos composiciones
npm run typecheck

npm run render       # build + render HyperFrames 16:9 y 9:16 + exportación → ../public/video/
npm run render -- --only=h        # solo 16:9   (--only=v solo vertical)
npm run render -- --skip-render   # re-exporta los masters ya renderizados
npm run render:playwright         # alternativa sin HyperFrames: Playwright llama a window.seek(t) a 30 fps
```

Render local: HyperFrames usa el Chromium headless preinstalado (`HYPERFRAMES_BROWSER_PATH`, lo pone `scripts/render.mjs`); Playwright usa `/opt/pw-browsers/chromium`. No hace falta `playwright install`. Sin GPU, el WebGL va por software: unos 10–12 min por formato.

### Entregables (`out/` y copia en `../public/video/`)

| Fichero | Formato |
| --- | --- |
| `nuven-motion.mp4` | H.264 High, yuv420p, 1920×1080, 30 fps, `+faststart`, sin audio, < 4 MB |
| `nuven-motion.webm` | VP9, mismo contenido |
| `nuven-motion-vertical.mp4` | 1080×1920 (9:16) para redes |
| `nuven-motion-poster.jpg` / `nuven-motion-vertical-poster.jpg` | fotograma del logo (t = 2,9 s) |

`scripts/export.mjs` codifica a dos pasadas con el bitrate que garantiza < 4 MB (MP4 y WebM).

## Estructura

```
index.html              composición HyperFrames 16:9 (canvas #stage + registro del timeline)
vertical/index.html     composición 9:16 (mismo motor; build/ y assets/ son enlaces simbólicos)
player.html             reproductor de vista previa (Vite)
src/
  config.ts             ⏱ tiempos de cada escena, duración, paleta, post-proceso
  content.ts            ✏️ todos los textos y cifras ([PLACEHOLDER] = sustituir)
  engine.ts             motor: canvas de composición + timeline maestro GSAP + window.seek
  compose.ts            qué escena se ve en cada instante, transiciones y curva de post-proceso
  post.ts               pase WebGL final (fisheye, bloom, motion blur, grano, viñeta)
  transitions.ts        barrido con la cinta de la N, barrido de haz de luz, iris
  draw.ts / brand.ts    marca (paths de la N), lockup del logo, texto con tracking, HUD
  mockups.ts            maquetas de webs genéricas (sin marcas reales)
  scenes/               intro · tiles · type · lens · cards · metrics · particles · outro
scripts/                render.mjs · export.mjs · render-playwright.mjs
```

## Guion

| # | Tiempo | Escena | Transición de salida |
| - | --- | --- | --- |
| 1 | 0–3,2 s | Rejilla, punto de luz, haz horizontal, escáner, la cinta forma la N, NUVEN/DIGITAL | el logo atraviesa la cámara + iris |
| 2 | 3,2–6 s | Baldosas 3D en ola, cámara cenital → perspectiva en órbita | barrido de la cinta blanca |
| 3 | 6–8,75 s | Filas con contorno + palabra sólida al ritmo (fondo blanco, invierte a negro) | pantalla curva (fisheye) |
| 4 | 8,75–13 s | 4 cuadrantes con webs → tarjetas 3D con borde luminoso y desenfoque de profundidad | barrido de la cinta (inverso) |
| 5 | 13–16 s | +312 % (ejemplo), barras + tendencia, anillo, tarjeta con toggles y botón | haz de luz vertical |
| 6 | 16–18,4 s | Partículas: flujo → anillo → vórtice que converge | destello a blanco |
| 7 | 18,4–22 s | «Hagamos realidad tu idea» (cinta negra resalta «realidad»), logo + URL, colapso al punto de luz | negro = fotograma 0 → loop |

## Cómo cambiar…

**Textos y cifras** → `src/content.ts`. Busca `[PLACEHOLDER]`: URL, año del HUD, contador +312 %, barras, anillo, frase «Más visitas · Más clientes · Más ventas», textos de las maquetas. La frase final y qué palabra se resalta: `COPY.closing` (`highlight` es el índice).

**Duración / ritmo** → `src/config.ts`:
- `T` = segundo en el que empieza cada escena. Las animaciones de cada escena están escritas en tiempo relativo a su inicio, así que mover un `T` mueve la escena entera con sus transiciones (definidas en `compose.ts → X`).
- Si cambias la duración total, actualiza `DURATION` **y** `data-duration` en `index.html` y `vertical/index.html`.
- Ritmos internos: `TYPE_BEATS` (cambios de palabra, `scenes/type.ts`), `OUTRO` (cierre, `scenes/outro.ts`), `PARTICLE_FORM/COLLAPSE` (`scenes/particles.ts`).

**Colores** → `src/config.ts → C` (paleta monocroma) y `POST` (grano, viñeta, bloom). Los degradados de la N están en `draw.ts → drawMark` (iguales que en la web). Para la variante con acento cálido bastaría con cambiar el blanco de `glow()`/haces/bordes por un tono cálido muy suave; no está aplicada (por defecto, monocromo).

**Volver a renderizar** → `npm run render`. Después, en la web: `npm run build` en la raíz (los ficheros ya quedan en `public/video/`).

## Integración en la web

- `src/components/MotionHero.tsx`: `<video autoPlay muted loop playsInline preload="metadata" poster>` con fuentes WebM + MP4. Primero pinta el poster (next/image, `fetchPriority="high"` en el hero) para no perjudicar el LCP; el vídeo se monta tras hidratar (o al acercarse al viewport con `lazy`) y aparece con un fundido cuando ya se reproduce. Con `prefers-reduced-motion` solo se ve el poster. Sin `label` es decorativo (`aria-hidden`); con `label`, `role="img"` + `aria-label`.
- Hero (`src/sections/Hero.tsx`): `<MotionHero priority />` decorativo.
- Showreel (`src/sections/Showreel.tsx` + `ShowreelPlayer.tsx`): marco con borde 1px blanco al 10 %, esquinas redondeadas, carga diferida y botón de pausa. Se oculta con `showreel.enabled = false` en `src/content/es/home.ts`.

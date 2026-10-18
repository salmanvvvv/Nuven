# Nuven Digital — «Veinte años en esta calle» (vídeo vertical para redes)

Martín lleva 20 años con su ferretería, pero los clientes se van a la tienda nueva porque a él no lo encuentran en el móvil. Nuven Digital (la mascota de cinta blanca) le hace una web.
Hecho con **HyperFrames** (HTML + GSAP), a partir de la voz real (`assets/voz.mp3`, que no se toca).

## Entregables (`out/`)

| Fichero | Qué es |
| --- | --- |
| `nuven-avatares-9x16.mp4` | 1080×1920 · 30 fps · H.264 · AAC · −14 LUFS (TikTok, Reels, Shorts) |
| `nuven-avatares-1x1.mp4` · `nuven-avatares-16x9.mp4` | reencuadres: el mismo diseño escalado, con la calle más ancha a los lados |
| `nuven-avatares.srt` | subtítulos (también van quemados en el vídeo) |
| `poster.jpg` (+ `poster-1x1.jpg`, `poster-16x9.jpg`) | miniatura de la tarjeta final |
| `timing.json` · `creditos.md` · `guion.md` | mapa de tiempos, licencias y guion exacto |

## Cómo funciona

```
assets/voz.mp3 ──► npm run asr     (Whisper small offline, por tramos entre pausas → content/asr.json)
content/guion.json ─┐
                    ├► npm run timing  (scripts/timing.py → content/timing.json, subtitulos.srt, assets/timing.js)
content/asr.json ───┘
content/timing.json ─► npm run audio   (voz con EQ y normalizada, música y efectos en los tiempos exactos, carve)
                    └► npm run build   (src/template.html → index.html, cuadrado/, horizontal/)
npm run render:all  ─► renders/master-*.mp4 ─► npm run export ─► out/
```

- **Todo sale de `content/timing.json`:** cada escena, cada palabra clave (el resaltado de los subtítulos y lo que dispara en pantalla), cada efecto de sonido y cada página de subtítulos.
- **Si cambias la voz:**
  1. Sustituye `assets/voz.mp3`.
  2. Ajusta el texto de `content/guion.json`.
  3. Ejecuta `npm run asr && npm run timing && npm run audio && npm run render:all`.
- **Modelo para `npm run asr`:** se descarga de las releases de GitHub de sherpa-onnx:
  ```bash
  mkdir -p models && curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj -C models
  pip install sherpa-onnx numpy
  ```

## Qué cambiar a mano

- **`@[USUARIO]`:** el usuario de la cuenta, en `src/template.html` (tarjeta «Síguenos»). Después, `npm run build && npm run render:all`.
- **[PLAZO]:** no se muestra ningún plazo de entrega. Si quieres uno, confírmalo y se añade.
- **Licencia de la voz:** comprueba que se generó con un plan de pago de ElevenLabs (ver `content/creditos.md`).
- **Volúmenes:** `MUSIC_VOL` y `SFX_VOL` en `scripts/build.mjs`; la intensidad del ducking, en `--strength`.
- **Datos de ejemplo:** «Ferretería Martín», «Ferretería Nova», las reseñas y los precios son ficticios y llevan la etiqueta «Ejemplo ilustrativo».

## Comandos

```bash
npm install                 # @hyperframes/core (para el carve)
npm run check               # lint + runtime + maquetación + contraste
npx hyperframes preview     # Studio
npm run render:all          # build + 3 renders + exportación a out/
```

# Nuven Digital — vídeo informativo «¿Tu negocio existe en internet?»

Vídeo de unos 59 s en español: educa sobre cuántos pequeños negocios tienen o no web y por qué importa, y cierra con Nuven Digital. Construido con **HyperFrames** (workflow `faceless-explainer`): HTML + GSAP, voz en off local (Kokoro), música y efectos generados por código, carve de la música contra la voz y subtítulos sincronizados por construcción.

## Entregables (`out/`)

| Fichero | Qué es |
| --- | --- |
| `nuven-informativo-16x9.mp4` | 1920×1080 · H.264 · 30 fps · AAC · −14 LUFS · < 15 MB |
| `nuven-informativo-9x16.mp4` | 1080×1920 para Reels, TikTok y Shorts (márgenes seguros) |
| `nuven-informativo.srt` | subtítulos en español |
| `poster.jpg` · `poster-9x16.jpg` | miniaturas (tarjeta final: logo + «Hablemos de tu proyecto») |
| `guion.md` · `datos.md` · `creditos.md` | guion con tiempos, fuentes de cada cifra, licencias |

## Cómo está hecho

```
content/narracion.json   ← texto de la locución y de los subtítulos ({dicho|en pantalla})
        │  npm run voice   (scripts/voice.py: Kokoro frase a frase + tiempos por palabra)
        ▼
assets/audio/narration.wav · content/timings.json · content/subtitulos.srt
        │  scripts/cues.mjs: momento exacto de cada cifra («64 %», «28 %»…)
        ▼
assets/cues.js ──► npm run music (scripts/music.mjs: música + SFX en esos momentos)
        │
        ▼  npm run build (scripts/build.mjs: src/template.html → index.html + vertical/index.html, carve)
HyperFrames ──► npm run render:all ──► out/
```

Los contadores, las barras, el anillo, los iconos y los efectos de sonido arrancan en la palabra exacta que dice la voz. Si cambias el texto o la voz, todo se reajusta solo.

## Comandos

```bash
npm install                 # @hyperframes/core (para el carve)
# los WAV de assets/audio no están en el repo: se regeneran con `npm run audio`
pip install kokoro-onnx soundfile && apt-get install espeak-ng   # voz local

npm run voice               # regenera la locución, los tiempos y el .srt
npm run music               # regenera música + SFX con los nuevos tiempos
npm run build               # regenera index.html y vertical/index.html (+ carve)
npm run audio               # los tres anteriores seguidos
npm run dev                 # HyperFrames Studio (preview editable)
npm run check               # lint + runtime + maquetación + contraste
npm run render:all          # build + render 16:9 y 9:16 + exportación a out/
```

## Qué cambiar a mano

- **Contacto:** en `src/template.html`, busca `[WEB PLACEHOLDER] · [EMAIL PLACEHOLDER]` y luego ejecuta `npm run render:all`.
- **Locución:** edita `content/narracion.json` (los números, en letras en la parte «dicha») y ejecuta `npm run audio && npm run render:all`.
- **Voz:** cambia `"voice"` en `content/narracion.json` (`ef_dora`, `em_alex`…). Para usar una voz profesional (ElevenLabs o locutor), sustituye `assets/audio/narration.wav` y ajusta `content/timings.json`; o pídeme que lo conecte con su API.
- **Cifras o fuentes:** el texto en pantalla y las etiquetas «Fuente: …» están en `src/template.html`; las fuentes completas, en `content/datos.md`. Si cambias una cifra, cámbiala en los tres sitios: locución, plantilla y `datos.md`.
- **Volumen de música y efectos:** `MUSIC_VOL` y `SFX_VOL` en `scripts/build.mjs`; la intensidad del carve, en `--strength`.

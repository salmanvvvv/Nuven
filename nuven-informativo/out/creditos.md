# Créditos y licencias — «¿Tu negocio existe en internet?» · Nuven Digital

## Voz en off
- **Motor:** Kokoro-82M (TTS local, sin conexión) vía `kokoro-onnx`, con la voz **`ef_dora`** (femenina, español) a velocidad 1.0. Fonética del español con `espeak-ng`.
- **Licencia:** los pesos de Kokoro-82M se publican con licencia **Apache 2.0**, que permite el uso comercial. `kokoro-onnx` tiene licencia MIT y `espeak-ng`, GPL-3.0 (solo se usa como herramienta; no se distribuye con el vídeo).
- **Por qué esta voz:** en el entorno no había claves de HeyGen, ElevenLabs ni de otros proveedores. Kokoro es el TTS local que ofrece `/media-use`.
- **Limitación honesta:** la voz es sintética y el acento no es plenamente de España. Además, no pude escucharla: la elegí y la comprobé por medios técnicos (pronunciación vía espeak y sincronía).
- **Mejora recomendada:** ElevenLabs (`eleven_multilingual_v2`) con una voz es-ES, o una locución humana. Para cambiarla basta con sustituir `assets/audio/narration.wav`, volver a calcular los tiempos (`npm run voice`) y reconstruir (`npm run build`).

## Música de fondo
- **Origen:** composición original **generada por código** en `scripts/music.mjs`: síntesis propia (osciladores, filtros y reverb escritos en el proyecto), sin samples ni grabaciones de terceros.
- **Estilo:** electrónica minimalista suave a 96 BPM, en La menor (Am9 – Fmaj7 – Cmaj7 – G6/9), la misma armonía que el reel de marca de Nuven.
- **Licencia:** obra propia de Nuven Digital, libre de derechos de terceros. Se puede usar en web, redes y anuncios sin atribución.

## Efectos de sonido
- **Origen:** generados por código en el mismo `scripts/music.mjs`: whooshes de transición, ticks de contador, «pops» de iconos, golpe suave y campana del logo. No se usan librerías de efectos.
- **Licencia:** obra propia, libre de derechos de terceros.

## Tipografía
- **Sora** (Jonathan Barnbrook y Julián Moncada), con **SIL Open Font License 1.1** (`assets/fonts/OFL-Sora.txt`). La fuente se incluye en el proyecto.

## Logotipo
- «N» de cinta plegada y wordmark de Nuven Digital: propiedad de Nuven Digital. Los paths vectoriales vienen de `src/components/brand-paths.ts` de la web.

## Software
- **HyperFrames (HeyGen):** composición, previsualización y render.
- **GSAP 3** (GreenSock, licencia «Standard No Charge», gratuita también para uso comercial): animación.
- **FFmpeg:** codificación y normalización de sonoridad (EBU R128, −14 LUFS).
- Componentes del registry de HyperFrames: `grain-overlay` y `vignette`.

## Datos
- Ver `datos.md`: Clutch (2025), INE (ETICCE 2024–2025) y BrightLocal (2026), con enlaces, muestras y notas sobre interés comercial.

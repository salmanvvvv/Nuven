# Créditos y licencias — «¿Tu negocio existe en internet?» · Nuven Digital

## Voz en off
- **Locución:** ElevenLabs, voz de la Voice Library **«Martin Osborne — Polished and Energetic»** (Professional Voice Clone), en español. La generó el cliente y se entregó como `assets/audio/voz-elevenlabs.mp3`.
- **Integración:** `scripts/align.py` encuentra las pausas reales de la toma, las asigna a las frases y comas del guion (12/12 frases y 9/10 comas ancladas) y calcula los tiempos de cada palabra. De ahí salen los subtítulos y el `.srt`. La toma no se edita; solo se añade algo de aire en los cambios de escena y se normaliza a −16 LUFS antes de la mezcla final.
- **Licencia — revisar:** el uso comercial de voces de ElevenLabs requiere un **plan de pago** activo en el momento de generar el audio. El plan gratuito exige atribución y no permite uso comercial. Si se generó con el plan gratuito, vuelve a generarlo con un plan de pago antes de publicar el vídeo en canales de la agencia.
- *Versión anterior (descartada):* Kokoro-82M `ef_dora`, TTS local (Apache 2.0). Sigue disponible con `npm run voice`.

## Música de fondo
- **Origen:** composición original **generada por código** en `scripts/music.mjs`: síntesis propia (piano eléctrico FM, bajo, bombo, shaker, palmas, pad y arpegio), sin samples ni grabaciones de terceros.
- **Estilo:** pop electrónico cálido y luminoso a 112 BPM, en Do mayor (Fmaj9 – G6 – Em7 – Am7), con resolución en Cmaj9 sobre la tarjeta final. Se eligió más enérgica que la primera versión (La menor, 96 BPM) para acompañar a la nueva voz.
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
